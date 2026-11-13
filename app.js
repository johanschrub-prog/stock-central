const STORAGE_KEY = "StockCentral";
let siteActif = "DASHBOARD";

// 1. Chargement de la nouvelle structure (Catalogue Unique + Stocks par cave)
let stockData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { catalogue: {}, stocks: {}, memoCaves: {} };
let catalogueArticles = stockData.catalogue || {};
let stockParCave = stockData.stocks || {};
let memoCaves = stockData.memoCaves || {}; // Remplace les 900 clés "cave_..." dans un seul mini-objet !

let articleTransfertActif = null;
let fournisseurs = JSON.parse(localStorage.getItem("Fournisseurs")) || [];
let analyseOuverte = localStorage.getItem("analyseOuverte") === "1";
let ongletRemontees = "HDLP";
let validationOuverte = null;
let categorieActive = "";

const categories = {
    HDLP: ["HDLP MINI BAR", "HDLP SOFT", "HDLP BAR", "HDLP SEMINAIRE"],
    RCLP: ["RCLP ALCOOL", "RCLP SOFT", "RCLP VIN"]
};

function voirPoidsDetails() {
    let details = "";
    let totalGlobal = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        const valeur = localStorage.getItem(cle) || "";
        const tailleKo = ((cle.length + valeur.length) * 2) / 1024;
        totalGlobal += tailleKo;
        details += `• ${cle} : ${tailleKo.toFixed(1)} Ko\n`;
    }

    alert(`📊 Total : ${(totalGlobal / 1024).toFixed(2)} Mo\n\nDétail :\n${details}`);
}
function save() {
    const dataAEnregistrer = {
        catalogue: catalogueArticles,
        stocks: stockParCave,
        memoCaves: memoCaves
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataAEnregistrer));
}
function obtenirArticleEtStock(categorie, codeArticle) {
    const infosArticle = catalogueArticles[codeArticle] || {};
    const quantite = stockParCave[categorie]?.[codeArticle] || 0;
    
    return {
        ...infosArticle,
        stock: quantite,
        categorie: categorie
    };
}

function analyserStockageNavigateur() {
    let tailleTotaleApp = 0;
    let tailleGlobalLocalStorage = 0;
    let detailsParCle = "";

    // Parcourt tout le localStorage pour calculer les tailles
    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        const valeur = localStorage.getItem(cle) || "";
        // Chaque caractère en JavaScript (UTF-16) pèse 2 octets
        const tailleEnOctets = (cle.length + valeur.length) * 2;
        
        tailleGlobalLocalStorage += tailleEnOctets;
        
        // On isole les clés principales de votre appli pour le détail
        if (["StockCentral", "Fournisseurs", "inventaireHDLP", "remonteeHDLP", "remonteeRCLP"].includes(cle)) {
            tailleTotaleApp += tailleEnOctets;
            detailsParCle += `• ${cle} : ${(tailleEnOctets / (1024 * 1024)).toFixed(2)} Mo\n`;
        }
    }

    // La limite standard du localStorage est généralement de 5 Mo (5 * 1024 * 1024 octets)
    const limiteEstimeeOctets = 5 * 1024 * 1024;
    const pourcentageUtilise = ((tailleGlobalLocalStorage / limiteEstimeeOctets) * 100).toFixed(1);

    // Affichage du rapport complet
    let rapport = `📊 RAPPORT DE STOCKAGE LOCAL\n\n`;
    rapport += `Total global utilisé : ${(tailleGlobalLocalStorage / (1024 * 1024)).toFixed(2)} Mo / ~5 Mo (${pourcentageUtilise}%)\n\n`;
    rapport += `Détail de vos clés principales :\n${detailsParCle}`;

    alert(rapport);
}
function mettreAJourSuggestions() {
    const suggestions = document.getElementById("listeProduits");
    if (!suggestions) return;

    const propositions = Object.values(catalogueArticles)
        .map(article => `${article.code} - ${article.article}`)
        .sort((a, b) => {
            const codeA = parseInt(a.split(" - ")[0]) || 0;
            const codeB = parseInt(b.split(" - ")[0]) || 0;
            return codeA - codeB;
        });

    suggestions.innerHTML = propositions.map(p => `<option value="${p}"></option>`).join("");
}

function mettreAJourListeFournisseurs() {
    const listeFournisseurs = [
        ...new Set(
            Object.values(catalogueArticles)
                .map(a => a.fournisseur)
                .filter(f => f && f.trim() !== "")
        )
    ].sort();

    const liste = document.getElementById("listeFournisseurs");
    if (!liste) return;

    liste.innerHTML = listeFournisseurs.map(f => `<option value="${f}"></option>`).join("");
}
function importerFournisseurs(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const lignes = XLSX.utils.sheet_to_json(sheet);

        let maj = 0;
        let nouveaux = 0;

        lignes.forEach(ligne => {
            const code = String(ligne.CODE || "").trim();
            if (!code) return;

            if (catalogueArticles[code]) {
                // Mise à jour directe en 1 ligne !
                catalogueArticles[code].article = ligne.ARTICLE || catalogueArticles[code].article;
                catalogueArticles[code].fournisseur = ligne.FOURNISSEUR || "";
                catalogueArticles[code].codeFournisseur = ligne.CODE_FOURNISSEUR || "";
                catalogueArticles[code].colisage = Number(ligne.COLISAGE || 1);
                catalogueArticles[code].prix = Number(ligne.PRIX_ACHAT || 0);
                maj++;
            } else {
                // Création dans le catalogue unique
                catalogueArticles[code] = {
                    code: code,
                    article: ligne.ARTICLE || "NOUVEL ARTICLE",
                    prix: Number(ligne.PRIX_ACHAT || 0),
                    fournisseur: ligne.FOURNISSEUR || "",
                    codeFournisseur: ligne.CODE_FOURNISSEUR || "",
                    colisage: Number(ligne.COLISAGE || 1)
                };
                nouveaux++;
            }
        });

        save();
        mettreAJourSuggestions();
        render();
        alert(`✅ ${maj} article(s) mis à jour\n\n🆕 ${nouveaux} nouvel(le)(s) article(s) créé(s)`);
    };
    reader.readAsArrayBuffer(fichier);
}

function importerPrix(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const lignes = XLSX.utils.sheet_to_json(ws);

        let maj = 0;
        lignes.forEach(ligne => {
            const code = String(ligne.Code || "").trim();
            const prix = Number(ligne.Prix || 0);

            if (catalogueArticles[code]) {
                catalogueArticles[code].prix = prix;
                maj++;
            }
        });

        save();
        render();
        alert(`${maj} prix mis à jour`);
    };
    reader.readAsArrayBuffer(fichier);
}
function modifierArticle(code) {
    const article = catalogueArticles[code];
    if (!article) return;

    const stockActuel = stockParCave[categorieActive]?.[code] || 0;

    let nouveauStock = prompt("Stock", stockActuel);
    if (nouveauStock === null) return;

    let nouveauPrix = prompt("Prix", article.prix);
    if (nouveauPrix === null) return;

    if (!stockParCave[categorieActive]) stockParCave[categorieActive] = {};
    
    const qte = Number(nouveauStock);
    if (qte === 0) {
        delete stockParCave[categorieActive][code]; // On efface les zéros pour garder le fichier ultra-léger
    } else {
        stockParCave[categorieActive][code] = qte;
    }

    article.prix = Number(nouveauPrix);

    save();
    render();
}

function remettreStocksAZero() {
    if (!confirm("Remettre tous les stocks à zéro ?")) return;

    // Il suffit de vider l'objet des stocks, le catalogue des 900 articles reste intact !
    stockParCave = {};

    save();
    render();
    alert("Tous les stocks ont été remis à zéro ✅");
}

function importStock(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        catalogueArticles = data.catalogue || {};
        stockParCave = data.stocks || {};
        memoCaves = data.memoCaves || {};
        save();
        render();
        alert("Sauvegarde restaurée");
    };
    reader.readAsText(file);
}

function exportStock() {
    const data = { catalogue: catalogueArticles, stocks: stockParCave, memoCaves: memoCaves };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = "stock-central.json";
    lien.click();
}
// Petite fonction utilitaire pour mettre à jour le stock proprement
function ajusterStockCave(cave, code, deltaQuantite) {
    if (!stockParCave[cave]) stockParCave[cave] = {};
    const actuel = Number(stockParCave[cave][code] || 0);
    const nouveau = actuel + Number(deltaQuantite);

    if (nouveau === 0) {
        delete stockParCave[cave][code];
    } else {
        stockParCave[cave][code] = nouveau;
    }
}

function validerImportHDLP() {
    const mouvements = JSON.parse(localStorage.getItem("remonteeHDLP")) || [];
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    mouvements.forEach((m, index) => {
        const cave = document.getElementById("caveHDLP_" + index).value;
        const code = String(m.code).trim();
        memoCaves[code] = cave;

        if (!catalogueArticles[code]) return;

        const qte = Number(m.quantite || 0);
        const delta = m.type === "REDESCENTE" ? qte : -qte;
        ajusterStockCave(cave, code, delta);

        historiqueGlobal.push({
            date: m.date,
            code: code,
            article: m.article,
            cave: cave,
            type: m.type === "REDESCENTE" ? "ENTREE" : "SORTIE",
            quantite: qte,
            origine: m.type === "REDESCENTE" ? "REDESCENTE HDLP" : "REMONTEE HDLP"
        });
    });

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    localStorage.removeItem("remonteeHDLP");
    changerSite("DASHBOARD");
    alert("Mouvements HDLP importés ✅");
}

function validerImportRCLP() {
    const mouvements = JSON.parse(localStorage.getItem("remonteeRCLP")) || [];
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    mouvements.forEach((m, index) => {
        const cave = document.getElementById("caveRCLP_" + index).value;
        const code = String(m.code).trim();
        memoCaves[code] = cave;

        if (!catalogueArticles[code]) return;

        const qte = Number(m.quantite || 0);
        const delta = m.type === "REDESCENTE" ? qte : -qte;
        ajusterStockCave(cave, code, delta);

        historiqueGlobal.push({
            date: m.date,
            code: code,
            article: m.article,
            cave: cave,
            type: m.type === "REDESCENTE" ? "ENTREE" : "SORTIE",
            quantite: qte,
            origine: m.type === "REDESCENTE" ? "REDESCENTE RCLP" : "REMONTEE RCLP"
        });
    });

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    localStorage.removeItem("remonteeRCLP");
    changerSite("DASHBOARD");
    alert("Remontées RCLP importées ✅");
}

function validerImportBoutique() {
    const ventes = JSON.parse(localStorage.getItem("ventesBoutique")) || [];
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    ventes.forEach((v, index) => {
        const cave = document.getElementById("venteBoutique_" + index).value;
        const code = String(v.code).trim();
        memoCaves[code] = cave;

        if (!catalogueArticles[code]) return;

        const qte = Number(v.quantite || 0);
        ajusterStockCave(cave, code, -qte); // Une vente sort du stock

        historiqueGlobal.push({
            date: v.date || new Date().toISOString(),
            code: code,
            article: v.article,
            cave: cave,
            type: "SORTIE",
            quantite: qte,
            origine: "VENTE BOUTIQUE"
        });
    });

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    localStorage.removeItem("ventesBoutique");
    changerSite("DASHBOARD");
    alert("Ventes boutique importées ✅");
}
function modifierFournisseur(id, champ, valeur){

    const fournisseur = fournisseurs.find(
        f => String(f.id) === String(id)
    );

    if(!fournisseur) return;

    valeur = String(valeur).trim();

    if(champ === "email"){
        if(
            valeur !== "" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur)
        ){
            alert("Adresse email invalide");
            return;
        }
    }

    if(
        champ === "portable" ||
        champ === "bureau"
    ){
        valeur = valeur.replace(
            /[^0-9+ ]/g,
            ""
        );
    }

    if(champ === "nom"){

        const existe = fournisseurs.some(
            f =>
                String(f.id) !== String(id) &&
                String(f.nom || "")
                    .trim()
                    .toUpperCase() ===
                valeur.toUpperCase()
        );

        if(existe){
            alert("Ce fournisseur existe déjà");
            return;
        }
    }

    fournisseur[champ] = valeur;

    if(champ === "representant" && valeur){

        const fournisseurExistant = fournisseurs.find(
            f =>
                String(f.id) !== String(id) &&
                String(f.representant || "")
                    .trim()
                    .toUpperCase() ===
                valeur.toUpperCase() &&
                (
                    f.portable ||
                    f.email ||
                    f.bureau
                )
        );

        if(fournisseurExistant){

            fournisseur.portable =
                fournisseurExistant.portable || "";

            fournisseur.email =
                fournisseurExistant.email || "";

            fournisseur.bureau =
                fournisseurExistant.bureau || "";
        }
    }

    saveFournisseurs();
    afficherFournisseurs();
}
function toggleAnalyse(){

    analyseOuverte = !analyseOuverte;

    localStorage.setItem(
        "analyseOuverte",
        analyseOuverte ? "1" : "0"
    );

    render();

}
function changerOngletRemontees(type){

    ongletRemontees = type;

    render();

}
function changerSite(site){

    siteActif = site;

    if(site === "APPLICATIONS"){
        categorieActive = "APPLICATIONS";
    }
    else if(site === "HDLP"){
        categorieActive = "TOUS_HDLP";
    }
    else if(site === "RCLP"){
        categorieActive = "TOUS_RCLP";
    }
    else if(site === "VENTES"){
        categorieActive = "VENTES";
    }
    else if(site === "ARTICLES"){
        categorieActive = "ARTICLES";
    }
    else if(site === "FOURNISSEURS"){
        categorieActive = "FOURNISSEURS";
    }
    else if(site === "REMONTEES_EFFECTUEES"){
        categorieActive = "REMONTEES_EFFECTUEES";
    }
    else{
        categorieActive = "DASHBOARD";
    }

    renderOnglets();
    render();

}
function saveFournisseurs(){

    localStorage.setItem(
        "Fournisseurs",
        JSON.stringify(fournisseurs)
    );

}

function importerPrix(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const lignes = XLSX.utils.sheet_to_json(ws);

        let maj = 0;
        lignes.forEach(ligne => {
            const code = String(ligne.Code || "").trim();
            const prix = Number(ligne.Prix || 0);

            if (catalogueArticles[code]) {
                catalogueArticles[code].prix = prix;
                maj++;
            }
        });

        save();
        render();
        alert(maj + " prix mis à jour");
    };
    reader.readAsArrayBuffer(fichier);
}

function mettreAJourListeFournisseurs() {
    const listeFournisseurs = [
        ...new Set(
            Object.values(catalogueArticles)
                .map(a => a.fournisseur)
                .filter(f => f && f.trim() !== "")
        )
    ].sort();

    const liste = document.getElementById("listeFournisseurs");
    if (!liste) return;

    liste.innerHTML = listeFournisseurs.map(f => `<option value="${f}"></option>`).join("");
}

function importStock(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        catalogueArticles = data.catalogue || {};
        stockParCave = data.stocks || {};
        memoCaves = data.memoCaves || {};
        save();
        render();
        alert("Sauvegarde restaurée");
    };
    reader.readAsText(file);
}

function modifierArticle(code) {
    const article = catalogueArticles[code];
    if (!article) return;

    const stockActuel = stockParCave[categorieActive]?.[code] || 0;

    let nouveauStock = prompt("Stock", stockActuel);
    if (nouveauStock === null) return;

    let nouveauPrix = prompt("Prix", article.prix);
    if (nouveauPrix === null) return;

    if (!stockParCave[categorieActive]) stockParCave[categorieActive] = {};
    
    const qte = Number(nouveauStock);
    if (qte === 0) {
        delete stockParCave[categorieActive][code]; // Nettoyage automatique des zéros
    } else {
        stockParCave[categorieActive][code] = qte;
    }

    article.prix = Number(nouveauPrix);

    save();
    render();
}

function remettreStocksAZero() {
    if (!confirm("Remettre tous les stocks à zéro ?")) return;

    stockParCave = {}; // On vide uniquement les quantités, le catalogue reste intact

    save();
    render();
    alert("Tous les stocks ont été remis à zéro ✅");
}

function exportStock() {
    const data = {
        catalogue: catalogueArticles,
        stocks: stockParCave,
        memoCaves: memoCaves
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = "stock-central.json";
    lien.click();
}

function renderOnglets() {
    document.getElementById("ongletsPrincipaux").innerHTML = `
        <div style="width:100%;display:flex;gap:10px;">
            <button class="tab" style="${siteActif==='DASHBOARD' ? 'background:#28a745;color:white;' : ''}" onclick="changerSite('DASHBOARD')">
                📊 TABLEAU DE BORD
            </button>
            <button onclick="voirPoidsDetails()" style="background:orange; color:white; padding:15px; font-weight:bold;">🔍 Voir ce qui prend de la place</button>
        </div>

        <div style="width:100%;display:flex;gap:10px;">
            <button class="tab" style="${siteActif==='HDLP' ? 'background:#1976d2;color:white;' : ''}" onclick="changerSite('HDLP')">
                🏨 STOCK HDLP
            </button>
            <button class="tab" style="${siteActif==='RCLP' ? 'background:#ff9800;color:white;' : ''}" onclick="changerSite('RCLP')">
                🍴 STOCK RCLP
            </button>
        </div>

        <div style="width:100%;">
            <button class="tab" style="width:100%;${siteActif==='VENTES' ? 'background:#e91e63;color:white;' : ''}" onclick="changerSite('VENTES')">
                📈 VENTES BOUTIQUE
            </button>
            <button onclick="analyserStockageNavigateur()" style="width:100%; margin:10px 0; padding:10px;">💾 Voir l'espace disque</button>
            
            <div style="width:100%;display:flex;gap:10px;">
                <button class="tab" style="${siteActif==='STAT_HDLP' ? 'background:#1976d2;color:white;' : ''}" onclick="changerSite('STAT_HDLP')">
                    📊 REMONTÉES HDLP
                </button>
                <button class="tab" style="${siteActif==='STAT_RCLP' ? 'background:#ff9800;color:white;' : ''}" onclick="changerSite('STAT_RCLP')">
                    📊 REMONTÉES RCLP
                </button>
            </div>
        </div>

        <div style="width:100%;display:flex;gap:10px;">
            <button class="tab" style="${siteActif==='APPLICATIONS' ? 'background:#673ab7;color:white;' : ''}" onclick="changerSite('APPLICATIONS')">
                📱 APPLICATIONS
            </button>
            <button class="tab" style="${siteActif==='REMONTEES_EFFECTUEES' ? 'background:#4caf50;color:white;' : ''}" onclick="changerSite('REMONTEES_EFFECTUEES')">
                🍾 REMONTÉES EFFECTUÉES
            </button>
        </div>

        <div style="width:100%;display:flex;gap:10px;">
            <button class="tab" style="${siteActif==='ARTICLES' ? 'background:#795548;color:white;' : ''}" onclick="changerSite('ARTICLES')">
                📦 ARTICLES
            </button>
            <button class="tab" style="${siteActif==='FOURNISSEURS' ? 'background:#009688;color:white;' : ''}" onclick="changerSite('FOURNISSEURS')">
                🚚 FOURNISSEURS
            </button>
        </div>
    `;

    let html = "";

    if (siteActif === "HDLP" || siteActif === "RCLP") {
        categories[siteActif].forEach(c => {
            const couleur = siteActif === "RCLP" ? "#ff9800" : "#1976d2";
            const style = categorieActive === c ? `background:${couleur};color:white;` : "";

            html += `
                <button class="tab" style="${style}font-size:22px;padding:20px;min-height:80px;font-weight:bold;margin:5px;width:100%;" onclick="changerCategorie('${c}')">
                    ${c}
                </button>
            `;
        });
    }
    
    document.getElementById("sousOnglets").innerHTML = html;
}
function ouvrirApplications(){
    document.getElementById("cards").innerHTML = `
    <div class="card" style="text-align: center;">
        <h2>📱 Applications</h2>
        <br>

        <!-- Conteneur global de la grille de menu -->
        <div style="display: flex; flex-direction: column; gap: 15px; max-width: 600px; margin: 0 auto;">

            <!-- Ligne 1 : Remontées HDLP & Remontées RCLP (Côte à côte) -->
            <div style="display: flex; gap: 4%; width: 100%;">
                <button onclick="ouvrirRemonteeHDLP()" style="width: 48%; height: 70px; font-size: 16px; font-weight: bold; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    📤 Remontées HDLP
                </button>
                <button onclick="ouvrirRemonteeRCLP()" style="width: 48%; height: 70px; font-size: 16px; font-weight: bold; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    📤 Remontées RCLP
                </button>
            </div>

            <!-- Ligne 2 : Ventes Boutique (Seule, prend toute la largeur) -->
            <div style="width: 100%;">
                <button onclick="ouvrirSaisieVentesBoutique()" style="width: 100%; height: 70px; font-size: 16px; font-weight: bold; background: #ff9800; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    🛍️ Ventes boutique
                </button>
            </div>

            <!-- Ligne 3 : Commande HDLP & Commandes RCLP (Côte à côte) -->
            <div style="display: flex; gap: 4%; width: 100%;">
                <button onclick="ouvrirCommandeHDLP()" style="width: 48%; height: 70px; font-size: 16px; font-weight: bold; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    📦 Commandes HDLP
                </button>
                <button onclick="ouvrirCommandeRCLP()" style="width: 48%; height: 70px; font-size: 16px; font-weight: bold; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    📦 Commandes RCLP
                </button>
            </div>

        </div>
    </div>
    `;
}

function changerCategorie(cat){
    categorieActive = cat;
    renderOnglets();
    render();
}

function importRemonteeHDLP(){
    const mouvements = JSON.parse(localStorage.getItem("remonteeHDLP")) || [];

    if(mouvements.length === 0){
        alert("Aucune remontée HDLP");
        return;
    }

    let html = `
    <div class="card">
    <h2>📥 Remontées HDLP</h2>
    <button onclick="supprimerRemonteesHDLP()">🗑️ Purger HDLP</button>
    `;

    mouvements.forEach((m,index)=>{
        // Utilisation de memoCaves au lieu de localStorage.getItem("cave_" + m.code)
        const caveMemo = memoCaves[m.code] || "HDLP BAR";

        html += `
        <div style="border-bottom:1px solid #ddd; padding:10px;">
            <b>${m.article}</b>
            <br>
            Type :
            ${
                m.type === "REDESCENTE"
                ? "<span style='color:#28a745;font-weight:bold'>🟢 REDESCENTE</span>"
                : "<span style='color:#dc3545;font-weight:bold'>🔴 REMONTEE</span>"
            }
            <br>
            Code : ${m.code}
            <br>
            Quantité : ${m.quantite}
            <br><br>
            Cave :
            <select id="caveHDLP_${index}">
                <option value="HDLP MINI BAR" ${caveMemo === "HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                <option value="HDLP SOFT" ${caveMemo === "HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                <option value="HDLP BAR" ${caveMemo === "HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                <option value="HDLP SEMINAIRE" ${caveMemo === "HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
            </select>
        </div>
        `;
    });

    html += `
    <br>
    <button onclick="validerImportHDLP()">✅ Importer les remontées</button>
    </div>
    `;

    document.getElementById("cards").innerHTML = html;
}
function supprimerVentesBoutique(){
    if(!confirm("Supprimer toutes les ventes boutique ?")){
        return;
    }
    localStorage.removeItem("ventesBoutique");
    alert("Ventes boutique supprimées ✅");
}

function supprimerRemonteesRCLP(){
    if(!confirm("Supprimer toutes les remontées RCLP ?")){
        return;
    }
    localStorage.removeItem("remonteeRCLP");
    alert("Remontées RCLP supprimées ✅");
}

function supprimerRemonteesHDLP(){
    if(!confirm("Supprimer toutes les remontées HDLP ?")){
        return;
    }
    localStorage.removeItem("remonteeHDLP");
    alert("Remontées HDLP supprimées ✅");
}

function importRemonteeRCLP(){
    const mouvements = JSON.parse(localStorage.getItem("remonteeRCLP")) || [];

    if(mouvements.length === 0){
        alert("Aucune remontée RCLP");
        return;
    }

    let html = `
    <div class="card">
        <h2>📥 Remontées RCLP</h2>
        <button onclick="supprimerRemonteesRCLP()">🗑️ Purger RCLP</button>
    `;

    mouvements.forEach((m, index) => {
        // Utilisation de memoCaves au lieu de localStorage.getItem("cave_" + m.code)
        const caveMemo = memoCaves[m.code] || "RCLP ALCOOL";

        html += `
        <div style="border-bottom:1px solid #ddd; padding:10px;">
            <b>${m.article}</b>
            <br>
            Type :
            <span style="font-weight:bold; color:${m.type === "REDESCENTE" ? "#28a745" : "#dc3545"};">
                ${m.type}
            </span>
            <br>
            Code : ${m.code}
            <br>
            Quantité : ${m.quantite}
            <br><br>
            Cave :
            <select id="caveRCLP_${index}">
                <option value="RCLP ALCOOL" ${caveMemo === "RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
                <option value="RCLP SOFT" ${caveMemo === "RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                <option value="RCLP VIN" ${caveMemo === "RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
            </select>
        </div>
        `;
    });

    html += `
        <br>
        <button onclick="validerImportRCLP()">✅ Importer les remontées</button>
    </div>
    `;

    document.getElementById("cards").innerHTML = html;
}
function validerImportRCLP(){

    const mouvements =
    JSON.parse(
        localStorage.getItem(
            "remonteeRCLP"
        )
    ) || [];

    mouvements.forEach((m,index)=>{

        const cave =

        document
        .getElementById(
            "caveRCLP_" + index
        )
        .value;

        localStorage.setItem(
            "cave_" + m.code,
            cave
        );

        const article =

        stock[cave]
        ?.find(a =>

            String(a.code)

            ===

            String(m.code)

        );

        if(!article) return;

       if(
    m.type ===
    "REDESCENTE"
){

    article.stock =

    Number(article.stock || 0)

    +

    Number(m.quantite || 0);

}
else{

    article.stock =

    Number(article.stock || 0)

    -

    Number(m.quantite || 0);

}

        if(!article.mouvements){

            article.mouvements = [];

        }

    article.mouvements.push({

    date:
    m.date,

    type:
    m.type === "REDESCENTE"
    ? "ENTREE"
    : "SORTIE",

    quantite:
    m.quantite,

    origine:
    m.type === "REDESCENTE"
    ? "REDESCENTE RCLP"
    : "REMONTEE RCLP"

});

    });

    save();

    localStorage.removeItem(
        "remonteeRCLP"
    );

    changerSite(
        "DASHBOARD"
    );

    alert(
        "Remontées RCLP importées ✅"
    );

}
// Note : validerImportRCLP est déjà gérée par la version propre aux normes du Catalogue Unique. 
// Si elle était encore présente ici en double, vous pouvez la remplacer entièrement par importVentesBoutique ci-dessous :

function importVentesBoutique(){
    const ventes = JSON.parse(localStorage.getItem("ventesBoutique")) || [];

    if(ventes.length === 0){
        alert("Aucune vente boutique");
        return;
    }

    let html = `
    <div class="card">
        <h2>🛍️ Ventes Boutique</h2>
        <button onclick="supprimerVentesBoutique()">🗑️ Purger Boutique</button>
    `;

    ventes.forEach((v, index) => {
        // Utilisation de memoCaves au lieu de localStorage.getItem("cave_" + v.code)
        const caveMemo = memoCaves[v.code] || "HDLP SOFT";

        html += `
        <div style="border-bottom:1px solid #ddd; padding:10px;">
            <b>${v.article}</b>
            <br>
            Code : ${v.code}
            <br>
            Quantité : ${v.quantite}
            <br><br>
            Cave :
            <select id="venteBoutique_${index}">
                <option value="HDLP MINI BAR" ${caveMemo === "HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                <option value="HDLP SOFT" ${caveMemo === "HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                <option value="HDLP BAR" ${caveMemo === "HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                <option value="HDLP SEMINAIRE" ${caveMemo === "HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
                <option value="RCLP ALCOOL" ${caveMemo === "RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
                <option value="RCLP SOFT" ${caveMemo === "RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                <option value="RCLP VIN" ${caveMemo === "RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
            </select>
        </div>
        `;
    });

    html += `
        <br>
        <button onclick="validerImportBoutique()">✅ Importer les ventes</button>
    </div>
    `;

    document.getElementById("cards").innerHTML = html;
}
function validerImportBoutique() {
    const ventes = JSON.parse(localStorage.getItem("ventesBoutique")) || [];
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    ventes.forEach((v, index) => {
        const cave = document.getElementById("venteBoutique_" + index).value;
        const code = String(v.code).trim();
        memoCaves[code] = cave;

        if (!catalogueArticles[code]) return;

        const qte = Number(v.quantite || 0);
        ajusterStockCave(cave, code, -qte); // Une vente sort du stock

        historiqueGlobal.push({
            date: v.date || new Date().toISOString(),
            code: code,
            article: v.article,
            cave: cave,
            type: "SORTIE",
            quantite: qte,
            origine: "VENTE BOUTIQUE"
        });
    });

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    localStorage.removeItem("ventesBoutique");
    changerSite("DASHBOARD");
    alert("Ventes Boutique importées ✅");
}

function importCommandeHDLP() {
    const commandes = JSON.parse(localStorage.getItem("commandeHDLP")) || [];

    if (commandes.length === 0) {
        alert("Aucune commande HDLP");
        return;
    }

    let html = `
    <div class="card">
    <h2>🚚 Commandes HDLP</h2>
    `;

    commandes.forEach((c, index) => {
        const code = String(c.code).trim();
        const caveMemo = memoCaves[code] || "HDLP BAR";

        // On récupère le prix depuis le catalogue unique
        const articleExiste = catalogueArticles[code];
        const montantDefaut = articleExiste?.prix 
            ? Number(articleExiste.prix) * Number(c.quantite) 
            : "";

        html += `
        <div style="border-bottom:1px solid #ddd; padding:10px;">
            <b>${c.article}</b>
            <br>
            Code : ${c.code}
            <br>
            Quantité : +${c.quantite}
            <br><br>
            Cave :
            <select id="commandeHDLP_${index}">
                <option value="HDLP MINI BAR" ${caveMemo === "HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                <option value="HDLP SOFT" ${caveMemo === "HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                <option value="HDLP BAR" ${caveMemo === "HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                <option value="HDLP SEMINAIRE" ${caveMemo === "HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
            </select>
            <br><br>
            Valeur achat (€)
            <br>
            <input type="number" step="0.01" id="prixHDLP_${index}" value="${montantDefaut}" placeholder="Montant total">
        </div>
        `;
    });

    html += `
    <br>
    <button onclick="validerImportCommandeHDLP()">✅ Importer les réceptions</button>
    <button style="background:#dc3545;margin-left:10px;" onclick="annulerCommandeHDLP()">❌ Annuler réception</button>
    </div>
    `;

    document.getElementById("cards").innerHTML = html;
}

function annulerCommandeHDLP() {
    if (!confirm("Annuler toutes les réceptions HDLP en attente ?")) {
        return;
    }
    localStorage.removeItem("commandeHDLP");
    changerSite("DASHBOARD");
    alert("Réceptions HDLP annulées ✅");
}

function validerImportCommandeHDLP() {
    const commandes = JSON.parse(localStorage.getItem("commandeHDLP")) || [];
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    commandes.forEach((c, index) => {
        const cave = document.getElementById("commandeHDLP_" + index).value;
        const code = String(c.code).trim();
        memoCaves[code] = cave;

        const montant = Number(document.getElementById("prixHDLP_" + index).value || 0);
        const qteCommande = Number(c.quantite || 0);
        const prixUnitaire = qteCommande > 0 ? montant / qteCommande : 0;

        // 1. Si l'article n'existe pas dans le catalogue unique, on le crée
        if (!catalogueArticles[code]) {
            catalogueArticles[code] = {
                code: code,
                article: c.article || "NOUVEL ARTICLE",
                prix: 0,
                fournisseur: c.fournisseur || "",
                codeFournisseur: "",
                colisage: Number(c.conditionnement || 1)
            };
        }

        // 2. Mise à jour du prix unitaire dans le Catalogue Unique si renseigné
        if (prixUnitaire > 0) {
            catalogueArticles[code].prix = Number(prixUnitaire.toFixed(2));
        }

        // 3. Ajout dans le stock de la cave
        ajusterStockCave(cave, code, qteCommande);

        // 4. Ajout dans l'historique global des mouvements
        historiqueGlobal.push({
            date: c.date || new Date().toISOString(),
            code: code,
            article: c.article,
            cave: cave,
            type: "ENTREE",
            quantite: qteCommande,
            origine: "COMMANDE HDLP",
            fournisseur: c.fournisseur || ""
        });
    });

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    localStorage.removeItem("commandeHDLP");
    changerSite("DASHBOARD");
    alert("Commandes HDLP importées ✅");
}
function importCommandeRCLP(){
    const commandes = JSON.parse(localStorage.getItem("commandeRCLP")) || [];

    if(commandes.length === 0){
        alert("Aucune commande RCLP");
        return;
    }

    let html = `
    <div class="card">
    <h2>🚚 Commandes RCLP</h2>
    `;

    commandes.forEach((c, index) => {
        const code = String(c.code).trim();
        const caveMemo = memoCaves[code] || "RCLP ALCOOL";

        // On récupère le prix depuis le catalogue unique
        const articleExiste = catalogueArticles[code];
        const montantDefaut = articleExiste?.prix 
            ? Number(articleExiste.prix) * Number(c.quantite) 
            : "";

        html += `
        <div style="border-bottom:1px solid #ddd; padding:10px;">
            <b>${c.article}</b>
            <br>
            Code : ${c.code}
            <br>
            Quantité : +${c.quantite}
            <br><br>
            Cave :
            <select id="commandeRCLP_${index}">
                <option value="RCLP ALCOOL" ${caveMemo === "RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
                <option value="RCLP SOFT" ${caveMemo === "RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                <option value="RCLP VIN" ${caveMemo === "RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
            </select>
            <br><br>
            Valeur achat (€)
            <br>
            <input type="number" step="0.01" id="prixRCLP_${index}" value="${montantDefaut}" placeholder="Montant total">
        </div>
        `;
    });

    html += `
    <br>
    <button onclick="validerImportCommandeRCLP()">✅ Importer les réceptions</button>
    <button style="background:#dc3545;margin-left:10px;" onclick="annulerCommandeRCLP()">❌ Annuler réception</button>
    </div>
    `;

    document.getElementById("cards").innerHTML = html;
}

function annulerCommandeRCLP(){
    if(!confirm("Annuler toutes les réceptions RCLP en attente ?")){
        return;
    }
    localStorage.removeItem("commandeRCLP");
    changerSite("DASHBOARD");
    alert("Réceptions RCLP annulées ✅");
}

function validerImportCommandeRCLP(){
    const commandes = JSON.parse(localStorage.getItem("commandeRCLP")) || [];
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    commandes.forEach((c, index) => {
        const cave = document.getElementById("commandeRCLP_" + index).value;
        const code = String(c.code).trim();
        memoCaves[code] = cave;

        const montant = Number(document.getElementById("prixRCLP_" + index).value || 0);
        const qteCommande = Number(c.quantite || 0);
        const prixUnitaire = qteCommande > 0 ? montant / qteCommande : 0;

        // 1. Si l'article n'existe pas dans le catalogue unique, on le crée
        if(!catalogueArticles[code]){
            catalogueArticles[code] = {
                code: code,
                article: c.article || "NOUVEL ARTICLE",
                prix: 0,
                fournisseur: c.fournisseur || "",
                codeFournisseur: "",
                colisage: Number(c.conditionnement || 1)
            };
        }

        // 2. Mise à jour du prix unique dans le Catalogue Unique
        if(prixUnitaire > 0){
            catalogueArticles[code].prix = Number(prixUnitaire.toFixed(2));
        }

        // 3. Ajout dans le stock de la cave
        ajusterStockCave(cave, code, qteCommande);

        // 4. Ajout dans l'historique global des mouvements
        historiqueGlobal.push({
            date: c.date || new Date().toISOString(),
            code: code,
            article: c.article,
            cave: cave,
            type: "ENTREE",
            quantite: qteCommande,
            origine: "COMMANDE RCLP",
            fournisseur: c.fournisseur || ""
        });
    });

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    localStorage.removeItem("commandeRCLP");
    changerSite("DASHBOARD");
    alert("Commandes RCLP importées ✅");
}
// Variable pour stocker le transfert en cours (on y stocke le code et la cave source)
let transfertEnCours = null;

function transfererArticle(codeArticle, caveSource) {
    const articleInfo = catalogueArticles[codeArticle];
    if (!articleInfo) return;

    const stockActuel = stockParCave[caveSource]?.[codeArticle] || 0;

    transfertEnCours = {
        code: codeArticle,
        caveSource: caveSource,
        article: articleInfo.article,
        stock: stockActuel
    };

    document.getElementById("articleTransfert").innerHTML = "<b>" + articleInfo.article + "</b><br>Stock : " + stockActuel;
    document.getElementById("quantiteTransfert").value = "";
    document.getElementById("popupTransfert").style.display = "block";
}

function transfertCoupe(codeArticle, caveSource) {
    const stockActuel = stockParCave[caveSource]?.[codeArticle] || 0;

    const quantite = Number(prompt("Quantité à transférer en coupes ?", "1"));
    if (isNaN(quantite) || quantite <= 0) {
        return;
    }

    if (stockActuel < quantite) {
        alert("Stock insuffisant");
        return;
    }

    // Vérification de l'article Champagne Coupe (code 185)
    if (!catalogueArticles["185"]) {
        alert("Article code 185 introuvable dans le catalogue");
        return;
    }

    // 1. Retrait du stock de la cave source
    stockParCave[caveSource][codeArticle] = stockActuel - quantite;
    if (stockParCave[caveSource][codeArticle] === 0) {
        delete stockParCave[caveSource][codeArticle];
    }

    // 2. Ajout du stock dans la cave où se trouve le code 185 (ou la cave active par défaut)
    const caveCible185 = memoCaves["185"] || caveSource;
    if (!stockParCave[caveCible185]) stockParCave[caveCible185] = {};
    const stock185Actuel = stockParCave[caveCible185]["185"] || 0;
    stockParCave[caveCible185]["185"] = stock185Actuel + quantite;

    // 3. Enregistrement dans l'historique global des mouvements
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];
    const dateStr = new Date().toLocaleString();
    const articleNom = catalogueArticles[codeArticle]?.article || "Article";

    historiqueGlobal.push(
        {
            date: dateStr,
            code: codeArticle,
            article: articleNom,
            cave: caveSource,
            type: "SORTIE",
            quantite: quantite,
            origine: "VERS CODE 185"
        },
        {
            date: dateStr,
            code: "185",
            article: catalogueArticles["185"].article,
            cave: caveCible185,
            type: "ENTREE",
            quantite: quantite,
            origine: articleNom
        }
    );

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    render();

    alert("✅ " + quantite + " transférée(s) vers Champagne Coupe");
}

function fermerTransfert() {
    document.getElementById("popupTransfert").style.display = "none";
    transfertEnCours = null;
}

function validerTransfert() {
    if (!transfertEnCours) return;

    const quantite = Number(document.getElementById("quantiteTransfert").value);
    if (isNaN(quantite) || quantite <= 0) {
        alert("Quantité invalide");
        return;
    }

    const destination = document.getElementById("destinationTransfert").value;
    const { code, caveSource } = transfertEnCours;

    const stockSource = stockParCave[caveSource]?.[code] || 0;

    if (quantite > stockSource) {
        alert("Stock insuffisant");
        return;
    }

    // 1. Retrait de la cave source
    stockParCave[caveSource][code] = stockSource - quantite;
    if (stockParCave[caveSource][code] === 0) {
        delete stockParCave[caveSource][code];
    }

    // 2. Ajout dans la cave de destination
    if (!stockParCave[destination]) stockParCave[destination] = {};
    const stockDestinationActuel = stockParCave[destination][code] || 0;
    stockParCave[destination][code] = stockDestinationActuel + quantite;

    // 3. Enregistrement dans l'historique global
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];
    const dateStr = new Date().toISOString();
    const articleNom = catalogueArticles[code]?.article || "Article";

    historiqueGlobal.push(
        {
            date: dateStr,
            code: code,
            article: articleNom,
            cave: caveSource,
            type: "SORTIE",
            quantite: quantite,
            origine: "VERS " + destination
        },
        {
            date: dateStr,
            code: code,
            article: articleNom,
            cave: destination,
            type: "ENTREE",
            quantite: quantite,
            origine: "DEPUIS " + caveSource
        }
    );

    save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    fermerTransfert();
    render();

    alert("Transfert effectué ✅");
}
function render() {
    let liste = [];

    // 1. Construction de la liste des articles selon la catégorie active
    if (categorieActive === "TOUS_HDLP") {
        categories["HDLP"].forEach(cave => {
            const stocksCave = stockParCave[cave] || {};
            Object.keys(stocksCave).forEach(code => {
                const infos = catalogueArticles[code] || {};
                liste.push({
                    code: code,
                    ...infos,
                    stock: stocksCave[code],
                    cave: cave
                });
            });
        });
    } else if (categorieActive === "TOUS_RCLP") {
        categories["RCLP"].forEach(cave => {
            const stocksCave = stockParCave[cave] || {};
            Object.keys(stocksCave).forEach(code => {
                const infos = catalogueArticles[code] || {};
                liste.push({
                    code: code,
                    ...infos,
                    stock: stocksCave[code],
                    cave: cave
                });
            });
        });
    } else if (categories["HDLP"].includes(categorieActive) || categories["RCLP"].includes(categorieActive)) {
        // C'est une cave spécifique (ex: "HDLP BAR")
        const stocksCave = stockParCave[categorieActive] || {};
        // On affiche tous les articles du catalogue qui ont un stock dans cette cave (ou tout le catalogue si vous préférez)
        Object.keys(catalogueArticles).forEach(code => {
            const infos = catalogueArticles[code];
            const stockQte = stocksCave[code] || 0;
            liste.push({
                code: code,
                ...infos,
                stock: stockQte,
                cave: categorieActive
            });
        });
    }

    const valeurRecherche = document.getElementById("search")?.value || "";
    const rechercheCode = valeurRecherche.includes(" - ") ? valeurRecherche.split(" - ")[0].trim() : "";
    const rechercheTexte = valeurRecherche.includes(" - ") ? valeurRecherche.split(" - ").slice(1).join(" - ").toLowerCase().trim() : valeurRecherche.toLowerCase().trim();
    
    const filtreCave = document.getElementById("filtreCave")?.value || "";
    const filtreCategorie = document.getElementById("filtreCategorie")?.value || localStorage.getItem("filtreCategorie") || "";
    const filtreStock = localStorage.getItem("filtreStock") ?? "";

    // Récupération globale des mouvements depuis la clé dédiée
    let mouvements = JSON.parse(localStorage.getItem("mouvements")) || [];

    const categoriesProduits = [
        ...new Set(Object.values(catalogueArticles).map(a => a.categorie).filter(c => c))
    ].sort();

    const fournisseurs = [
        ...new Set(mouvements.map(m => m.fournisseur).filter(f => f))
    ].sort();

    let html = "";

    if (categorieActive === "APPLICATIONS") {
        ouvrirApplications();
        return;
    }
    if (categorieActive === "ARTICLES") {
        renderArticles();
        return;
    }
    if (categorieActive === "FOURNISSEURS") {
        renderFournisseurs();
        return;
    }

    if (categorieActive === "REMONTEES_EFFECTUEES") {
        let remontees = getRemonteesEffectuees();

        if (ongletRemontees === "HDLP") {
            remontees = remontees.filter(r => r.type === "HDLP" || r.type === "REDESCENTE HDLP");
        }
        if (ongletRemontees === "RCLP") {
            remontees = remontees.filter(r => r.type === "RCLP" || r.type === "REDESCENTE RCLP");
        }
        if (ongletRemontees === "BOUTIQUE") {
            remontees = remontees.filter(r => r.type === "BOUTIQUE" || r.type === "REDESCENTE BOUTIQUE");
        }

        let htmlRemontees = `
        <div class="card">
            <h2>🍾 Remontées effectuées</h2>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <button class="tab" style="${ongletRemontees === 'HDLP' ? 'background:#1976d2;color:white;' : ''}" onclick="ongletRemontees='HDLP';render();">🏨 HDLP</button>
                <button class="tab" style="${ongletRemontees === 'RCLP' ? 'background:#ff9800;color:white;' : ''}" onclick="ongletRemontees='RCLP';render();">🍴 RCLP</button>
                <button class="tab" style="${ongletRemontees === 'BOUTIQUE' ? 'background:#e91e63;color:white;' : ''}" onclick="ongletRemontees='BOUTIQUE';render();">🛍️ Boutique</button>
            </div>
            <input type="date" id="filtreDateRemontees" onchange="render()" style="width:100%; padding:10px;"><br><br>
            <input type="text" id="filtreArticleRemontees" placeholder="🔎 Code ou article" onchange="render()" style="width:100%; padding:10px;">
        </div>
        `;

        const dateRecherche = document.getElementById("filtreDateRemontees")?.value || "";
        const rechercheArticle = (document.getElementById("filtreArticleRemontees")?.value || "").toLowerCase();

        const validations = {};

        remontees.forEach(r => {
            const id = r.validationId || "sansValidation";
            if (dateRecherche && String(r.date || "").substring(0, 10) !== dateRecherche) return;
            if (rechercheArticle && !String(r.code || "").toLowerCase().includes(rechercheArticle) && !String(r.designation || "").toLowerCase().includes(rechercheArticle)) return;

            if (!validations[id]) {
                validations[id] = { date: r.date, dateHeure: r.dateHeure, lignes: [] };
            }
            validations[id].lignes.push(r);
        });

        Object.entries(validations).reverse().forEach(([id, validation]) => {
            const heure = validation.dateHeure ? new Date(validation.dateHeure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--";
            const total = validation.lignes.reduce((s, r) => s + Number(r.quantite || 0), 0);

            htmlRemontees += `
            <div class="card">
                <button style="width:100%; text-align:left; padding:15px; font-size:18px; font-weight:bold;" onclick="validationOuverte = validationOuverte === '${id}' ? null : '${id}'; render();">
                    📦 Validation ${new Date(validation.date).toLocaleDateString()} - ${heure}
                    <br><br>
                    ${validation.lignes.length} article(s) - ${total} quantité(s)
                </button>
            `;

            if (validationOuverte === id) {
                htmlRemontees += `
                <div style="margin-top:10px;">
                    <button style="background:#dc3545; color:white;" onclick="event.stopPropagation(); supprimerValidation('${id}');">🗑️ Supprimer la validation</button>
                </div>
                `;
                validation.lignes.forEach(ligne => {
                    htmlRemontees += `
                    <div style="border-top:1px solid #ddd; padding:10px; margin-top:5px;">
                        <b>${ligne.designation}</b><br>
                        Code : ${ligne.code}<br><br>
                        <select id="cave_${ligne.id}" style="width:100%;">
                            <option value="HDLP SOFT" ${ligne.cave === "HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                            <option value="HDLP BAR" ${ligne.cave === "HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                            <option value="HDLP MINI BAR" ${ligne.cave === "HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                            <option value="HDLP SEMINAIRE" ${ligne.cave === "HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
                            <option value="RCLP SOFT" ${ligne.cave === "RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                            <option value="RCLP VIN" ${ligne.cave === "RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
                            <option value="RCLP ALCOOL" ${ligne.cave === "RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
                        </select>
                        <br><br>
                        Type : ${ligne.type}<br><br>
                        Quantité : <input type="number" id="quantite_${ligne.id}" value="${ligne.quantite}" style="width:100%;"><br><br>
                        <button onclick="modifierRemontee('${ligne.id}')">💾 Enregistrer</button>
                        <button style="background:#dc3545; color:white; margin-left:5px;" onclick="supprimerRemontee('${ligne.id}')">🗑️ Supprimer</button>
                    </div>
                    `;
                });
            }
            htmlRemontees += `</div>`;
        });

        document.getElementById("cards").innerHTML = htmlRemontees;
        return;
    }

    if (categorieActive === "DASHBOARD") {
        const categorieDashboard = localStorage.getItem("categorieDashboard") || "";
        const stockMiniDashboard = localStorage.getItem("stockMiniDashboard");
        
        let valeurHDLP = 0;
        let valeurRCLP = 0;
        let totalArticles = Object.keys(catalogueArticles).length;
        let sansPrix = 0;
        let stockZero = 0;

        // Calculs basés sur le Catalogue Unique et stockParCave
        Object.keys(catalogueArticles).forEach(code => {
            const art = catalogueArticles[code];
            const prix = Number(art.prix || 0);
            if (prix === 0) sansPrix++;

            let stockTotalArticle = 0;
            Object.keys(stockParCave).forEach(cave => {
                const qte = Number(stockParCave[cave][code] || 0);
                stockTotalArticle += qte;
                const val = qte * prix;
                if (cave.startsWith("HDLP")) valeurHDLP += val;
                else if (cave.startsWith("RCLP")) valeurRCLP += val;
            });

            if (stockTotalArticle === 0) stockZero++;
        });

        if (valeurRecherche.trim() !== "") {
            let resultats = [];
            const dejaVus = new Set();

            Object.keys(catalogueArticles).forEach(code => {
                const article = catalogueArticles[code];
                const matchRecherche = (rechercheTexte !== "" && (article.article || "").toLowerCase().includes(rechercheTexte)) ||
                                       (rechercheCode !== "" && String(code) === rechercheCode);

                if (!matchRecherche || dejaVus.has(code)) return;
                dejaVus.add(code);

                let stockHDLP = 0;
                let stockRCLP = 0;

                Object.keys(stockParCave).forEach(cave => {
                    const qte = Number(stockParCave[cave][code] || 0);
                    if (cave.startsWith("HDLP")) stockHDLP += qte;
                    if (cave.startsWith("RCLP")) stockRCLP += qte;
                });

                resultats.push({
                    article: article.article,
                    code: code,
                    categorie: article.categorie || "",
                    prix: article.prix || 0,
                    stockHDLP: stockHDLP,
                    stockRCLP: stockRCLP
                });
            });

            let htmlRecherche = "";
            resultats.forEach(r => {
                htmlRecherche += `
                <div class="card">
                    <h3>${r.article}</h3>
                    Code : ${r.code}<br>
                    Catégorie : ${r.categorie || "-"}<br><br>
                    Prix : ${Number(r.prix || 0).toFixed(2)} €<br><br>
                    🏨 HDLP : <b>${r.stockHDLP}</b><br><br>
                    🍴 RCLP : <b>${r.stockRCLP}</b><br><br>
                    📦 TOTAL : <b>${r.stockHDLP + r.stockRCLP}</b>
                </div>
                `;
            });

            const boutonMaj = `
            <div class="card">
                <button onclick="mettreAJourStockJson()" style="width:100%; height:70px; background:#28a745; color:white; font-size:22px; font-weight:bold; border:none; border-radius:8px;">
                    🔄 METTRE À JOUR STOCK.JSON
                </button>
            </div>
            `;
            document.getElementById("cards").innerHTML = boutonMaj + htmlRecherche;
            return;
        }

        let analyseCategorie = "";
        if (categorieDashboard) {
            Object.keys(catalogueArticles).forEach(code => {
                const article = catalogueArticles[code];
                if (article.categorie !== categorieDashboard) return;

                let stockHDLP = 0;
                let stockRCLP = 0;

                Object.keys(stockParCave).forEach(c => {
                    const qte = Number(stockParCave[c][code] || 0);
                    if (c.startsWith("HDLP")) stockHDLP += qte;
                    if (c.startsWith("RCLP")) stockRCLP += qte;
                });

                if (stockMiniDashboard !== null && stockMiniDashboard !== "" && stockHDLP < Number(stockMiniDashboard) && stockRCLP < Number(stockMiniDashboard)) {
                    return;
                }

                analyseCategorie += `
                <div class="card" style="width:100%; box-sizing:border-box;">
                    <b>${article.article}</b><br><br>
                    🏨 HDLP : <b>${stockHDLP}</b><br><br>
                    🍴 RCLP : <b>${stockRCLP}</b><br><br>
                    📦 TOTAL : <b>${stockHDLP + stockRCLP}</b>
                </div>
                `;
            });
        }

        document.getElementById("cards").innerHTML = `
        <div class="card">
            <button onclick="mettreAJourStockJson()" style="width:100%; height:70px; background:#28a745; color:white; font-size:22px; font-weight:bold; border:none; border-radius:8px;">
                🔄 METTRE À JOUR STOCK.JSON
            </button>
        </div>

        <div style="margin-left:-10px; margin-right:-10px; background:white; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,.15); margin-bottom:10px; overflow:hidden;">
            <button onclick="toggleAnalyse()" style="width:100%; min-height:80px; font-size:22px; font-weight:bold; border:none; border-radius:0; background:#f8f9fa; cursor:pointer; margin:0; display:block; box-sizing:border-box;">
                ${analyseOuverte ? "🔽" : "▶️"} Analyse par catégorie
            </button>
            ${analyseOuverte ? `
            <div style="padding:15px; display:flex; gap:10px; width:100%; box-sizing:border-box; align-items:flex-end;">
                <div style="flex:1; min-width:0;">
                    <b>Catégorie</b><br><br>
                    <select style="width:100%; height:50px; font-size:18px; box-sizing:border-box;" onchange="localStorage.setItem('categorieDashboard', this.value); render();">
                        <option value="">Sélectionner</option>
                        ${categoriesProduits.map(c => `<option value="${c}" ${categorieDashboard === c ? "selected" : ""}>${c}</option>`).join("")}
                    </select>
                </div>
                <div style="width:100px; flex-shrink:0;">
                    <b>Stock supérieur à</b><br><br>
                    <input type="number" style="width:100%; height:50px; font-size:18px; box-sizing:border-box;" value="${stockMiniDashboard || ""}" onchange="localStorage.setItem('stockMiniDashboard', this.value); render();">
                </div>
            </div>
            ` : ""}
        </div>

        <div class="card">
            <h2>🏨 HDLP</h2> Valeur du stock :<br><br><strong>${valeurHDLP.toFixed(2)} €</strong>
        </div>
        <div class="card">
            <h2>🍴 RCLP</h2> Valeur du stock :<br><br><strong>${valeurRCLP.toFixed(2)} €</strong>
        </div>
        <div class="card">
            <h2>📊 GLOBAL</h2>
            Articles : ${totalArticles}<br><br>
            Articles sans prix : ${sansPrix}<br><br>
            Articles stock zéro : ${stockZero}<br><br>
            Valeur HDLP : ${valeurHDLP.toFixed(2)} €<br><br>
            Valeur RCLP : ${valeurRCLP.toFixed(2)} €<br><br>
            <strong style="font-size:22px;color:#1976d2">Valeur totale : ${(valeurHDLP + valeurRCLP).toFixed(2)} €</strong>
        </div>
        ${analyseCategorie}
        `;

        renderOnglets();
        return;
    }

    if (categorieActive === "TOUS_HDLP" || categorieActive === "TOUS_RCLP") {
        html += `
        <div class="card">
            <b>Catégorie</b><br><br>
            <select id="filtreCategorie" onchange="localStorage.setItem('filtreCategorie', this.value); render();">
                <option value="" ${filtreCategorie === "" ? "selected" : ""}>Toutes</option>
                ${categoriesProduits.map(c => `<option value="${c}" ${filtreCategorie === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
            <br><br>
            <b>Stock minimum</b><br><br>
            <input type="number" placeholder="Aucun filtre" value="${filtreStock}" onchange="localStorage.setItem('filtreStock', this.value); render();">
        </div>
        `;
    }

liste
        .filter(a => {
            const matchRecherche = valeurRecherche === "" || String(a.code || "").includes(valeurRecherche.trim()) || (a.article || "").toLowerCase().includes(valeurRecherche.toLowerCase().trim());
            const matchCave = !filtreCave || a.cave === filtreCave;
            const matchCategorie = !filtreCategorie || a.categorie === filtreCategorie;
            const matchStock = filtreStock === "" || Number(a.stock || 0) >= Number(filtreStock);
            return matchRecherche && matchCave && matchCategorie && matchStock;
        })
        .forEach(a => {
            const valeur = (Number(a.stock) || 0) * (Number(a.prix) || 0);
            const estRCLP = String(a.cave || categorieActive).includes("RCLP");
            
            html += `
            <div class="card" style="border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); padding: 16px; margin-bottom: 15px; background: #fff; box-sizing: border-box;">
                <!-- En-tête : Nom & Code -->
                <div style="margin-bottom: 10px;">
                    <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #333;">${a.article}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        <span style="background: #f1f3f5; padding: 3px 8px; border-radius: 5px; font-size: 12px; color: #495057; font-weight: 600;">
                            Code : ${a.code}
                        </span>
                        <span style="background: #e2f0d9; padding: 3px 8px; border-radius: 5px; font-size: 12px; color: #2b542c; font-weight: 600;">
                            Cat. : ${a.categorie || "-"}
                        </span>
                        ${categorieActive === "TOUS_HDLP" || categorieActive === "TOUS_RCLP" ? `
                        <span style="background: #e7f1ff; padding: 3px 8px; border-radius: 5px; font-size: 12px; color: #0d6efd; font-weight: 600;">
                            Cave : ${a.cave}
                        </span>` : ""}
                    </div>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">

                <!-- Grille de saisie Stock & Prix -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                    <div>
                        <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">📦 Stock</label>
                        <input type="number" value="${a.stock || 0}" style="width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;" onchange="
                            if(!stockParCave['${a.cave || categorieActive}']) stockParCave['${a.cave || categorieActive}'] = {};
                            const qte = Number(this.value);
                            if(qte === 0) {
                                delete stockParCave['${a.cave || categorieActive}']['${a.code}'];
                            } else {
                                stockParCave['${a.cave || categorieActive}']['${a.code}'] = qte;
                            }
                            save();
                            render();
                        ">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">💶 Prix (€)</label>
                        <input type="number" step="0.01" value="${a.prix || 0}" style="width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;" onchange="
                            const nouveauPrix = Number(this.value);
                            if(catalogueArticles['${a.code}']) {
                                catalogueArticles['${a.code}'].prix = nouveauPrix;
                            }
                            save();
                            render();
                        ">
                    </div>
                </div>

                <!-- Bandeau Valeur totale -->
                <div style="background: #f8f9fa; padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px;">
                    <span style="color: #666;">Valeur totale :</span>
                    <span style="color: ${Number(a.stock) < 0 ? '#dc3545' : '#1976d2'}; font-weight: bold; font-size: 15px;">
                        ${valeur.toFixed(2)} €
                    </span>
                </div>

                <!-- Boutons d'action -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="modifierArticle('${a.code}')" style="flex: 1; min-width: 90px; background: #6c757d; color: white; border: none; padding: 9px; font-weight: bold; border-radius: 6px; cursor: pointer;">
                        ✏️ Modifier
                    </button>
                    <button onclick="transfererArticle('${a.code}', '${a.cave || categorieActive}')" style="flex: 1; min-width: 90px; background: #0d6efd; color: white; border: none; padding: 9px; font-weight: bold; border-radius: 6px; cursor: pointer;">
                        🔄 Transférer
                    </button>
                    ${estRCLP ? `
                    <button onclick="transfertCoupe('${a.code}', '${a.cave || categorieActive}')" style="background: #ffc107; color: #000; border: none; padding: 9px 12px; font-weight: bold; border-radius: 6px; cursor: pointer;">
                        🥂 Coupe
                    </button>` : ""}
                </div>
            </div>
            `;
        });

    let totalStock = 0;
    let totalValeur = 0;

    liste.forEach(a => {
        totalStock += Number(a.stock || 0);
        totalValeur += Number(a.stock || 0) * Number(a.prix || 0);
    });

    html += `
    <div class="card">
        <b>RÉCAPITULATIF</b><br><br>
        Articles : ${liste.length}<br>
        Articles avec stock : ${liste.filter(a => Number(a.stock) > 0).length}<br>
        Stock total : ${totalStock}<br>
        Valeur totale : ${totalValeur.toFixed(2)} €
    </div>
    `;

    document.getElementById("cards").innerHTML = html;
}
function supprimerValidation(validationId){
    if(!confirm("Supprimer toute la validation ?")){
        return;
    }

    let remontees = getRemonteesEffectuees();

    remontees
    .filter(r => r.validationId === validationId)
    .forEach(ligne => {
        annulerImpactStock(ligne);
    });

    save();

    remontees = remontees.filter(r => r.validationId !== validationId);
    saveRemonteesEffectuees(remontees);

    validationOuverte = null;
    render();
}

function estRedescente(type){
    return String(type).startsWith("REDESCENTE");
}

function annulerImpactStock(ligne){
    const cave = ligne.caveOrigine || ligne.cave;
    const code = ligne.code;
    const qte = Number(ligne.quantiteOrigine ?? ligne.quantite ?? 0);

    if(!cave || !code) return;

    if(!stockParCave[cave]) stockParCave[cave] = {};
    const stockActuel = Number(stockParCave[cave][code] || 0);

    // Si c'était une redescente, elle avait rajouté du stock, donc on l'enlève. Si c'était une remontée, elle avait retiré du stock, donc on le remet.
    const delta = estRedescente(ligne.type) ? -qte : qte;
    const nouveauStock = stockActuel + delta;

    if(nouveauStock === 0){
        delete stockParCave[cave][code];
    } else {
        stockParCave[cave][code] = nouveauStock;
    }
}

function appliquerImpactStock(ligne){
    const cave = ligne.cave;
    const code = ligne.code;
    const qte = Number(ligne.quantite || 0);

    if(!cave || !code) return;

    if(!stockParCave[cave]) stockParCave[cave] = {};
    const stockActuel = Number(stockParCave[cave][code] || 0);

    // Une redescente rajoute du stock, une remontée en retire
    const delta = estRedescente(ligne.type) ? qte : -qte;
    const nouveauStock = stockActuel + delta;

    if(nouveauStock === 0){
        delete stockParCave[cave][code];
    } else {
        stockParCave[cave][code] = nouveauStock;
    }
}

function supprimerRemontee(id){
    if(!confirm("Supprimer cet article ?")){
        return;
    }

    let remontees = getRemonteesEffectuees();
    const ligne = remontees.find(r => r.id === id);

    if(ligne){
        annulerImpactStock(ligne);
        save();
    }

    remontees = remontees.filter(r => r.id !== id);
    saveRemonteesEffectuees(remontees);

    render();
}

function modifierRemontee(id){
    const remontees = getRemonteesEffectuees();
    const ligne = remontees.find(r => r.id === id);

    if(!ligne){
        return;
    }

    // 1. On annule l'ancien impact
    annulerImpactStock(ligne);

    // 2. On met à jour avec les nouvelles valeurs du formulaire
    ligne.cave = document.getElementById("cave_" + id).value;
    ligne.quantite = Number(document.getElementById("quantite_" + id).value || 0);

    // 3. On applique le nouvel impact
    appliquerImpactStock(ligne);

    ligne.caveOrigine = ligne.cave;
    ligne.quantiteOrigine = ligne.quantite;

    save();
    saveRemonteesEffectuees(remontees);

    alert("Modification enregistrée");
    render();
}
function exportHistoriqueExcel(){
    const filtreSite = localStorage.getItem("filtreSite") || "";
    const filtreType = localStorage.getItem("filtreType") || "";
    const filtreFournisseur = localStorage.getItem("filtreFournisseur") || "";
    const filtreDateDebut = localStorage.getItem("filtreDateDebut") || "";
    const filtreDateFin = localStorage.getItem("filtreDateFin") || "";

    // On récupère l'historique depuis la clé globale centralisée
    const mouvementsGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];
    let exportData = [];

    mouvementsGlobal.forEach(m => {
        const cave = m.cave || "";

        if(filtreSite && !cave.startsWith(filtreSite)){
            return;
        }

        if(filtreType && !String(m.type).includes(filtreType)){
            return;
        }

        if(filtreFournisseur && String(m.fournisseur || "").toUpperCase() !== String(filtreFournisseur).toUpperCase()){
            return;
        }

        let dateMouvement = "";
        if(String(m.date).includes("/")){
            const morceaux = m.date.split(" ")[0].split("/");
            if(morceaux.length === 3){
                dateMouvement = morceaux[2] + "-" + morceaux[1].padStart(2,"0") + "-" + morceaux[0].padStart(2,"0");
            }
        } else {
            dateMouvement = String(m.date).substring(0,10);
        }

        if(filtreDateDebut && dateMouvement < filtreDateDebut){
            return;
        }

        if(filtreDateFin && dateMouvement > filtreDateFin){
            return;
        }

        exportData.push({
            Date: m.date,
            Article: m.article,
            Code: m.code,
            Cave: cave,
            Type: m.type,
            Quantite: m.quantite,
            Origine: m.origine,
            Fournisseur: m.fournisseur || ""
        });
    });

    if(exportData.length === 0){
        alert("Aucun mouvement à exporter");
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Historique");

    const maintenant = new Date();
    const fichier = "historique-stock-" +
        maintenant.getFullYear() + "-" +
        String(maintenant.getMonth()+1).padStart(2,"0") + "-" +
        String(maintenant.getDate()).padStart(2,"0") + ".xlsx";

    XLSX.writeFile(wb, fichier);
}

function importerExcel(event){
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e){
        alert("DEBUT IMPORT");

        const workbook = XLSX.read(e.target.result, { type: "array" });
        
        // Réinitialisation propre des structures vers le nouveau format léger
        catalogueArticles = {};
        stockParCave = {
            "HDLP MINI BAR": {},
            "HDLP SOFT": {},
            "HDLP BAR": {},
            "HDLP SEMINAIRE": {},
            "RCLP ALCOOL": {},
            "RCLP SOFT": {},
            "RCLP VIN": {}
        };
 function importerFeuille(nomFeuille, categorie) {
            const sheet = workbook.Sheets[nomFeuille];
            if (!sheet) {
                console.log("Feuille introuvable :", nomFeuille);
                return;
            }

            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            rows.forEach(row => {
                const code = String(row.NA || row.CODE || "").trim();
                if (!code) return;

                // On cherche si l'article existait déjà dans l'ancien catalogue ou les anciennes structures pour récupérer ses infos
                // (ancienStock était un objet de catégories contenant des tableaux d'articles dans la fonction parente, ou on regarde catalogueArticles directement)
                let ancienArticle = catalogueArticles[code];
                if (!ancienArticle) {
                    // Recherche de secours dans l'ancien format si présent
                    Object.keys(ancienStock).forEach(cat => {
                        const trouve = (ancienStock[cat] || []).find(a => String(a.code) === String(code));
                        if (trouve) ancienArticle = trouve;
                    });
                }

                const colisage = Number(ancienArticle?.colisage || 1);
                const stockInventaire = (Number(row.PAQUET || 0) * colisage) + Number(row.PIECE || 0);

                // 1. Remplissage ou mise à jour du Catalogue Unique (les infos ne sont écrites qu'une seule fois)
                if (!catalogueArticles[code]) {
                    catalogueArticles[code] = {
                        code: code,
                        article: ancienArticle?.article || row.ARTICLE || "",
                        categorie: ancienArticle?.categorie || "",
                        prix: Number(ancienArticle?.prix || 0),
                        fournisseur: ancienArticle?.fournisseur || "",
                        codeFournisseur: ancienArticle?.codeFournisseur || "",
                        colisage: colisage
                    };
                }

                // 2. Enregistrement de la quantité dans la cave spécifique
                if (!stockParCave[categorie]) stockParCave[categorie] = {};
                if (stockInventaire > 0) {
                    stockParCave[categorie][code] = stockInventaire;
                } else {
                    delete stockParCave[categorie][code]; // On évite de stocker des zéros inutiles
                }

                // Mémorisation de la cave pour cet article
                memoCaves[code] = categorie;
            });
        }

        importerFeuille("INVENTAIRE HDLP CAVE MINI BAR", "HDLP MINI BAR");
        importerFeuille("INVENTAIRE HDLP CAVE SOFT", "HDLP SOFT");
        importerFeuille("INVENTAIRE CAVE BAR", "HDLP BAR");
        importerFeuille("INVENTAIRE CAVE SEMINAIRE", "HDLP SEMINAIRE");
        importerFeuille("INVENTAIRE RCLP CAVE ALCOOL", "RCLP ALCOOL");
        importerFeuille("INVENTAIRE RCLP CAVE SOFT", "RCLP SOFT");
        importerFeuille("INVENTAIRE RCLP CAVE VIN", "RCLP VIN");

        alert("AVANT SAVE");
        
        save();
        localStorage.removeItem("inventaireHDLP");
        
        alert("APRES SAVE");

        const stockCode60 = stockParCave["HDLP BAR"]?.["60"] || 0;
        alert("Vérification stock code 60 : " + (stockCode60 > 0 ? stockCode60 : "introuvable"));

        mettreAJourSuggestions();
        render();

        alert("✅ Inventaire importé");
    };

    reader.readAsArrayBuffer(file);
}
function renderArticles(){
    document.getElementById("cards").innerHTML = `
    <div class="card">
        <h2>📦 Gestion des articles</h2>
        <input id="rechercheArticleMaster" placeholder="Code ou article" oninput="afficherArticlesMaster()">
        <br><br>
        <button onclick="nouvelArticle()">➕ Nouvel article</button>
        <br><br>
        <div id="listeArticlesMaster"></div>
    </div>
    `;

    afficherArticlesMaster();
}

function afficherArticlesMaster(){
    const recherche = document.getElementById("rechercheArticleMaster")?.value?.toLowerCase() || "";
    let html = "";

    // On parcourt directement le catalogue unique (les 900 articles uniques)
    Object.keys(catalogueArticles).forEach(code => {
        const article = catalogueArticles[code];

        if(
            recherche &&
            !String(code).includes(recherche) &&
            !String(article.article).toLowerCase().includes(recherche)
        ){
            return;
        }

        html += `
        <div class="card">
            <b>${article.article}</b>
            <br><br>
            Code
            <input value="${article.code}" onchange="modifierArticleMaster('${code}', 'code', this.value)">
            <br><br>
            Article
            <input value="${article.article}" onchange="modifierArticleMaster('${code}', 'article', this.value)">
            <br><br>
            Fournisseur
            <input list="listeFournisseursMaster" value="${article.fournisseur || ''}" onchange="modifierArticleMaster('${code}', 'fournisseur', this.value)">
            <br><br>
            Code fournisseur
            <input value="${article.codeFournisseur || ''}" onchange="modifierArticleMaster('${code}', 'codeFournisseur', this.value)">
            <br><br>
            Catégorie
            <input list="listeCategoriesMaster" value="${article.categorie || ''}" onchange="modifierArticleMaster('${code}', 'categorie', this.value)">
            <br><br>
            Prix
            <input type="number" step="0.01" value="${article.prix || 0}" onchange="modifierArticleMaster('${code}', 'prix', this.value)">
            <br><br>
            Colisage
            <input type="number" value="${article.colisage || 1}" onchange="modifierArticleMaster('${code}', 'colisage', this.value)">
        </div>
        `;
    });

    const fournisseursList = [...new Set(Object.values(catalogueArticles).map(a => a.fournisseur).filter(f => f))].sort();
    const categoriesList = [...new Set(Object.values(catalogueArticles).map(a => a.categorie).filter(c => c))].sort();

    html += `
    <datalist id="listeFournisseursMaster">
        ${fournisseursList.map(f => `<option value="${f}">`).join("")}
    </datalist>
    <datalist id="listeCategoriesMaster">
        ${categoriesList.map(c => `<option value="${c}">`).join("")}
    </datalist>
    `;

    document.getElementById("listeArticlesMaster").innerHTML = html;
}

function modifierArticleMaster(codeActuel, champ, valeur){
    let article = catalogueArticles[codeActuel];
    if(!article) return;

    if(champ === "code"){
        const nouveauCode = String(valeur).trim();
        if(!nouveauCode || catalogueArticles[nouveauCode]) {
            alert("Code invalide ou déjà existant !");
            afficherArticlesMaster();
            return;
        }
        // Si le code change, on déplace l'article dans l'objet catalogue
        catalogueArticles[nouveauCode] = { ...article, code: nouveauCode };
        delete catalogueArticles[codeActuel];

        // On met aussi à jour les clés dans les stocks par cave et memoCaves si nécessaire
        Object.keys(stockParCave).forEach(cave => {
            if(stockParCave[cave][codeActuel] !== undefined) {
                stockParCave[cave][nouveauCode] = stockParCave[cave][codeActuel];
                delete stockParCave[cave][codeActuel];
            }
        });
        if(memoCaves[codeActuel]) {
            memoCaves[nouveauCode] = memoCaves[codeActuel];
            delete memoCaves[codeActuel];
        }
    } else {
        article[champ] = (champ === "prix" || champ === "colisage") ? Number(valeur) : valeur;
    }

    save();
    mettreAJourSuggestions();
    afficherArticlesMaster();
}

function nouvelArticle(){
    const code = prompt("Code article");
    if(!code) return;

    const trimmedCode = String(code).trim();
    if(catalogueArticles[trimmedCode]){
        alert("Un article avec ce code existe déjà !");
        return;
    }

    const nom = prompt("Nom article");
    if(!nom) return;

    // Création unique dans le catalogue (plus besoin de dupliquer dans 7 tableaux de caves !)
    catalogueArticles[trimmedCode] = {
        code: trimmedCode,
        article: nom,
        categorie: "",
        prix: 0,
        fournisseur: "",
        codeFournisseur: "",
        colisage: 1
    };

    save();
    mettreAJourSuggestions();
    afficherArticlesMaster();
    alert("Article créé avec succès ✅");
}
function renderFournisseurs(){
    // Extraction des fournisseurs depuis le catalogue unique
    Object.values(catalogueArticles).forEach(article => {
        const nom = String(article.fournisseur || "").trim();
        if(
            nom &&
            !fournisseurs.some(
                f => String(f.nom || "").trim().toUpperCase() === nom.toUpperCase()
            )
        ){
            fournisseurs.push({
                id: crypto.randomUUID(),
                nom: nom,
                numeroClient: "",
                representant: "",
                portable: "",
                bureau: "",
                email: ""
            });
        }
    });
    saveFournisseurs();

    document.getElementById("cards").innerHTML = `
    <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff; box-sizing: border-box;">
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">🚚 Gestion des fournisseurs</h2>
        <br>

        <!-- Barre de recherche moderne -->
        <div style="margin-bottom: 15px;">
            <input
            id="rechercheFournisseur"
            placeholder="🔍 Nom fournisseur ou représentant"
            oninput="afficherFournisseurs()"
            style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
        </div>

        <!-- Bouton Nouveau fournisseur moderne -->
        <div style="margin-bottom: 20px;">
            <button
            onclick="nouveauFournisseur()"
            style="width: 100%; height: 45px; background: #198754; color: white; border: none; font-weight: bold; font-size: 15px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                ➕ Nouveau fournisseur
            </button>
        </div>

        <div id="listeFournisseurs"></div>
    </div>
    `;
    afficherFournisseurs();
}

function analyserStockage() {
    const donnees = [];

    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        const taille = (localStorage.getItem(cle) || "").length;
        donnees.push({ cle, taille });
    }

    donnees.sort((a, b) => b.taille - a.taille);

    let rapport = "📦 TOP STOCKAGE\n\n";
    let total = 0;

    donnees.forEach(item => {
        total += item.taille;
        rapport += item.cle + " : " + (item.taille / 1024).toFixed(2) + " Ko\n";
    });

    rapport += "\nTOTAL : " + (total / 1024).toFixed(2) + " Ko";
    alert(rapport);
}

function nouveauFournisseur(){
    const nom = prompt("Nom du nouveau fournisseur :");
    if(!nom || nom.trim() === "") return;

    fournisseurs.push({
        id: Date.now().toString(),
        nom: nom.trim(),
        numeroClient: "",
        representant: "",
        portable: "",
        bureau: "",
        email: ""
    });

    saveFournisseurs();
    afficherFournisseurs();
}
function supprimerFournisseur(id){
    if(!confirm("Supprimer ce fournisseur ?")) return;
    fournisseurs = fournisseurs.filter(f => String(f.id) !== String(id));
    saveFournisseurs();
    afficherFournisseurs();
}

function afficherFournisseurs(){
    const recherche = document.getElementById("rechercheFournisseur")?.value?.toLowerCase() || "";
    let html = "";
    
    fournisseurs.forEach(f => {
        if(
            recherche &&
            !String(f.nom || "").toLowerCase().includes(recherche) &&
            !String(f.representant || "").toLowerCase().includes(recherche)
        ){
            return;
        }

        html += `
        <div class="card" style="border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); padding: 16px; margin-bottom: 15px; background: #fff; box-sizing: border-box;">
            <!-- En-tête : Nom du fournisseur -->
            <div style="margin-bottom: 12px;">
                <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">🏢 Nom fournisseur</label>
                <input value="${f.nom || ''}" onchange="modifierFournisseur('${f.id}', 'nom', this.value)" style="width: 100%; padding: 9px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; font-weight: bold; color: #333;">
            </div>

            <!-- Grille Numéro client & Représentant -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                    <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">🔖 N° client</label>
                    <input value="${f.numeroClient || ''}" onchange="modifierFournisseur('${f.id}', 'numeroClient', this.value)" style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
                </div>
                <div>
                    <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">👤 Représentant</label>
                    <input value="${f.representant || ''}" onchange="modifierFournisseur('${f.id}', 'representant', this.value)" style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
                </div>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">

            <!-- Section Téléphone Portable & Actions (Appel / SMS) -->
            <div style="margin-bottom: 12px;">
                <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">📱 Portable</label>
                <input type="tel" value="${f.portable || ''}" onchange="modifierFournisseur('${f.id}', 'portable', this.value)" style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; margin-bottom: 8px;">
                
                <div style="display: flex; gap: 8px;">
                    <button onclick="location.href='tel:${f.portable || ''}'" style="flex: 1; height: 45px; background: #28a745; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        📞 Appeler
                    </button>
                    <button onclick="location.href='sms:${f.portable || ''}'" style="flex: 1; height: 45px; background: #0d6efd; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        💬 SMS
                    </button>
                </div>
            </div>

            <!-- Téléphone Bureau -->
            <div style="margin-bottom: 12px;">
                <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">☎️ Téléphone bureau</label>
                <input type="tel" inputmode="numeric" value="${f.bureau || ''}" onchange="modifierFournisseur('${f.id}', 'bureau', this.value)" style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
            </div>

            <!-- Section E-mail & Action (Mail) -->
            <div style="margin-bottom: 15px;">
                <label style="font-size: 12px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">✉️ Adresse e-mail</label>
                <input type="email" value="${f.email || ''}" onchange="modifierFournisseur('${f.id}', 'email', this.value)" style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; margin-bottom: 8px;">
                
                <button type="button" onclick="location.href='mailto:${f.email || ''}'" style="width: 100%; height: 45px; background: #ff9800; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    📧 Envoyer un mail
                </button>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">

            <!-- Bouton de suppression -->
            <button type="button" style="width: 100%; height: 42px; background: #dc3545; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="supprimerFournisseur('${f.id}')">
                🗑️ Supprimer le fournisseur
            </button>
        </div>
        `;
    });

    document.getElementById("listeFournisseurs").innerHTML = html;
}

function renderStatsRemontees(site){
    document.getElementById("cards").innerHTML = `
    <div class="card">
        <h2>📊 Remontées ${site}</h2>
        Date début
        <br><br>
        <input type="date" id="dateDebutRemontee">
        <br><br>
        Date fin
        <br><br>
        <input type="date" id="dateFinRemontee">
        <br><br>
        <button onclick="calculerStatsRemontees('${site}')">📊 Afficher</button>
    </div>
    <div id="resultatStatsRemontee"></div>
    <div class="card">
        <h2>📈 Evolution des remontées</h2>
        <button onclick="ouvrirGraphiquePleinEcran('graphRemontees')" style="width:100%; height:60px; font-size:20px; font-weight:bold; margin-bottom:10px;">🔍 Plein écran</button>
        <canvas id="graphRemontees"></canvas>
    </div>
    `;
}
function calculerStatsRemontees(site){
    // Récupération de l'historique global des mouvements
    const mouvementsGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];
    let mouvements = [];

    mouvementsGlobal.forEach(m => {
        if(
            String(m.origine || "").toUpperCase().includes("REMONTEE") &&
            String(m.origine || "").toUpperCase().includes(site.toUpperCase())
        ){
            const artInfo = catalogueArticles[m.code] || {};
            mouvements.push({
                article: m.article || artInfo.article || "Inconnu",
                code: m.code,
                quantite: Number(m.quantite || 0),
                date: m.date,
                categorie: artInfo.categorie || "Sans catégorie"
            });
        }
    });

    const debut = document.getElementById("dateDebutRemontee").value;
    const fin = document.getElementById("dateFinRemontee").value;

    const ventesJour = {};
    const articles = {};
    const categoriesStats = {};

    let total = 0;

    mouvements.forEach(v => {
        let dateVente = "";

        if(String(v.date).includes("/")){
            const p = v.date.split(" ")[0].split("/");
            if(p.length === 3){
                dateVente = p[2] + "-" + p[1].padStart(2,"0") + "-" + p[0].padStart(2,"0");
            }
        } else {
            dateVente = String(v.date).substring(0,10);
        }

        if(debut && dateVente < debut){
            return;
        }

        if(fin && dateVente > fin){
            return;
        }

        total += v.quantite;

        if(!articles[v.article]){
            articles[v.article] = 0;
        }
        articles[v.article] += v.quantite;

        if(!ventesJour[dateVente]){
            ventesJour[dateVente] = 0;
        }
        ventesJour[dateVente] += v.quantite;

        if(!categoriesStats[v.categorie]){
            categoriesStats[v.categorie] = 0;
        }
        categoriesStats[v.categorie] += v.quantite;
    });

    const top = Object.entries(articles)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,35);

    let html = `
    <div class="card">
        <h2>📊 Résultat</h2>
        Quantité remontée : <b>${total}</b>
        <br><br>
        <h3>🏆 Top remontées</h3>
    `;

    top.forEach(t=>{
        const pourcentage = total > 0 ? ((t[1]/total)*100).toFixed(1) : 0;
        html += `${t[0]} : <b>${t[1]}</b> (${pourcentage}%)<br>`;
    });

    html += "</div>";
    document.getElementById("resultatStatsRemontee").innerHTML = html;

    const canvas = document.getElementById("graphRemontees");
    if(canvas){
        const ancien = Chart.getChart(canvas);
        if(ancien){
            ancien.destroy();
        }
        canvas.height = Math.max(500, Object.keys(categoriesStats).length * 50);
        
        new Chart(canvas, {
            type: "bar",
            data: {
                labels: Object.keys(categoriesStats),
                datasets: [{
                    label: "Quantités remontées",
                    data: Object.values(categoriesStats),
                    backgroundColor: ["#1976d2", "#ff9800", "#28a745", "#e91e63", "#9c27b0", "#795548"]
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: false,
                maintainAspectRatio: true,
                layout: { padding: { left: 20 } },
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        ticks: { autoSkip: false, font: { size: 16 } }
                    },
                    x: {
                        beginAtZero: true,
                        ticks: { maxRotation: 0, minRotation: 0, font: { size: 14 } }
                    }
                }
            }
        });
    }
}

function ouvrirGraphiquePleinEcran(id){
    const canvas = document.getElementById(id);
    if(!canvas) return;

    const image = canvas.toDataURL("image/png");
    const fenetre = window.open("","Graphique");

    fenetre.document.write(`
        <html>
        <head>
            <title>Graphique</title>
        </head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; background:white;">
            <img src="${image}" style="width:100%; height:auto;">
        </body>
        </html>
    `);
}

function mettreAJourStockJson(){
    const dataAExporter = {
        catalogue: catalogueArticles,
        stocks: stockParCave,
        memoCaves: memoCaves
    };

    const blob = new Blob([JSON.stringify(dataAExporter, null, 2)], { type: "application/json" });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = "stock.json";
    lien.click();
}

function migrerRemontees(){
    const remontees = getRemonteesEffectuees();
    remontees.forEach(r => {
        if(!r.caveOrigine){
            r.caveOrigine = r.cave;
        }
        if(r.quantiteOrigine === undefined){
            r.quantiteOrigine = r.quantite;
        }
    });
    saveRemonteesEffectuees(remontees);
    alert("Migration terminée");
}

function getRemonteesEffectuees(){
    return JSON.parse(localStorage.getItem("remonteesEffectuees") || "[]");
}

function saveRemonteesEffectuees(data){
    if(data.length > 200){
        data = data.slice(0, 200);
    }
    localStorage.setItem("remonteesEffectuees", JSON.stringify(data));
}

function supprimerFournisseur(id){
    if(!confirm("Supprimer ce fournisseur ?")){
        return;
    }
    fournisseurs = fournisseurs.filter(f => String(f.id) !== String(id));
    saveFournisseurs();
    afficherFournisseurs();
}

// Initialisation au démarrage
mettreAJourSuggestions();
changerSite("DASHBOARD");

console.log(
    "Stock code 60 (HDLP BAR) au démarrage :",
    stockParCave["HDLP BAR"]?.["60"] || "0 ou introuvable"
);
