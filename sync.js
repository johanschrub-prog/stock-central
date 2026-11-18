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
        const res = await fetch(WEB_APP_URL + "?t=" + Date.now()); // Ajout d'un anti-cache pour être sûr d'avoir du frais
        const record = await res.json();

        CLES_SYNCHRO.forEach(cle => {
            if (record[cle] !== undefined) {
                const valeurCloud = typeof record[cle] === 'object' ? JSON.stringify(record[cle]) : record[cle];
                Storage.prototype.setItem.call(localStorage, cle, valeurCloud);
            }
        });

        alert("Synchronisation réussie ✅ Données à jour !");
        
        // 🔄 C'est cette ligne qui force ton écran PC à afficher les nouvelles données !
        location.reload();
        
    } catch (err) {
        alert("Erreur de synchro : " + err.message);
    }
}
// Envoyer les données depuis le téléphone (via une image beacon infaillible sur Android)
// Envoyer les données depuis le téléphone vers le Cloud
async function forcerEnvoiCloud() {
    try {
        let payload = {};
        CLES_SYNCHRO.forEach(cle => {
            const val = localStorage.getItem(cle);
            if (val !== null) {
                try { payload[cle] = JSON.parse(val); } catch (e) { payload[cle] = val; }
            }
        });

        console.log("Envoi des données en cours...", payload);

        // On utilise fetch en mode POST (ou GET via URL encodée si le POST est bloqué)
        const jsonString = encodeURIComponent(JSON.stringify(payload));
        
        const response = await fetch(`${WEB_APP_URL}?data=${jsonString}&t=${Date.now()}`);
        const result = await response.json();

        if (result.status === "success") {
            alert("✅ Données du téléphone envoyées sur le Cloud avec succès ! ☁️");
        } else {
            alert("⚠️ Erreur renvoyée par le Cloud : " + (result.message || "Inconnue"));
        }

    }Rela catch (err) {
        alert("Erreur critique d'envoi : " + err.message);
    }
}
