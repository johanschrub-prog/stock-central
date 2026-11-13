let rclpTab = "rclp";
let rclpData = JSON.parse(localStorage.getItem("rclpData")) || [];
let caveDefautRCLP = localStorage.getItem("caveDefautRCLP") || "RCLP VIN";

function ouvrirRemonteeRCLP(){
    renderRemonteeRCLP();
}

function renderRemonteeRCLP(){
    document.getElementById("cards").innerHTML = `
    <div class="card">
        <div style="margin-bottom: 15px;">
            <button onclick="changerSite('APPLICATIONS')" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                ⬅ Retour
            </button>
        </div>

        <h2>📤 Remontées RCLP</h2>
        <br>

        <!-- Barre d'onglets dynamique -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
            <button onclick="changerOngletRCLP('resume')" style="flex: 1; min-width: 120px; height: 45px; font-size: 14px; font-weight: bold; background: ${rclpTab === 'resume' ? '#1976d2' : '#f8f9fa'}; color: ${rclpTab === 'resume' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                📋 RÉSUMÉ
            </button>
            <button onclick="changerOngletRCLP('rclp')" style="flex: 1; min-width: 120px; height: 45px; font-size: 14px; font-weight: bold; background: ${rclpTab === 'rclp' ? '#1976d2' : '#f8f9fa'}; color: ${rclpTab === 'rclp' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                RCLP
            </button>
        </div>

        <hr>

        <!-- Champs de recherche modernes -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
            <input
            id="rechercheRCLP"
            placeholder="🔍 Recherche article"
            oninput="renderContenuRCLP()"
            style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box;">

            <input
            id="rechercheCodeRCLP"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="📦 Code article"
            oninput="renderContenuRCLP()"
            style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box;">
        </div>

        <div id="contenuRCLP"></div>
    </div>
    `;

    renderContenuRCLP();
}

function changerOngletRCLP(tab){
    rclpTab = tab;
    renderRemonteeRCLP();
}

function chargerArticlesRCLP(){
    if(rclpData.length > 0){
        return;
    }

    const dejaVus = new Set();

    Object.values(catalogueArticles).forEach(article => {
        const code = String(article.code);
        if(dejaVus.has(code)){
            return;
        }

        dejaVus.add(code);

        rclpData.push({
            id: crypto.randomUUID(),
            code: code,
            article: article.article,
            remontee: 0,
            redescente: 0
        });
    });

    localStorage.setItem("rclpData", JSON.stringify(rclpData));
}

function renderContenuRCLP(){
    if(rclpTab === "resume"){
        renderResumeRCLP();
        return;
    }

    chargerArticlesRCLP();

    const recherche = document.getElementById("rechercheRCLP")?.value?.toLowerCase() || "";
    const rechercheCode = document.getElementById("rechercheCodeRCLP")?.value || "";

    let html = "";

    rclpData
    .sort((a, b) => Number(a.code) - Number(b.code))
    .filter(article => {
        const okTexte = recherche === "" || String(article.article).toLowerCase().includes(recherche);
        const okCode = rechercheCode === "" || String(article.code).startsWith(rechercheCode);
        return okTexte && okCode;
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
                        validerQuantiteRCLP('${article.id}');
                    }
                    ">
                </div>
            </div>

            <!-- Bouton d'action OK -->
            <button 
            onclick="validerQuantiteRCLP('${article.id}')"
            style="width: 100%; background: #198754; color: white; border: none; padding: 10px; font-weight: bold; font-size: 14px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                ✅ OK
            </button>
        </div>
        `;
    });

    document.getElementById("contenuRCLP").innerHTML = html;
}

function validerQuantiteRCLP(id){
    const article = rclpData.find(a => a.id === id);
    if(!article) return;

    const remontee = Number(document.getElementById("remontee_" + id).value || 0);
    const redescente = Number(document.getElementById("redescente_" + id).value || 0);

    article.remontee = remontee;
    article.redescente = redescente;

    localStorage.setItem("rclpData", JSON.stringify(rclpData));

    const rechercheCode = document.getElementById("rechercheCodeRCLP");
    if(rechercheCode){
        rechercheCode.value = "";
        const rechercheArticle = document.getElementById("rechercheRCLP");
        if(rechercheArticle){
            rechercheArticle.value = "";
        }
        rechercheCode.focus();
        renderContenuRCLP();
    }
}

function renderResumeRCLP(){
    let html = `
    <div style="margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 18px; color: #333;">📋 Résumé des remontées RCLP</h3>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Vérifiez et validez les mouvements avant l'enregistrement final.</p>
    </div>
    `;

    let totalArticles = 0;
    let totalQuantites = 0;

    rclpData.forEach(article => {
        const remontee = Number(article.remontee || 0);
        const redescente = Number(article.redescente || 0);

        if(remontee <= 0 && redescente <= 0){
            return;
        }

        totalArticles++;
        totalQuantites += remontee + redescente;

        html += `
        <div class="card card-resume" id="resume_${article.id}" onclick="surlignerArticleResume('${article.id}')" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 15px; margin-bottom: 15px; background: #fff; transition: background 0.2s; cursor: pointer;">
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
                onclick="retirerArticleResumeRCLP('${article.id}')"
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
                    <select 
                        id="cave_${article.id}" 
                        style="width: 100%; padding: 6px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px; background: white;"
                        onchange="
                            caveDefautRCLP = this.value;
                            localStorage.setItem('caveDefautRCLP', this.value);
                        "
                    >
                        <option ${caveDefautRCLP === 'RCLP SOFT' ? 'selected' : ''}>RCLP SOFT</option>
                        <option ${caveDefautRCLP === 'RCLP VIN' ? 'selected' : ''}>RCLP VIN</option>
                        <option ${caveDefautRCLP === 'RCLP ALCOOL' ? 'selected' : ''}>RCLP ALCOOL</option>
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
                <input type="date" id="dateRemonteeRCLP" value="${new Date().toISOString().split("T")[0]}" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 6px; font-size: 16px; box-sizing: border-box; background: white;">
            </div>

            <button onclick="validerRemonteeResumeRCLP()" style="width: 100%; background: #198754; color: white; border: none; padding: 12px; font-weight: bold; font-size: 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                ✅ Valider la remontée
            </button>
        </div>
        `;
    }

    document.getElementById("contenuRCLP").innerHTML = html;
}

function retirerArticleResumeRCLP(id){
    const article = rclpData.find(a => a.id === id);
    if(article){
        article.remontee = 0;
        article.redescente = 0;
    }

    save();
    localStorage.setItem("rclpData", JSON.stringify(rclpData));
    renderResumeRCLP();
}

function validerRemonteeResumeRCLP(){
    const date = document.getElementById("dateRemonteeRCLP").value;
    const mouvements = [];
    const validationId = crypto.randomUUID();
    const remontees = getRemonteesEffectuees();
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    rclpData.forEach(article => {
        const remontee = Number(article.remontee || 0);
        const redescente = Number(article.redescente || 0);

        if(remontee <= 0 && redescente <= 0){
            return;
        }

        const coche = document.getElementById("check_" + article.id);
        if(!coche || !coche.checked){
            return;
        }

        const selectCave = document.getElementById("cave_" + article.id);
        const cave = selectCave ? selectCave.value : caveDefautRCLP;
        const code = String(article.code);

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
            type: "Mouvement RCLP"
        });

        if(remontee > 0){
            remontees.unshift({
                id: crypto.randomUUID(),
                validationId: validationId,
                date: date,
                dateHeure: new Date().toISOString(),
                type: "RCLP",
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
                origine: "REMONTEE RCLP"
            });
        }

        if(redescente > 0){
            remontees.unshift({
                id: crypto.randomUUID(),
                validationId: validationId,
                date: date,
                dateHeure: new Date().toISOString(),
                type: "REDESCENTE RCLP",
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
                origine: "REDESCENTE RCLP"
            });
        }

        article.remontee = 0;
        article.redescente = 0;
    });

    saveRemonteesEffectuees(remontees);
    save(); 
    localStorage.setItem("rclpData", JSON.stringify(rclpData));
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));

    alert(mouvements.length + " article(s) validé(s)");
    changerOngletRCLP("rclp");
}

function surlignerArticleResume(id){
    const carte = document.getElementById("resume_" + id);
    if(!carte) return;
    carte.classList.toggle("article-selectionne");
}
