let boutiqueTab = "vente";

let boutiqueData =
JSON.parse(
    localStorage.getItem("boutiqueData")
) || [];

function ouvrirSaisieVentesBoutique(){

    renderSaisieBoutique();

}

function renderSaisieBoutique(){

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

    if(boutiqueData.length > 0){
        return;
    }

    const dejaVus = new Set();

    Object.values(stock)
    .flat()
    .forEach(article => {

        if(
            dejaVus.has(
                String(article.code)
            )
        ){
            return;
        }

        dejaVus.add(
            String(article.code)
        );

        boutiqueData.push({

            id: crypto.randomUUID(),

            code: article.code,

            article: article.article,

            vente: 0

        });

    });

    localStorage.setItem(
        "boutiqueData",
        JSON.stringify(boutiqueData)
    );

}
function renderContenuBoutique(){

    if(boutiqueTab === "resume"){

        renderResumeBoutique();

        return;

    }

    chargerArticlesBoutique();

    const recherche =
    document.getElementById(
        "rechercheBoutique"
    )?.value?.toLowerCase() || "";

    const rechercheCode =
    document.getElementById(
        "rechercheCodeBoutique"
    )?.value || "";

    let html = "";

    boutiqueData

    .sort((a,b)=>
        Number(a.code)-Number(b.code)
    )

    .filter(article => {

        const okTexte =

            recherche === ""

            ||

            String(article.article)
            .toLowerCase()
            .includes(recherche);

        const okCode =

            rechercheCode === ""

            ||

            String(article.code)
            .startsWith(rechercheCode);

        return okTexte && okCode;

    })

    .forEach(article => {

        const stockHDLP =
        getStockHDLP(article.code);

        const stockRCLP =
        getStockRCLP(article.code);

        html += `

        <div class="card">

            <b>${article.article}</b>

            <br>

            Code : ${article.code}

            <br><br>

            <span style="
            color:#1976d2;
            font-weight:bold;
            ">
            📦 HDLP : ${stockHDLP}
            </span>

            <br>

            <span style="
            color:#ff9800;
            font-weight:bold;
            ">
            📦 RCLP : ${stockRCLP}
            </span>

            <br><br>

            Vente

            <br>

            <input
            type="number"
            id="vente_${article.id}"
            value="${article.vente || ''}"
            placeholder="Quantité"

            onkeydown="
            if(event.key==='Enter'){
                validerVenteBoutique('${article.id}');
            }
            ">

            <br><br>

            <button
            onclick="
            validerVenteBoutique(
            '${article.id}'
            )">
            ✅ OK
            </button>

        </div>

        `;

    });

    document.getElementById(
        "contenuBoutique"
    ).innerHTML = html;

}
function validerVenteBoutique(id){

    const article =
    boutiqueData.find(
        a => a.id === id
    );

    if(!article) return;

    article.vente = Number(
        document.getElementById(
            "vente_" + id
        ).value || 0
    );

    localStorage.setItem(
        "boutiqueData",
        JSON.stringify(boutiqueData)
    );

    const rechercheCode =
    document.getElementById(
        "rechercheCodeBoutique"
    );

    if(rechercheCode){

        rechercheCode.value = "";

        rechercheCode.focus();

        renderContenuBoutique();

    }

}
function renderResumeBoutique(){

    let html =
    "<h3>📋 Résumé des ventes</h3>";

    let totalArticles = 0;

    let totalQuantites = 0;

    boutiqueData.forEach(article => {

        const vente =
        Number(article.vente || 0);

        if(vente <= 0){
            return;
        }

        totalArticles++;

        totalQuantites += vente;

        html += `

        <div class="card">

            <b>${article.article}</b>

            <br>

            Vente :
            ${vente}

            <br><br>

            <input
            type="checkbox"
            id="check_${article.id}"
            checked>

            À traiter

            <br><br>

            Cave d'origine :

            <select id="cave_${article.id}">
                <option>HDLP SOFT</option>
                <option>HDLP BAR</option>
                <option>HDLP MINI BAR</option>
                <option>HDLP SEMINAIRE</option>
                <option>RCLP SOFT</option>
                <option>RCLP VIN</option>
                <option>RCLP ALCOOL</option>
            </select>

            <br><br>

            <button
            style="
                background:#dc3545;
                color:white;
            "
            onclick="
            retirerArticleResumeBoutique(
            '${article.id}'
            )">
                🗑️ Retirer
            </button>

        </div>

        `;

    });

    html += `

    <div class="card">

        <b>Total articles :</b>
        ${totalArticles}

        <br>

        <b>Total quantités :</b>
        ${totalQuantites}

        <br><br>

        <input
        type="date"
        id="dateVenteBoutique"
        value="${
            new Date()
            .toISOString()
            .split("T")[0]
        }">

        <br><br>

        <button
        onclick="validerVentesBoutique()">
            ✅ Valider les ventes
        </button>

    </div>

    `;

    document.getElementById(
        "contenuBoutique"
    ).innerHTML = html;

}
function retirerArticleResumeBoutique(id){

    const article =
    boutiqueData.find(
        a => a.id === id
    );

    if(article){

        article.vente = 0;

    }

    localStorage.setItem(
        "boutiqueData",
        JSON.stringify(boutiqueData)
    );

    renderResumeBoutique();

}
function validerVentesBoutique(){

    const date =
    document.getElementById(
        "dateVenteBoutique"
    ).value;

    const mouvements = [];

    boutiqueData.forEach(article => {

        const vente =
        Number(article.vente || 0);

        if(vente <= 0){
            return;
        }

        const coche =
        document.getElementById(
            "check_" + article.id
        );

        if(!coche.checked){
            return;
        }

        const cave =
        document.getElementById(
            "cave_" + article.id
        ).value;

        const articleStock =
        (stock[cave] || [])
        .find(a =>
            String(a.code) ===
            String(article.code)
        );

        if(articleStock){

            articleStock.stock =
            Number(articleStock.stock || 0)
            - vente;

        }

        mouvements.push({

            article:
            article.article,

            code:
            article.code,

            quantite:
            vente,

            cave:
            cave,

            date:
            date,

            type:
            "Vente Boutique"

        });

        article.vente = 0;

    });

    save();

    localStorage.setItem(
        "boutiqueData",
        JSON.stringify(boutiqueData)
    );

    let historique =
    JSON.parse(
        localStorage.getItem(
            "mouvements"
        )
    ) || [];

    historique.push(...mouvements);

    localStorage.setItem(
        "mouvements",
        JSON.stringify(historique)
    );

    alert(
        mouvements.length +
        " vente(s) validée(s)"
    );

    changerOngletBoutique("vente");

}




