let boutiqueTab = "vente";

let boutiqueData = JSON.parse(localStorage.getItem("boutiqueData")) || [];

function ouvrirSaisieVentesBoutique(){
    renderSaisieVentesBoutique();
}

function renderSaisieVentesBoutique(){
    document.getElementById("cards").innerHTML = `
    <div class="card">
        <button onclick="changerSite('APPLICATIONS')">
            ⬅ Retour
        </button>

        <h2>🛍️ Ventes Boutique</h2>

        <button onclick="changerOngletBoutique('resume')">
            📋 RÉSUMÉ
        </button>

        <button onclick="changerOngletBoutique('vente')">
            VENTES
        </button>

        <hr>

        <input
        id="rechercheBoutique"
        placeholder="🔍 Recherche article"
        oninput="renderContenuBoutique()"
        style="
        width:100%;
        padding:10px;
        margin-bottom:10px;
        ">

        <input
        id="rechercheCodeBoutique"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        placeholder="📦 Code article"
        oninput="renderContenuBoutique()"
        style="
        width:100%;
        padding:10px;
        margin-bottom:10px;
        ">

        <div id="contenuBoutique"></div>
    </div>
    `;

    renderContenuBoutique();
}

function changerOngletBoutique(tab){
    boutiqueTab = tab;
    renderContenuBoutique();
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

        // Synchronisation des libellés avec le Catalogue Unique
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

    // Remplissage initial depuis le Catalogue Unique
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
        <div class="card">
            <b>${article.article}</b>
            <br>
            Code : ${article.code}
            <br><br>
            <span style="color:#1976d2; font-weight:bold;">
                📦 HDLP : ${stockHDLP}
            </span>
            <br>
            <span style="color:#ff9800; font-weight:bold;">
                📦 RCLP : ${stockRCLP}
            </span>
            <br><br>
            🛍️ Vente
            <br>
            <input
            type="number"
            id="vente_${article.id}"
            value="${article.vente || ''}"
            placeholder="Vente">
            <br><br>
            ⬇️ Redescente
            <br>
            <input
            type="number"
            id="redescente_${article.id}"
            value="${article.redescente || ''}"
            placeholder="Redescente"
            onkeydown="
            if(event.key==='Enter'){
                validerQuantiteBoutique('${article.id}');
            }
            ">
            <br><br>
            <button onclick="validerQuantiteBoutique('${article.id}')">
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
    let html = "<h3>📋 Résumé des ventes boutique</h3>";

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
        <div class="card card-resume" id="resume_${article.id}" onclick="surlignerArticleResume('${article.id}')">
            <b>${article.article}</b>
            <br>
            Code : ${article.code}
            <br><br>
            🛍️ Vente : ${vente}
            <br>
            ⬇️ Redescente : ${redescente}
            <br><br>
            <input type="checkbox" id="check_${article.id}" checked>
            À traiter
            <br><br>
            Cave d'origine :
            <select id="cave_${article.id}" onchange="changerCaveBoutique('${article.id}', this.value)">
                <option ${article.cave === "HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                <option ${article.cave === "HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                <option ${article.cave === "HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                <option ${article.cave === "HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
                <option ${article.cave === "RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                <option ${article.cave === "RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
                <option ${article.cave === "RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
            </select>
            <br><br>
            <button style="background:#dc3545; color:white;" onclick="retirerArticleResumeBoutique('${article.id}')">
                🗑️ Retirer
            </button>
        </div>
        `;
    });

    html += `
    <div class="card">
        <b>Total articles :</b> ${totalArticles}
        <br>
        <b>Total quantités :</b> ${totalQuantites}
        <br><br>
        Date de vente
        <br>
        <input type="date" id="dateVenteBoutique" value="${new Date().toISOString().split("T")[0]}">
        <br><br>
        <button onclick="validerVentesBoutique()">
            ✅ Valider les ventes
        </button>
    </div>
    `;

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

        // Mise à jour du stock dans stockParCave
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
    save(); // Sauvegarde stockParCave et catalogueArticles
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
