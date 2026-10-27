let hdlpTab = "devant";
let hdlpData =
JSON.parse(
    localStorage.getItem("caveData")
) || {
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

            <button onclick="changerOngletHDLP('devant')">
                DEVANT BAR
            </button>

            <button onclick="changerOngletHDLP('champagne')">
                CHAMPAGNE
            </button>

            <button onclick="changerOngletHDLP('alcool')">
                ALCOOL
            </button>
<button onclick="ouvrirAjoutArticleHDLP()">
➕ Article
</button>

<button
style="background:#dc3545;color:white;"
onclick="retirerArticleHDLP()">
➖ Retirer Article
</button>

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

        quantite: 0,

        coche: false,

        redescente: false

    });

    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
    );

    fermerAjoutArticleHDLP();

    renderContenuHDLP();

}
function retirerArticleHDLP(){

    const code =
    prompt(
        "Code article à supprimer"
    );

    if(!code) return;

    const avant =
    hdlpData[hdlpTab].length;

    hdlpData[hdlpTab] =
    hdlpData[hdlpTab]
    .filter(a =>

        String(a.code) !==
        String(code)

    );

    if(
        avant ===
        hdlpData[hdlpTab].length
    ){

        alert(
            "Article introuvable"
        );

        return;
    }

    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
    );

    renderContenuHDLP();

}
function changerOngletHDLP(tab){
    hdlpTab = tab;
    renderContenuHDLP();
}
function renderContenuHDLP(){
   const recherche =
document.getElementById(
    "rechercheHDLP"
)?.value
?.toLowerCase() || "";
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
        html += `
        <div class="card">
            <b>${article.article}</b>
            <br>
            Code : ${article.code}
            <br><br>
            <input
            type="number"
            id="qty_${article.id}"
            value="${article.quantite || ''}"
            placeholder="Quantité">
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
onclick="
supprimerArticleHDLP(
'${article.id}'
)">
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
    const valeur =
    document.getElementById(
        "qty_" + id
    ).value;
    article.quantite =
    valeur === ""
    ? 0
    : Number(valeur);
    localStorage.setItem(
        "caveData",
        JSON.stringify(hdlpData)
    );
}
