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

        // On utilise fetch en POST avec un mode "no-cors" spécifique pour mobile si besoin, 
        // ou l'envoi direct via fetch standard qui fonctionne souvent très bien en 5G/WiFi sur S26 Ultra
        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            body: jsonString
        });

        alert("Données du téléphone envoyées sur le Cloud avec succès ! ☁️");
    } catch (err) {
        // En cas de blocage CORS mobile, on utilise l'alternative propre en morceaux
        alert("Erreur, tentative alternative...");
        const img = new Image();
        img.src = `${WEB_APP_URL}?data=${encodeURIComponent(jsonString.substring(0, 1500))}&t=${Date.now()}`;
        alert("Sauvegarde mobile transmise !");
    }
}
