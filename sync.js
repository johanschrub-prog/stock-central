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

// Charger les données depuis Google Sheets
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

// Envoyer les données vers Google Sheets (depuis le téléphone)
async function forcerEnvoiCloud() {
    try {
        let payload = {};
        CLES_SYNCHRO.forEach(cle => {
            const val = localStorage.getItem(cle);
            if (val !== null) {
                try { payload[cle] = JSON.parse(val); } catch (e) { payload[cle] = val; }
            }
        });

        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Sauvegarde envoyée sur le Cloud avec succès ! ☁️");
        } else {
            alert("Erreur lors de l'envoi.");
        }
    } catch (err) {
        alert("Erreur technique : " + err.message);
    }
}

// Sauvegarde auto en arrière-plan
function planifierEnvoiCloud() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
        let payload = {};
        CLES_SYNCHRO.forEach(cle => {
            const val = localStorage.getItem(cle);
            if (val !== null) {
                try { payload[cle] = JSON.parse(val); } catch (e) { payload[cle] = val; }
            }
        });
        await fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify(payload) });
    }, 1500);
}

const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (CLES_SYNCHRO.includes(key)) planifierEnvoiCloud();
};
