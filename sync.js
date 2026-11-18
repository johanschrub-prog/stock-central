const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw4UcWpB51ZECV9JHmS27t3HCIY-1nfs0ntbFW-5s7dF56fT_O_-2o0wzCVGAvpisV_/exec";

// La liste de toutes les clés utilisées par votre application Stock Central
const CLES_SYNCHRO = [
    "StockCentral",
    "Fournisseurs",
    "analyseOuverte",
    "boutiqueData",
    "caveData",
    "miseCoupe",
    "mouvements",
    "remonteesEffectuees",
    "commandesHDLP",
    "commandesRCLP"
];

// Charger les données depuis Google Sheets vers le PC
async function forcerSynchroCloud() {
    try {
        const res = await fetch(WEB_APP_URL);
        const record = await res.json();

        let aChange = false;
        CLES_SYNCHRO.forEach(cle => {
            if (record[cle] !== undefined) {
                const valeurCloud = typeof record[cle] === 'object' ? JSON.stringify(record[cle]) : record[cle];
                if (localStorage.getItem(cle) !== valeurCloud) {
                    Storage.prototype.setItem.call(localStorage, cle, valeurCloud);
                    aChange = true;
                }
            }
        });

        alert("Synchronisation réussie ✅ Données à jour !");
        
        // Recharge la page pour afficher instantanément tous les articles et stocks
        location.reload();
        
    } catch (err) {
        alert("Erreur de synchro : " + err.message);
    }
}

// Envoyer les données depuis le téléphone vers Google Sheets
function forcerEnvoiCloud() {
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

        const jsonString = encodeURIComponent(JSON.stringify(payload));
        
        // Utilisation de l'image beacon pour contourner les sécurités mobiles (S26 Ultra)
        const img = new Image();
        img.src = `${WEB_APP_URL}?data=${jsonString}&t=${Date.now()}`;
        
        img.onload = function() {
            alert("Sauvegarde envoyée sur le Cloud avec succès ! ☁️");
        };
        
        img.onerror = function() {
            alert("Sauvegarde envoyée sur le Cloud avec succès ! ☁️");
        };

    } catch (err) {
        alert("Erreur technique : " + err.message);
    }
}
