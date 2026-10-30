let hdlpTab = "devant";
let hdlpData =
JSON.parse(
    localStorage.getItem("caveData")
) || {
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

            <button onclick="changerSite('APPLICATIONS')">
                ⬅ Retour
            </button>

            <h2>📤 Remontées HDLP</h2>
<button onclick="changerOngletHDLP('resume')">
    📋 RÉSUMÉ
</button>
            <button onclick="changerOngletHDLP('devant')">
                DEVANT BAR
            </button>

            <button onclick="changerOngletHDLP('champagne')">
                CHAMPAGNE
            </button>

            <button onclick="changerOngletHDLP('alcool')">
                ALCOOL
            </button>

<br><br>
            
<div style="margin-top:15px;margin-bottom:15px;">

    <button
    onclick="ouvrirAjoutArticleHDLP()"
    style="
    background:#198754;
    color:white;
    font-weight:bold;
    ">
    ➕ Article
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
                font-size:18px;
                margin-bottom:10px;
                box-sizing:border-box;
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
font-size:18px;
box-sizing:border-box;
">

<br><br>

<div id="listeAjoutHDLP"></div>

<br>

<button onclick="fermerAjoutArticleHDLP()">
❌ Fermer
</button>

</div>

</div>

        </div>

    `;

    renderContenuHDLP();

}
function ouvrirAjoutArticleHDLP(){

    document.getElementById(
        "popupAjoutHDLP"
    ).style.display = "block";

    afficherArticlesAjoutHDLP();

}
function fermerAjoutArticleHDLP(){

    document.getElementById(
        "popupAjoutHDLP"
    ).style.display = "none";

}
function afficherArticlesAjoutHDLP(){

    const recherche =
    document.getElementById(
        "rechercheAjoutHDLP"
    )?.value
    ?.toLowerCase() || "";

    let html = "";

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

        if(
            recherche &&
            !String(article.article || "")
            .toLowerCase()
            .includes(recherche)
            &&
            !String(article.code || "")
            .includes(recherche)
        ){
            return;
        }
const existe =
hdlpData[hdlpTab]
.some(a =>

    String(a.code) ===
    String(article.code)

);

if(existe){
    return;
}
        html += `

        <div class="card">

            <b>${article.article}</b>

            <br>

            Code : ${article.code}

            <br><br>

            <button
            onclick="ajouterArticleDepuisStockHDLP('${article.code}')">

            ✅ Ajouter

            </button>

        </div>

        `;

    });

    document.getElementById(
        "listeAjoutHDLP"
    ).innerHTML = html;

}
function ajouterArticleDepuisStockHDLP(code){

    const articleCentral =
    Object.values(stock)
    .flat()
    .find(a =>

        String(a.code) ===
        String(code)

    );

    if(!articleCentral) return;

    const existe =
    hdlpData[hdlpTab]
    .some(a =>

        String(a.code) ===
        String(code)

    );

    if(existe){

        alert(
            "Article déjà présent"
        );

        return;

    }

   hdlpData[hdlpTab].push({

    id: crypto.randomUUID(),

    code: articleCentral.code,

    article: articleCentral.article,

    remontee: 0,

    redescente: 0

});

    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
    );

    fermerAjoutArticleHDLP();

    renderContenuHDLP();

}
function getStockHDLP(code){

    let total = 0;

    [
        "HDLP SOFT",
        "HDLP BAR",
        "HDLP MINI BAR",
        "HDLP SEMINAIRE"
    ].forEach(categorie => {

        (stock[categorie] || []).forEach(article => {

            if(String(article.code) === String(code)){
                total += Number(article.stock || 0);
            }

        });

    });

    return total;

}

function getStockRCLP(code){

    let total = 0;

    [
        "RCLP SOFT",
        "RCLP VIN",
        "RCLP ALCOOL"
    ].forEach(categorie => {

        (stock[categorie] || []).forEach(article => {

            if(String(article.code) === String(code)){
                total += Number(article.stock || 0);
            }

        });

    });

    return total;

}
function changerOngletHDLP(tab){
    hdlpTab = tab;
    renderContenuHDLP();
}
function renderResumeHDLP(){

    let html =
    "<h3>📋 Résumé des remontées</h3>";

    const articles = [

        ...(hdlpData.devant || []),
        ...(hdlpData.champagne || []),
        ...(hdlpData.alcool || [])

    ];

    let totalArticles = 0;
    let totalQuantites = 0;

    articles.forEach(article => {

        const remontee =
        Number(article.remontee || 0);

        const redescente =
        Number(article.redescente || 0);

        if(
            remontee <= 0 &&
            redescente <= 0
        ){
            return;
        }

        totalArticles++;

        totalQuantites +=
        remontee + redescente;

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
            ⬆️ Remontée :
            ${remontee}

            <br>

            ⬇️ Redescente :
            ${redescente}

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
            </select>

            <br><br>

            <button
            style="
                background:#dc3545;
                color:white;
            "
            onclick="
            retirerArticleResumeHDLP(
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

        Date de remontée

        <br>

        <input
        type="date"
        id="dateRemonteeHDLP"
        value="${
            new Date()
            .toISOString()
            .split('T')[0]
        }">

        <br><br>

        <button
        onclick="
        validerRemonteeResumeHDLP()">
            ✅ Valider la remontée
        </button>

    </div>

    `;

    document.getElementById(
        "contenuHDLP"
    ).innerHTML = html;
}
function retirerArticleResumeHDLP(id){

    ["devant","champagne","alcool"]
    .forEach(onglet => {

        const article =
        hdlpData[onglet]
        .find(a => a.id === id);

        if(article){

            article.remontee = 0;

            article.redescente = 0;

        }

    });

    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
    );

    renderResumeHDLP();

}
function validerRemonteeResumeHDLP(){

    const date =
    document.getElementById(
        "dateRemonteeHDLP"
    ).value;

    const mouvements = [];

    const validationId =
    crypto.randomUUID();

    const remontees =
    getRemonteesEffectuees();

    ["devant","champagne","alcool"]
    .forEach(onglet => {

        hdlpData[onglet]
        .forEach(article => {

            const remontee =
            Number(article.remontee || 0);

            const redescente =
            Number(article.redescente || 0);

            if(
                remontee <= 0 &&
                redescente <= 0
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
                - remontee
                + redescente;

            }

            mouvements.push({

                article: article.article,
                code: article.code,
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

                    articleId: article.id,

                    code: article.code,

                    designation: article.article,

                    quantite: remontee

                });

            }

            if(redescente > 0){

                remontees.unshift({

                    id: crypto.randomUUID(),

                    validationId: validationId,

                    date: date,

                    type: "REDESCENTE HDLP",

                    cave: cave,

                    articleId: article.id,

                    code: article.code,

                    designation: article.article,

                    quantite: redescente

                });

            }

            article.remontee = 0;
            article.redescente = 0;

        });

    });

    saveRemonteesEffectuees(remontees);

    save();

    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
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
        " article(s) validé(s)"
    );

    changerOngletHDLP("devant");

}
function renderContenuHDLP(){

    if(hdlpTab === "resume"){
        renderResumeHDLP();
        return;
    }

    const recherche =
    document.getElementById(
        "rechercheHDLP"
    )?.value?.toLowerCase() || "";

    const liste =
    hdlpData[hdlpTab] || [];

    let html = "";

    liste

    .filter(article => {

        return (

            String(article.article || "")
            .toLowerCase()
            .includes(recherche)

            ||

            String(article.code || "")
            .toLowerCase()
            .includes(recherche)

        );

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
                📦 Stock HDLP : ${stockHDLP}
            </span>

            <br>

            <span style="
                color:#ff9800;
                font-weight:bold;
            ">
                📦 Stock RCLP : ${stockRCLP}
            </span>

            <br><br>

            ⬆️ Remontée

            <br>

            <input
            type="number"
            id="remontee_${article.id}"
            value="${article.remontee || ''}"
            placeholder="Remontée">

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
                validerQuantiteHDLP('${article.id}');
            }
            ">

            <br><br>

            <button
            onclick="validerQuantiteHDLP('${article.id}')">
                ✅ OK
            </button>

            <button
            style="
                background:#dc3545;
                color:white;
                margin-left:5px;
            "
            onclick="supprimerArticleHDLP('${article.id}')">
                🗑️
            </button>

        </div>

        `;

    });

    document.getElementById(
        "contenuHDLP"
    ).innerHTML = html;
}
function supprimerArticleHDLP(id){

    if(
        !confirm(
            "Supprimer cet article ?"
        )
    ){
        return;
    }

    hdlpData[hdlpTab] =
    hdlpData[hdlpTab]
    .filter(a => a.id !== id);

    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
    );

    renderContenuHDLP();

}
function validerQuantiteHDLP(id){

    const article =
    hdlpData[hdlpTab]
    .find(a => a.id === id);

    if(!article) return;

    const remontee = Number(
        document.getElementById(
            "remontee_" + id
        ).value || 0
    );

    const redescente = Number(
        document.getElementById(
            "redescente_" + id
        ).value || 0
    );

    article.remontee = remontee;
    article.redescente = redescente;

    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
    );

    const recherche =
    document.getElementById(
        "rechercheHDLP"
    );

    if(recherche){

        recherche.focus();

        recherche.select();

    }

}
function surlignerArticleResume(id){

    const carte =
    document.getElementById(
        "resume_" + id
    );

    if(!carte) return;

    carte.classList.toggle(
        "article-selectionne"
    );

}
