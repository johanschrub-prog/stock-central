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

// 1. Charger les données depuis Google Sheets vers le PC
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
        location.reload();
        
    } catch (err) {
        alert("Erreur de synchro : " + err.message);
    }
}

// 2. Envoyer les données vers Google Sheets
async function forcerEnvoiCloud() {
    try {
        let payload = {};
        CLES_SYNCHRO.forEach(cle => {
            const val = localStorage.getItem(cle);
            if (val !== null) {
                try { payload[cle] = JSON.parse(val); } catch (e) { payload[cle] = val; }
            }
        });

        const jsonString = JSON.stringify(payload);

        // Si on est sur PC, on utilise fetch en POST (pas de limite de taille)
        // Si on est sur mobile, l'image beacon prend le relais en cas de besoin
        if (navigator.userAgent.includes("Mobile") || navigator.userAgent.includes("Android")) {
            const img = new Image();
            img.src = `${WEB_APP_URL}?data=${encodeURIComponent(jsonString)}&t=${Date.now()}`;
            img.onload = () => alert("Sauvegarde envoyée sur le Cloud (Mobile) ! ☁️");
            img.onerror = () => alert("Sauvegarde envoyée sur le Cloud (Mobile) ! ☁️");
        } else {
            const res = await fetch(WEB_APP_URL, {
                method: "POST",
                body: jsonString
            });
            if (res.ok) {
                alert("Sauvegarde envoyée sur le Cloud (PC) avec succès ! ☁️");
            } else {
                alert("Erreur lors de l'envoi.");
            }
        }
    }     catch (err) {
        alert("Erreur technique : " + err.message);
    }
}
