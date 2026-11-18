const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw4UcWpB51ZECV9JHmS27t3HCIY-1nfs0ntbFW-5s7dF56fT_O_-2o0wzCVGAvpisV_/exec";

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

// Charger les données depuis Google Sheets (PC ou Téléphone)
async function forcerSynchroCloud() {
    try {
        const res = await fetch(WEB_APP_URL);
        const record = await res.json();

        let aChange = false;
        CLES_SYNCHRO.forEach(cle => {
            if (record[cle] !== undefined) {
                const valeurCloud = JSON.stringify(record[cle]);
                if (localStorage.getItem(cle) !== valeurCloud) {
                    Storage.prototype.setItem.call(localStorage, cle, valeurCloud);
                    aChange = true;
                }
            }
        });

        if (aChange || typeof render === "function") {
            if (typeof render === "function") render();
            alert("Synchronisation réussie ✅ Données à jour !");
        } else {
            alert("Les données étaient déjà à jour ✅");
        }
    } catch (err) {
        alert("Erreur de synchro : " + err.message);
    }
}

// Envoyer les données via une requête GET (contourne tous les blocages mobiles)
async function forcerEnvoiCloud() {
    try {
        let payload = {};
        CLES_SYNCHRO.forEach(cle => {
            const val = localStorage.getItem(cle);
            if (val !== null) {
                try { payload[cle] = JSON.parse(val); } catch (e) { payload[cle] = val; }
            }
        });

        // On encode toutes les données proprement dans l'URL pour passer incognito
        const jsonString = encodeURIComponent(JSON.stringify(payload));
        const urlComplate = `${WEB_APP_URL}?data=${jsonString}`;

        const res = await fetch(urlComplate);
        
        if (res.ok) {
            alert("Sauvegarde envoyée sur le Cloud avec succès ! ☁️");
        } else {
            alert("Erreur lors de l'envoi.");
        }
    } catch (err) {
        alert("Erreur technique : " + err.message);
    }
}
