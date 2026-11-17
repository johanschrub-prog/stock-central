const BIN_ID = "6afc68fbffd5d16053c8b88a";
const API_KEY = "$2a$10$RDB9sEgB1x8MNd5dxc.yoevNYLh7Vwz62.Wfw6WpSJ/DDzd/t0SKe";

// Liste des clés à synchroniser entre le PC et le téléphone
const CLES_SYNCHRO = [
    "inventaireHDLP",
    "commandesHDLP",
    "commandesRCLP",
    "stockParCave",
    "catalogueArticles",
    "memoCaves",
    "mouvements",
    "fournisseurs"
];

let syncTimeout = null;
let donneesCloudCache = {};

// 1. Chargement initial et manuel depuis JSONBin vers le localStorage
async function initialiserSynchroCloud(force = false) {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        if (!res.ok) return;
        
        const data = await res.json();
        const record = data.record || {};
        donneesCloudCache = record;

        let aChange = false;
        CLES_SYNCHRO.forEach(cle => {
            if (record[cle] !== undefined) {
                const valeurCloud = JSON.stringify(record[cle]);
                if (localStorage.getItem(cle) !== valeurCloud) {
                    // On utilise la méthode native pour ne pas déclencher un renvoi inutile
                    Storage.prototype.setItem.call(localStorage, cle, valeurCloud);
                    aChange = true;
                }
            }
        });

        // Si de nouvelles données ont été récupérées ou si c'est forcé, on recharge les variables en mémoire
        if (aChange || force) {
            if (typeof commandesHDLP !== "undefined") commandesHDLP = JSON.parse(localStorage.getItem("commandesHDLP")) || [];
            if (typeof commandesRCLP !== "undefined") commandesRCLP = JSON.parse(localStorage.getItem("commandesRCLP")) || [];
            if (typeof inventaire !== "undefined") {
                inventaire = JSON.parse(localStorage.getItem("inventaireHDLP")) || {};
                if (typeof charger === "function") charger();
            }
            if (typeof catalogueArticles !== "undefined") catalogueArticles = JSON.parse(localStorage.getItem("catalogueArticles")) || catalogueArticles;
            if (typeof stockParCave !== "undefined") stockParCave = JSON.parse(localStorage.getItem("stockParCave")) || stockParCave;
            if (typeof memoCaves !== "undefined") memoCaves = JSON.parse(localStorage.getItem("memoCaves")) || memoCaves;
            
            // Rafraîchit l'affichage de l'application si la fonction render existe
            if (typeof render === "function") render();
            
            console.log("Synchronisation Cloud terminée ✅");
            if (force) alert("Synchronisation réussie ✅ Données à jour !");
        } else if (force) {
            alert("Les données étaient déjà à jour ✅");
        }
    } catch (err) {
        console.warn("Mode hors-ligne : utilisation des données locales.", err);
        if (force) alert("Erreur : Impossible de joindre le cloud (vérifiez votre connexion internet).");
    }
}

// Fonction appelée par le bouton "Synchroniser maintenant"
function forcerSynchroCloud() {
    initialiserSynchroCloud(true);
}
// Fonction pour forcer l'envoi immédiat de toutes les données locales vers le Cloud (depuis le téléphone)
async function forcerEnvoiCloud() {
    try {
        let payload = {};
        CLES_SYNCHRO.forEach(cle => {
            const val = localStorage.getItem(cle);
            if (val !== null) {
                try {
                    payload[cle] = JSON.parse(val);
                } catch (e) {
                    payload[cle] = val;
                }
            }
        });

        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Sauvegarde envoyée sur le Cloud avec succès ! ☁️\nVous pouvez maintenant aller sur le PC et cliquer sur 'Synchroniser'.");
        } else {
            alert("Erreur lors de l'envoi vers le Cloud.");
        }
    } catch (err) {
        console.error("Erreur :", err);
        alert("Erreur de connexion avec le Cloud.");
    }
}
// 2. Envoi groupé vers JSONBin (évite de saturer l'API si plusieurs sauvegardes s'enchaînent)
function planifierEnvoiCloud() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
        try {
            // Récupère l'état le plus récent avant d'écrire pour éviter d'écraser une modif faite ailleurs
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                headers: { "X-Master-Key": API_KEY }
            });
            let payload = {};
            if (getRes.ok) {
                const current = await getRes.json();
                payload = current.record || {};
                delete payload.test; // Nettoie la clé de test initiale
            }

            CLES_SYNCHRO.forEach(cle => {
                const val = localStorage.getItem(cle);
                if (val !== null) {
                    try {
                        payload[cle] = JSON.parse(val);
                    } catch (e) {
                        payload[cle] = val;
                    }
                }
            });

            await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": API_KEY
                },
                body: JSON.stringify(payload)
            });
            console.log("Données sauvegardées sur le Cloud ☁️");
        } catch (err) {
            console.error("Erreur d'envoi vers JSONBin :", err);
        }
    }, 1000); // Attend 1 seconde après la dernière action avant d'envoyer
}

// 3. Interception automatique de chaque sauvegarde locale
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (CLES_SYNCHRO.includes(key)) {
        planifierEnvoiCloud();
    }
};

// Lancement immédiat au chargement de la page
initialiserSynchroCloud(false);
