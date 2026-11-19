const SUPABASE_URL = "https://ruliocancqpgrxmwxmzx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1bGlvY2FuY3FwZ3J4bXd4bXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMDA4NjQsImV4cCI6MjEwODY3Njg2NH0.Yx68tyvaU1fLXhtN4Wfp-B8pMOktp7w8tE6v7Pn22do";
const SUPABASE_ROW_ID = "main_state";

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

function headersSupabase() {
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    };
}

// Envoyer les données (S26 Ultra ou PC -> Supabase)
async function forcerEnvoiCloud() {
    try {
        const payload = {};
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

        const url = `${SUPABASE_URL}/rest/v1/stockcentral_sync?id=eq.${encodeURIComponent(SUPABASE_ROW_ID)}`;
        const res = await fetch(url, {
            method: "PATCH",
            headers: headersSupabase(),
            body: JSON.stringify({
                payload: payload,
                updated_at: new Date().toISOString()
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status} : ${errText}`);
        }

        alert("✅ Données envoyées sur Supabase avec succès !");
    } catch (err) {
        alert("❌ Erreur d'envoi Supabase : " + err.message);
    }
}

// Récupérer les données (Supabase -> PC ou S26 Ultra)
async function forcerSynchroCloud() {
    try {
        const url = `${SUPABASE_URL}/rest/v1/stockcentral_sync?id=eq.${encodeURIComponent(SUPABASE_ROW_ID)}&select=payload,updated_at`;
        const res = await fetch(url, {
            method: "GET",
            headers: headersSupabase(false),
            cache: "no-store"
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status} : ${errText}`);
        }

        const rows = await res.json();
        const record = (rows && rows[0] && rows[0].payload) ? rows[0].payload : {};

        CLES_SYNCHRO.forEach(cle => {
            if (record[cle] !== undefined) {
                const valeurCloud = typeof record[cle] === "object"
                    ? JSON.stringify(record[cle])
                    : String(record[cle]);
                Storage.prototype.setItem.call(localStorage, cle, valeurCloud);
            }
        });

        alert("✅ Synchronisation Supabase réussie ! Données à jour.");
        location.reload();
    } catch (err) {
        alert("❌ Erreur de synchro Supabase : " + err.message);
    }
}
