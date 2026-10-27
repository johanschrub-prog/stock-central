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

        </div>

    `;

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
            OK
            </button>
        </div>
        `;
    });
    document.getElementById(
        "contenuHDLP"
    ).innerHTML = html;
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
