let hdlpTab = "devant";
let hdlpData = JSON.parse(localStorage.getItem("caveData")) || {
    resume: [],
    devant: [],
    champagne: [],
    alcool: []
};

function ouvrirRemonteeHDLP(){
    renderRemonteeHDLP();
}

function renderRemonteeHDLP(){
    document.getElementById("cards").innerHTML = `
        <div class="card">
            <div style="margin-bottom: 15px;">
                <button onclick="changerSite('APPLICATIONS')" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                    ⬅ Retour
                </button>
            </div>

            <h2>📤 Remontées HDLP</h2>
            <br>

            <!-- Barre d'onglets dynamique -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
                <button onclick="changerOngletHDLP('resume')" style="flex: 1; min-width: 100px; height: 45px; font-size: 14px; font-weight: bold; background: ${hdlpTab === 'resume' ? '#1976d2' : '#f8f9fa'}; color: ${hdlpTab === 'resume' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                    📋 RÉSUMÉ
                </button>
                <button onclick="changerOngletHDLP('devant')" style="flex: 1; min-width: 110px; height: 45px; font-size: 14px; font-weight: bold; background: ${hdlpTab === 'devant' ? '#1976d2' : '#f8f9fa'}; color: ${hdlpTab === 'devant' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                    DEVANT BAR
                </button>
                <button onclick="changerOngletHDLP('champagne')" style="flex: 1; min-width: 110px; height: 45px; font-size: 14px; font-weight: bold; background: ${hdlpTab === 'champagne' ? '#1976d2' : '#f8f9fa'}; color: ${hdlpTab === 'champagne' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                    CHAMPAGNE
                </button>
                <button onclick="changerOngletHDLP('alcool')" style="flex: 1; min-width: 100px; height: 45px; font-size: 14px; font-weight: bold; background: ${hdlpTab === 'alcool' ? '#1976d2' : '#f8f9fa'}; color: ${hdlpTab === 'alcool' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                    ALCOOL
                </button>
            </div>

            <!-- Bouton d'ajout d'article -->
            <div style="margin-top: 10px; margin-bottom: 15px;">
                <button
                onclick="ouvrirAjoutArticleHDLP()"
                style="
                width: 100%;
                height: 45px;
                background: #198754;
                color: white;
                font-weight: bold;
                font-size: 14px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                ">
                ➕ Ajouter un article
                </button>
            </div>

            <hr>
            <input
            id="rechercheHDLP"
            placeholder="🔍 Rechercher un article ou un code"
            oninput="renderContenuHDLP()"
            style="
                width:100%;
                padding:10px;
                font-size:16px;
                margin-bottom:10px;
                box-sizing:border-box;
                border: 1px solid #ccc;
                border-radius: 6px;
            ">

            <div id="contenuHDLP"></div>

            <div
            id="popupAjoutHDLP"
            style="
            display:none;
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,.6);
            z-index:9999;
            ">
                <div
                style="
                background:white;
                width:95%;
                max-width:700px;
                margin:20px auto;
                padding:15px;
                border-radius:12px;
                max-height:85vh;
                overflow:auto;
                ">
                    <h2>➕ Ajouter un article</h2>
                    <input
                    id="rechercheAjoutHDLP"
                    placeholder="🔍 Rechercher un article"
                    oninput="afficherArticlesAjoutHDLP()"
                    style="
                    width:100%;
                    padding:10px;
                    font-size:16px;
                    box-sizing:border-box;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    ">
                    <br><br>
                    <div id="listeAjoutHDLP"></div>
                    <br>
                    <button onclick="fermerAjoutArticleHDLP()" style="padding: 8px 16px; border-radius: 6px; background: #dc3545; color: white; border: none; cursor: pointer; font-weight: bold;">
                    ❌ Fermer
                    </button>
                </div>
            </div>
        </div>
    `;

    renderContenuHDLP();
}
function ouvrirAjoutArticleHDLP(){
    document.getElementById("popupAjoutHDLP").style.display = "block";
    afficherArticlesAjoutHDLP();
}

function fermerAjoutArticleHDLP(){
    document.getElementById("popupAjoutHDLP").style.display = "none";
}

function afficherArticlesAjoutHDLP(){
    const recherche = document.getElementById("rechercheAjoutHDLP")?.value?.toLowerCase() || "";
    let html = "";
    const dejaVus = new Set();

    // On pioche directement dans catalogueArticles
    Object.values(catalogueArticles).forEach(article => {
        const code = String(article.code);
        if(dejaVus.has(code)) return;
        dejaVus.add(code);

        if(
            recherche &&
            !String(article.article || "").toLowerCase().includes(recherche) &&
            !code.includes(recherche)
        ){
            return;
        }

        const existe = hdlpData[hdlpTab].some(a => String(a.code) === code);
        if(existe) return;

        html += `
        <div class="card">
            <b>${article.article}</b>
            <br>
            Code : ${article.code}
            <br><br>
            <button onclick="ajouterArticleDepuisStockHDLP('${article.code}')">
            ✅ Ajouter
            </button>
        </div>
        `;
    });

    document.getElementById("listeAjoutHDLP").innerHTML = html;
}

function ajouterArticleDepuisStockHDLP(code){
    const articleCentral = catalogueArticles[code];
    if(!articleCentral) return;

    const existe = hdlpData[hdlpTab].some(a => String(a.code) === String(code));
    if(existe){
        alert("Article déjà présent");
        return;
    }

    hdlpData[hdlpTab].push({
        id: crypto.randomUUID(),
        code: articleCentral.code,
        article: articleCentral.article,
        remontee: 0,
        redescente: 0
    });

    localStorage.setItem("caveData", JSON.stringify(hdlpData));
    fermerAjoutArticleHDLP();
    renderContenuHDLP();
}

// Calcul du stock total dans les caves HDLP via stockParCave
function getStockHDLP(code){
    let total = 0;
    [
        "HDLP SOFT",
        "HDLP BAR",
        "HDLP MINI BAR",
        "HDLP SEMINAIRE"
    ].forEach(cave => {
        total += Number(stockParCave[cave]?.[code] || 0);
    });
    return total;
}

// Calcul du stock total dans les caves RCLP via stockParCave
function getStockRCLP(code){
    let total = 0;
    [
        "RCLP SOFT",
        "RCLP VIN",
        "RCLP ALCOOL"
    ].forEach(cave => {
        total += Number(stockParCave[cave]?.[code] || 0);
    });
    return total;
}

function changerOngletHDLP(tab){
    hdlpTab = tab;
    renderRemonteeHDLP();
}
function renderResumeHDLP(){
    let html = `
    <div style="margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 18px; color: #333;">📋 Résumé des remontées</h3>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Vérifiez et validez les mouvements avant l'enregistrement final.</p>
    </div>
    `;

    const articles = [
        ...(hdlpData.devant || []),
        ...(hdlpData.champagne || []),
        ...(hdlpData.alcool || [])
    ];

    let totalArticles = 0;
    let totalQuantites = 0;

    articles.forEach(article => {
        const remontee = Number(article.remontee || 0);
        const redescente = Number(article.redescente || 0);

        if(remontee <= 0 && redescente <= 0){
            return;
        }

        totalArticles++;
        totalQuantites += remontee + redescente;

        html += `
        <div class="card card-resume" id="resume_${article.id}" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 15px; margin-bottom: 15px; background: #fff; transition: background 0.2s;">
            <!-- En-tête -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 16px; color: #333;">${article.article}</h4>
                    <span style="background: #f1f3f5; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #555; font-weight: 500;">
                        Code : ${article.code}
                    </span>
                </div>
                <button 
                style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;" 
                onclick="retirerArticleResumeHDLP('${article.id}')"
                title="Retirer">
                    🗑️ Retirer
                </button>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">

            <!-- Détails des quantités -->
            <div style="display: flex; gap: 15px; margin-bottom: 12px; font-size: 14px;">
                <span style="background: #e7f1ff; color: #0d6efd; padding: 6px 10px; border-radius: 6px; font-weight: bold;">
                    ⬆️ Remontée : ${remontee}
                </span>
                <span style="background: #e2f0d9; color: #385723; padding: 6px 10px; border-radius: 6px; font-weight: bold;">
                    ⬇️ Redescente : ${redescente}
                </span>
            </div>

            <!-- Paramètres de validation (Checkbox + Cave d'origine) -->
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 15px; align-items: center; background: #f8f9fa; padding: 10px; border-radius: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">
                    <input type="checkbox" id="check_${article.id}" checked style="width: 18px; height: 18px; cursor: pointer;">
                    Traiter
                </label>
                
                <div>
                    <label style="font-size: 11px; color: #666; display: block; margin-bottom: 2px; font-weight: 600;">Cave d'origine :</label>
                    <select id="cave_${article.id}" style="width: 100%; padding: 6px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px; background: white;">
                        <option selected>HDLP BAR</option>
                        <option>HDLP SOFT</option>
                        <option>HDLP MINI BAR</option>
                        <option>HDLP SEMINAIRE</option>
                    </select>
                </div>
            </div>
        </div>
        `;
    });

    if(totalArticles === 0){
        html += `
        <div class="card" style="text-align: center; padding: 30px; color: #666;">
            <p>Aucune quantité saisie pour le moment.</p>
        </div>
        `;
    } else {
        html += `
        <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #f8f9fa; margin-top: 20px;">
            <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Récapitulatif global</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
                <span>Total articles : <b>${totalArticles}</b></span>
                <span>Total quantités : <b>${totalQuantites}</b></span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="font-size: 13px; font-weight: bold; color: #495057; display: block; margin-bottom: 5px;">📅 Date de remontée</label>
                <input type="date" id="dateRemonteeHDLP" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 6px; font-size: 16px; box-sizing: border-box; background: white;">
            </div>

            <button onclick="validerRemonteeResumeHDLP()" style="width: 100%; background: #198754; color: white; border: none; padding: 12px; font-weight: bold; font-size: 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                ✅ Valider la remontée
            </button>
        </div>
        `;
    }

    document.getElementById("contenuHDLP").innerHTML = html;
}
function retirerArticleResumeHDLP(id){
    ["devant","champagne","alcool"].forEach(onglet => {
        const article = hdlpData[onglet].find(a => a.id === id);
        if(article){
            article.remontee = 0;
            article.redescente = 0;
        }
    });

    localStorage.setItem("caveData", JSON.stringify(hdlpData));
    renderResumeHDLP();
}

function validerRemonteeResumeHDLP(){
    const date = document.getElementById("dateRemonteeHDLP").value;
    const mouvements = [];
    const validationId = crypto.randomUUID();
    const remontees = getRemonteesEffectuees();
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    ["devant","champagne","alcool"].forEach(onglet => {
        hdlpData[onglet].forEach(article => {
            const remontee = Number(article.remontee || 0);
            const redescente = Number(article.redescente || 0);

            if(remontee <= 0 && redescente <= 0){
                return;
            }

            const coche = document.getElementById("check_" + article.id);
            if(!coche || !coche.checked){
                return;
            }

            const cave = document.getElementById("cave_" + article.id).value;
            const code = String(article.code);

            // Mise à jour du stock dans la bonne cave via notre fonction d'ajustement ou directement
            if(!stockParCave[cave]) stockParCave[cave] = {};
            const stockActuel = Number(stockParCave[cave][code] || 0);
            const nouveauStock = stockActuel - remontee + redescente;
            
            if(nouveauStock === 0){
                delete stockParCave[cave][code];
            } else {
                stockParCave[cave][code] = nouveauStock;
            }

            mouvements.push({
                article: article.article,
                code: code,
                remontee: remontee,
                redescente: redescente,
                cave: cave,
                date: date,
                type: "Mouvement HDLP"
            });

            if(remontee > 0){
                remontees.unshift({
                    id: crypto.randomUUID(),
                    validationId: validationId,
                    date: date,
                    dateHeure: new Date().toISOString(),
                    type: "HDLP",
                    cave: cave,
                    caveOrigine: cave,
                    articleId: article.id,
                    code: code,
                    designation: article.article,
                    quantite: remontee,
                    quantiteOrigine: remontee
                });

                historiqueGlobal.push({
                    date: new Date().toISOString(),
                    code: code,
                    article: article.article,
                    cave: cave,
                    type: "SORTIE",
                    quantite: remontee,
                    origine: "REMONTEE HDLP"
                });
            }

            if(redescente > 0){
                remontees.unshift({
                    id: crypto.randomUUID(),
                    validationId: validationId,
                    date: date,
                    dateHeure: new Date().toISOString(),
                    type: "REDESCENTE HDLP",
                    cave: cave,
                    caveOrigine: cave,
                    articleId: article.id,
                    code: code,
                    designation: article.article,
                    quantite: redescente,
                    quantiteOrigine: redescente
                });

                historiqueGlobal.push({
                    date: new Date().toISOString(),
                    code: code,
                    article: article.article,
                    cave: cave,
                    type: "ENTREE",
                    quantite: redescente,
                    origine: "REDESCENTE HDLP"
                });
            }

            article.remontee = 0;
            article.redescente = 0;
        });
    });

    localStorage.setItem("remonteesEffectuees", JSON.stringify(remontees.slice(0, 100)));
    save(); // Sauvegarde stockParCave et catalogueArticles
    localStorage.setItem("caveData", JSON.stringify(hdlpData));
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));

    alert(mouvements.length + " article(s) validé(s)");
    changerOngletHDLP("devant");
}

function renderContenuHDLP(){
    if(hdlpTab === "resume"){
        renderResumeHDLP();
        return;
    }

    const recherche = document.getElementById("rechercheHDLP")?.value?.toLowerCase() || "";
    const liste = hdlpData[hdlpTab] || [];
    let html = "";

    liste
    .filter(article => {
        return (
            String(article.article || "").toLowerCase().includes(recherche) ||
            String(article.code || "").toLowerCase().includes(recherche)
        );
    })
    .forEach(article => {
        const stockHDLP = getStockHDLP(article.code);
        const stockRCLP = getStockRCLP(article.code);

        html += `
        <div class="card" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 15px; margin-bottom: 15px; background: #fff;">
            <!-- En-tête Article -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${article.article}</h3>
                    <span style="background: #f1f3f5; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #555; font-weight: 500;">
                        Code : ${article.code}
                    </span>
                </div>
            </div>

            <!-- Badges de stock -->
            <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                <span style="background: #e7f1ff; color: #0d6efd; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    📦 HDLP : ${stockHDLP}
                </span>
                <span style="background: #fff3cd; color: #856404; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    📦 RCLP : ${stockRCLP}
                </span>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">

            <!-- Grille de saisie (Remontée / Redescente) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">⬆️ Remontée</label>
                    <input
                    type="number"
                    id="remontee_${article.id}"
                    value="${article.remontee || ''}"
                    placeholder="0"
                    style="width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;">
                </div>
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">⬇️ Redescente</label>
                    <input
                    type="number"
                    id="redescente_${article.id}"
                    value="${article.redescente || ''}"
                    placeholder="0"
                    style="width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;"
                    onkeydown="
                    if(event.key==='Enter'){
                        validerQuantiteHDLP('${article.id}');
                    }
                    ">
                </div>
            </div>

            <!-- Boutons d'action (OK + Corbeille) -->
            <div style="display: flex; gap: 8px;">
                <button 
                onclick="validerQuantiteHDLP('${article.id}')"
                style="flex: 1; background: #198754; color: white; border: none; padding: 10px; font-weight: bold; font-size: 14px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    ✅ OK
                </button>
                <button
                style="background: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                onclick="supprimerArticleHDLP('${article.id}')"
                title="Supprimer">
                    🗑️
                </button>
            </div>
        </div>
        `;
    });

    document.getElementById("contenuHDLP").innerHTML = html;
}

function supprimerArticleHDLP(id){
    if(!confirm("Supprimer cet article ?")){
        return;
    }

    hdlpData[hdlpTab] = hdlpData[hdlpTab].filter(a => a.id !== id);
    localStorage.setItem("caveData", JSON.stringify(hdlpData));
    renderContenuHDLP();
}

function validerQuantiteHDLP(id){
    const article = hdlpData[hdlpTab].find(a => a.id === id);
    if(!article) return;

    const remontee = Number(document.getElementById("remontee_" + id).value || 0);
    const redescente = Number(document.getElementById("redescente_" + id).value || 0);

    article.remontee = remontee;
    article.redescente = redescente;

    localStorage.setItem("caveData", JSON.stringify(hdlpData));

    const recherche = document.getElementById("rechercheHDLP");
    if(recherche){
        recherche.focus();
        recherche.select();
    }
}

function surlignerArticleResume(id){
    const carte = document.getElementById("resume_" + id);
    if(!carte) return;
    
    // Bascule la classe de sélection pour accumuler les surbrillances
    carte.classList.toggle("article-selectionne");
}
