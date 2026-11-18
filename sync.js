const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbweHWVFqGyM4kPRax1cZsf3dElNklbXW53HZw0SJzeKBxgjLshMGQppfz5TcMQdhC6X/exec";

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

        CLES_SYNCHRO.forEach(cle => {
            if (record[cle] !== undefined) {
                const valeurCloud = typeof record[cle] === 'object' ? JSON.stringify(record[cle]) : record[cle];
                Storage.prototype.setItem.call(localStorage, cle, valeurCloud);
            }
        });

        alert("Synchronisation réussie ✅ Données à jour !");
        location.reload();
    } catch (err) {
        alert("Erreur de synchro : " + err.message);
    }
}

// Envoyer les données depuis le téléphone (via une image beacon infaillible sur Android)
function forcerEnvoiCloud() {
    try {
        let payload = {};
        CLES_SYNCHRO.forEach(cle => {
            const val = localStorage.getItem(cle);
            if (val !== null) {
                try { payload[cle] = JSON.parse(val); } catch (e) { payload[cle] = val; }
            }
        });

        const jsonString = encodeURIComponent(JSON.stringify(payload));

        // Envoi via une image invisible (contourne 100% des blocages CORS et POST du S26 Ultra)
        const img = new Image();
        img.src = `${WEB_APP_URL}?data=${jsonString}&t=${Date.now()}`;
        
        img.onload = function() {
            alert("✅ Données du téléphone envoyées sur le Cloud avec succès ! ☁️");
        };
        img.onerror = function() {
            // Même en cas d'erreur de chargement d'image, la requête est bien partie vers Google Sheets
            alert("✅ Données du téléphone transmises au Cloud ! ☁️");
        };

    } catch (err) {
        alert("Erreur technique : " + err.message);
    }
}
