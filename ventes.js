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

        boutiqueData.forEach(article => {

            if(article.cave === undefined){

                article.cave = "";

            }

        });

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

            quantite: 0,

            valide: false,

            cave: ""

        });

    });

    localStorage.setItem(
        "boutiqueData",
        JSON.stringify(
            boutiqueData
        )
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
Cave d'origine

<br>

<select
id="cave_${article.id}">

<option ${
article.cave==="HDLP SOFT"
? "selected"
: ""
}>HDLP SOFT</option>

<option ${
article.cave==="HDLP BAR"
? "selected"
: ""
}>HDLP BAR</option>

<option ${
article.cave==="HDLP MINI BAR"
? "selected"
: ""
}>HDLP MINI BAR</option>

<option ${
article.cave==="HDLP SEMINAIRE"
? "selected"
: ""
}>HDLP SEMINAIRE</option>

<option ${
article.cave==="RCLP SOFT"
? "selected"
: ""
}>RCLP SOFT</option>

<option ${
article.cave==="RCLP VIN"
? "selected"
: ""
}>RCLP VIN</option>

<option ${
article.cave==="RCLP ALCOOL"
? "selected"
: ""
}>RCLP ALCOOL</option>

</select>

<br><br>
        Quantité vendue

<input
type="number"
id="vente_${article.id}"
value="${article.quantite || ''}">


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

    article.cave =
    document.getElementById(
        "cave_" + id
    )?.value || "";

    if(article.cave === ""){

        alert(
            "Choisissez une cave"
        );

        return;

    }

    article.quantite =
    Number(
        document.getElementById(
            "vente_" + id
        )?.value || 0
    );

    if(article.quantite <= 0){

        alert(
            "Saisissez une quantité"
        );

        return;

    }

    article.valide = true;

    localStorage.setItem(
        "boutiqueData",
        JSON.stringify(
            boutiqueData
        )
    );

    alert(
        article.article +
        " ajouté au résumé ✅"
    );

    renderContenuBoutique();

    setTimeout(() => {

        const champCode =
        document.getElementById(
            "rechercheCodeBoutique"
        );

        if(champCode){

            champCode.value = "";

            champCode.focus();

        }

    }, 200);

}
function renderResumeBoutique(){

    let html =
    "<h3>📋 Résumé des ventes</h3>";

    let totalArticles = 0;

    let totalQuantites = 0;

    boutiqueData.forEach(article => {

      const quantite =
Number(article.quantite || 0);

if(
    quantite <= 0
){
    return;
}

totalArticles++;

totalQuantites += quantite;

        html += `

        <div
class="card card-resume"

id="resume_${article.id}"

onclick="
surlignerArticleResume(
'${article.id}'
)
">

            <b>${article.article}</b>

            <br>

          Code :
${article.code}

<br><br>

🛍️ Quantité vendue :
${quantite}

            <br><br>

            <input
            type="checkbox"
            id="check_${article.id}"
            checked>

            À traiter

            <br><br>

      📦 Cave : ${article.cave || "-"}

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

       article.quantite = 0;

article.valide = false;
article.cave = "";

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

       const quantite =
Number(article.quantite || 0);

if(
    quantite <= 0
){
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
article.cave;


        const articleStock =
        (stock[cave] || [])
        .find(a =>
            String(a.code) ===
            String(article.code)
        );

        if(articleStock){

      articleStock.stock =

Number(articleStock.stock || 0)

- quantite;

        }

      mouvements.push({

    article:
    article.article,

    code:
    article.code,

    quantite:
    quantite,

            cave:
            cave,

            date:
            date,

            type:
            "Vente Boutique"

        });

      article.quantite = 0;
article.valide = false;
article.cave = "";
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
        " mouvement(s) validé(s)"
    );

    changerOngletBoutique("vente");

}

