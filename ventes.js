let boutiqueTab = "vente";
let boutiqueData = JSON.parse(localStorage.getItem("boutiqueData")) || [];

function ouvrirSaisieVentesBoutique(){
    renderSaisieVentesBoutique();
}

function renderSaisieVentesBoutique(){
    document.getElementById("cards").innerHTML = `
    <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff; box-sizing: border-box;">
        <div style="margin-bottom: 15px;">
            <button onclick="changerSite('APPLICATIONS')" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                ⬅ Retour
            </button>
        </div>

        <h2 style="margin-top: 0; color: #333; font-size: 20px;">🛍️ Ventes Boutique</h2>
        <br>

        <!-- Barre d'onglets dynamique -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
            <button onclick="changerOngletBoutique('resume')" style="flex: 1; min-width: 120px; height: 45px; font-size: 14px; font-weight: bold; background: ${boutiqueTab === 'resume' ? '#1976d2' : '#f8f9fa'}; color: ${boutiqueTab === 'resume' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                📋 RÉSUMÉ
            </button>
            <button onclick="changerOngletBoutique('vente')" style="flex: 1; min-width: 120px; height: 45px; font-size: 14px; font-weight: bold; background: ${boutiqueTab === 'vente' ? '#1976d2' : '#f8f9fa'}; color: ${boutiqueTab === 'vente' ? 'white' : '#333'}; border: 1px solid #ced4da; border-radius: 6px; cursor: pointer;">
                VENTES
            </button>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">

        <!-- Champs de recherche modernes -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; box-sizing: border-box;">
            <input
            id="rechercheBoutique"
            placeholder="🔍 Recherche article"
            oninput="renderContenuBoutique()"
            style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">

            <input
            id="rechercheCodeBoutique"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="📦 Code article"
            oninput="renderContenuBoutique()"
            style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
        </div>

        <div id="contenuBoutique" style="width: 100%; box-sizing: border-box;"></div>
    </div>
    `;

    renderContenuBoutique();
}

function changerOngletBoutique(tab){
    boutiqueTab = tab;
    renderSaisieVentesBoutique();
}

function chargerArticlesBoutique(){
    let modifie = false;

    boutiqueData.forEach(articleBoutique => {
        if(!articleBoutique.cave){
            articleBoutique.cave = "HDLP MINI BAR";
            modifie = true;
        }
        if(!articleBoutique.id){
            articleBoutique.id = crypto.randomUUID();
            modifie = true;
        }

        const articleStock = catalogueArticles[String(articleBoutique.code)];
        if(
            articleStock &&
            articleBoutique.article !== articleStock.article
        ){
            articleBoutique.article = articleStock.article;
            modifie = true;
        }
    });

    if(modifie){
        localStorage.setItem("boutiqueData", JSON.stringify(boutiqueData));
    }

    if(boutiqueData.length > 0){
        return;
    }

    const dejaVus = new Set();

    Object.values(catalogueArticles).forEach(article => {
        const code = String(article.code);
        if(dejaVus.has(code)){
            return;
        }
        dejaVus.add(code);

        boutiqueData.push({
            id: crypto.randomUUID(),
            code: code,
            article: article.article,
            vente: 0,
            redescente: 0,
            cave: "HDLP MINI BAR"
        });
    });

    localStorage.setItem("boutiqueData", JSON.stringify(boutiqueData));
}

function renderContenuBoutique(){
    if(boutiqueTab === "resume"){
        renderResumeBoutique();
        return;
    }

    chargerArticlesBoutique();

    const recherche = document.getElementById("rechercheBoutique")?.value?.toLowerCase() || "";
    const rechercheCode = document.getElementById("rechercheCodeBoutique")?.value || "";

    let html = "";

    boutiqueData
    .sort((a,b) => Number(a.code) - Number(b.code))
    .filter(article => {
        const okTexte = recherche === "" || String(article.article).toLowerCase().includes(recherche);
        const okCode = rechercheCode === "" || String(article.code).startsWith(rechercheCode);
        return okTexte && okCode;
    })
    .forEach(article => {
        const stockHDLP = getStockHDLP(article.code);
        const stockRCLP = getStockRCLP(article.code);

        html += `
        <div class="card" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 15px; margin-bottom: 15px; background: #fff; box-sizing: border-box;">
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

            <!-- Grille de saisie (Vente / Redescente) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">🛍️ Vente</label>
                    <input
                    type="number"
                    id="vente_${article.id}"
                    value="${article.vente || ''}"
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
                        validerQuantiteBoutique('${article.id}');
                    }
                    ">
                </div>
            </div>

            <!-- Bouton d'action OK -->
            <button 
            onclick="validerQuantiteBoutique('${article.id}')"
            style="width: 100%; background: #198754; color: white; border: none; padding: 10px; font-weight: bold; font-size: 14px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                ✅ OK
            </button>
        </div>
        `;
    });

    document.getElementById("contenuBoutique").innerHTML = html;
}

function validerQuantiteBoutique(id){
    const article = boutiqueData.find(a => a.id === id);
    if(!article) return;

    article.vente = Number(document.getElementById("vente_" + id).value || 0);
    article.redescente = Number(document.getElementById("redescente_" + id).value || 0);

    if(article.vente <= 0 && article.redescente <= 0){
        return;
    }

    localStorage.setItem("boutiqueData", JSON.stringify(boutiqueData));

    const rechercheCode = document.getElementById("rechercheCodeBoutique");
    if(rechercheCode){
        rechercheCode.value = "";
        const rechercheArticle = document.getElementById("rechercheBoutique");
        if(rechercheArticle){
            rechercheArticle.value = "";
        }
        renderContenuBoutique();

        setTimeout(() => {
            const recherche = document.getElementById("rechercheBoutique");
            if(recherche){
                recherche.focus();
                recherche.select();
            }
        }, 100);
    }
}

function renderResumeBoutique(){
    let html = `
    <div style="margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 18px; color: #333;">📋 Résumé des ventes boutique</h3>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Vérifiez et validez les mouvements avant l'enregistrement final.</p>
    </div>
    `;

    let totalArticles = 0;
    let totalQuantites = 0;

    boutiqueData.forEach(article => {
        const vente = Number(article.vente || 0);
        const redescente = Number(article.redescente || 0);

        if(vente <= 0 && redescente <= 0){
            return;
        }

        totalArticles++;
        totalQuantites += vente + redescente;

        html += `
        <div class="card card-resume" id="resume_${article.id}" onclick="surlignerArticleResume('${article.id}')" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 15px; margin-bottom: 15px; background: #fff; transition: background 0.2s; cursor: pointer; box-sizing: border-box;">
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
                onclick="retirerArticleResumeBoutique('${article.id}')"
                title="Retirer">
                    🗑️ Retirer
                </button>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">

            <!-- Détails des quantités -->
            <div style="display: flex; gap: 15px; margin-bottom: 12px; font-size: 14px;">
                <span style="background: #e7f1ff; color: #0d6efd; padding: 6px 10px; border-radius: 6px; font-weight: bold;">
                    🛍️ Vente : ${vente}
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
                    <select id="cave_${article.id}" onchange="changerCaveBoutique('${article.id}', this.value)" style="width: 100%; padding: 6px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px; background: white;">
                        <option ${article.cave === "HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                        <option ${article.cave === "HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                        <option ${article.cave === "HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                        <option ${article.cave === "HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
                        <option ${article.cave === "RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                        <option ${article.cave === "RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
                        <option ${article.cave === "RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
                    </select>
                </div>
            </div>
        </div>
        `;
    });

    if(totalArticles === 0){
        html += `
        <div class="card" style="text-align: center; padding: 30px; color: #666;">
            <p style="margin: 0;">Aucune quantité saisie pour le moment.</p>
        </div>
        `;
    } else {
        html += `
        <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #f8f9fa; margin-top: 20px; box-sizing: border-box;">
            <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Récapitulatif global</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
                <span>Total articles : <b>${totalArticles}</b></span>
                <span>Total quantités : <b>${totalQuantites}</b></span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="font-size: 13px; font-weight: bold; color: #495057; display: block; margin-bottom: 5px;">📅 Date de vente</label>
                <input type="date" id="dateVenteBoutique" value="${new Date().toISOString().split("T")[0]}" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 6px; font-size: 16px; box-sizing: border-box; background: white;">
            </div>

            <button onclick="validerVentesBoutique()" style="width: 100%; background: #198754; color: white; border: none; padding: 12px; font-weight: bold; font-size: 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                ✅ Valider les ventes
            </button>
        </div>
        `;
    }

    document.getElementById("contenuBoutique").innerHTML = html;
}

function changerCaveBoutique(id, cave){
    const article = boutiqueData.find(a => a.id === id);
    if(!article){
        return;
    }
    article.cave = cave;
    localStorage.setItem("boutiqueData", JSON.stringify(boutiqueData));
}

function retirerArticleResumeBoutique(id){
    const article = boutiqueData.find(a => a.id === id);
    if(article){
        article.vente = 0;
        article.redescente = 0;
    }

    save();
    localStorage.setItem("boutiqueData", JSON.stringify(boutiqueData));
    renderResumeBoutique();
}

function validerVentesBoutique(){
    const date = document.getElementById("dateVenteBoutique").value;
    const mouvements = [];
    const validationId = crypto.randomUUID();
    const remontees = getRemonteesEffectuees();
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];

    boutiqueData.forEach(article => {
        const vente = Number(article.vente || 0);
        const redescente = Number(article.redescente || 0);

        if(vente <= 0 && redescente <= 0){
            return;
        }

        const coche = document.getElementById("check_" + article.id);
        if(!coche || !coche.checked){
            return;
        }

        const selectCave = document.getElementById("cave_" + article.id);
        const cave = article.cave || (selectCave ? selectCave.value : "HDLP MINI BAR");
        const code = String(article.code);

        if(!stockParCave[cave]) stockParCave[cave] = {};
        const stockActuel = Number(stockParCave[cave][code] || 0);
        const nouveauStock = stockActuel - vente + redescente;

        if(nouveauStock === 0){
            delete stockParCave[cave][code];
        } else {
            stockParCave[cave][code] = nouveauStock;
        }

        mouvements.push({
            article: article.article,
            code: code,
            vente: vente,
            redescente: redescente,
            cave: cave,
            date: date,
            type: "Vente Boutique"
        });

        if(vente > 0){
            remontees.unshift({
                id: crypto.randomUUID(),
                validationId: validationId,
                date: date,
                dateHeure: new Date().toISOString(),
                type: "BOUTIQUE",
                cave: cave,
                caveOrigine: cave,
                articleId: article.id,
                code: code,
                designation: article.article,
                quantite: vente,
                quantiteOrigine: vente
            });

            historiqueGlobal.push({
                date: new Date().toISOString(),
                code: code,
                article: article.article,
                cave: cave,
                type: "SORTIE",
                quantite: vente,
                origine: "VENTE BOUTIQUE"
            });
        }

        if(redescente > 0){
            remontees.unshift({
                id: crypto.randomUUID(),
                validationId: validationId,
                date: date,
                dateHeure: new Date().toISOString(),
                type: "REDESCENTE BOUTIQUE",
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
                origine: "REDESCENTE BOUTIQUE"
            });
        }

        article.vente = 0;
        article.redescente = 0;
    });

    saveRemonteesEffectuees(remontees);
    save(); 
    localStorage.setItem("boutiqueData", JSON.stringify(boutiqueData));
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));

    alert(mouvements.length + " article(s) validé(s)");
    changerOngletBoutique("vente");
}

function surlignerArticleResume(id){
    const carte = document.getElementById("resume_" + id);
    if(!carte) return;
    carte.classList.toggle("article-selectionne");
}
