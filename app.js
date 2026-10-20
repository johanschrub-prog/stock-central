const STORAGE_KEY = "StockCentral";
let siteActif = "DASHBOARD";
let stock =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || {};
let articleTransfertActif = null;

let analyseOuverte =
localStorage.getItem(
    "analyseOuverte"
) === "1";


let categorieActive = "";

const categories = {

HDLP:[
"HDLP MINI BAR",
"HDLP SOFT",
"HDLP BAR",
"HDLP SEMINAIRE"
],

RCLP:[
"RCLP ALCOOL",
"RCLP SOFT",
"RCLP VIN"
]

};

function save(){

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(stock)
);

}
function toggleAnalyse(){

    analyseOuverte = !analyseOuverte;

    localStorage.setItem(
        "analyseOuverte",
        analyseOuverte ? "1" : "0"
    );

    render();

}
function mettreAJourSuggestions(){

    const suggestions =
    document.getElementById(
        "listeProduits"
    );

    if(!suggestions) return;

    let propositions = [];

    Object.keys(stock).forEach(categorie => {

        stock[categorie].forEach(article => {

            propositions.push(
                `${article.code} - ${article.article}`
            );

        });

    });

  const uniques =
[...new Set(propositions)]
.sort((a, b) => {

    const codeA = parseInt(a.split(" - ")[0]) || 0;
    const codeB = parseInt(b.split(" - ")[0]) || 0;

    return codeA - codeB;

});

    suggestions.innerHTML =
    uniques.map(p =>

        `<option value="${p}"></option>`

    ).join("");

}
function importerFournisseurs(event){

    const fichier = event.target.files[0];

    if(!fichier) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const workbook = XLSX.read(
            e.target.result,
            {type:"array"}
        );

        const sheet =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

        const lignes =
        XLSX.utils.sheet_to_json(sheet);

        let maj = 0;
        let nouveaux = 0;

        lignes.forEach(ligne => {

            const code =
            String(ligne.CODE || "").trim();

            if(!code) return;

            let trouve = false;

            Object.keys(stock).forEach(categorie => {

                stock[categorie].forEach(article => {

                    if(
                        String(article.code).trim()
                        === code
                    ){

                        article.article =
                        ligne.ARTICLE ||
                        article.article;

                        article.fournisseur =
                        ligne.FOURNISSEUR || "";

                        article.codeFournisseur =
                        ligne.CODE_FOURNISSEUR || "";

                        article.colisage =
                        Number(
                            ligne.COLISAGE || 1
                        );

                        article.prix =
                        Number(
                            ligne.PRIX_ACHAT || 0
                        );
article.categorie =
ligne.CATEGORIE || "";
                        trouve = true;
                        maj++;

                    }

                });

            });

            if(!trouve){

           stock["HDLP BAR"].push({

    id: crypto.randomUUID(),

    code: code,

    article:
    ligne.ARTICLE || "NOUVEL ARTICLE",

    categorie:
    ligne.CATEGORIE || "",

    stock: 0,

    prix:
    Number(ligne.PRIX_ACHAT || 0),

    fournisseur:
    ligne.FOURNISSEUR || "",

    codeFournisseur:
    ligne.CODE_FOURNISSEUR || "",

    colisage:
    Number(ligne.COLISAGE || 1),

    mouvements: []

});


                nouveaux++;

            }

        });

        save();
        mettreAJourSuggestions();
        render();

        alert(
            "✅ " + maj +
            " article(s) mis à jour\n\n" +
            "🆕 " + nouveaux +
            " nouvel(le)(s) article(s) créé(s)"
        );

    };

    reader.readAsArrayBuffer(fichier);

}
function importerPrix(event){

    const fichier =
    event.target.files[0];

    if(!fichier) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const data =
        new Uint8Array(
            e.target.result
        );

        const wb =
        XLSX.read(data,{
            type:'array'
        });

        const ws =
        wb.Sheets[
            wb.SheetNames[0]
        ];

        const lignes =
        XLSX.utils.sheet_to_json(ws);

        let maj = 0;

        lignes.forEach(ligne => {

            const code =
            String(
                ligne.Code || ""
            ).trim();

            const prix =
            Number(
                ligne.Prix || 0
            );

            Object.keys(stock)
            .forEach(categorie => {

                stock[categorie]
                .forEach(article => {

                    if(
                        String(article.code)
                        === code
                    ){

                        article.prix = prix;
                        maj++;

                    }

                });

            });

        });

        save();

        render();

        alert(
            maj +
            " prix mis à jour"
        );

    };

    reader.readAsArrayBuffer(
        fichier
    );

}
function mettreAJourListeFournisseurs(){

    const fournisseurs = [
        ...new Set(
            Object.values(stock)
            .flat()
            .map(a => a.fournisseur)
            .filter(f => f && f.trim() !== "")
        )
    ].sort();

    const liste =
    document.getElementById(
        "listeFournisseurs"
    );

    if(!liste) return;

    liste.innerHTML =
    fournisseurs.map(f =>

        `<option value="${f}"></option>`

    ).join("");

}

function ouvrirReceptionRapide(){

document.getElementById("cards").innerHTML = `

<div class="card">

<h2>📦 Réception rapide</h2>

<div id="blocFournisseur">

Fournisseur

<br>

<input
id="fournisseurReception"
list="listeFournisseurs"
placeholder="Rechercher un fournisseur"
oninput="rechercherReception()">

<datalist id="listeFournisseurs"></datalist>

</div>

<br><br>

Code fournisseur

<br>

<input
id="codeFournisseurReception"
type="number"
inputmode="numeric"
pattern="[0-9]*"
placeholder="🔢 Code fournisseur"
oninput="rechercherReception()"
onfocus="this.select()"
style="
width:100%;
padding:15px;
font-size:22px;
font-weight:bold;
box-sizing:border-box;
">

<br><br>

<div id="blocRechercheArticle">

Article / Code / Code fournisseur

<br>

<input
id="rechercheReception"
placeholder="Code article, code fournisseur ou article"
oninput="rechercherReception()">
</div>

<br><br>

<div id="resultatsReception"></div>

</div>

`;

mettreAJourListeFournisseurs();

}


function rechercherReception(){
const fournisseur =

document
.getElementById(
    "fournisseurReception"
)
?.value
?.toLowerCase() || "";

const codeFournisseurRecherche =

document
.getElementById(
    "codeFournisseurReception"
)
?.value
?.toLowerCase() || "";

const blocFournisseur =
document.getElementById(
    "blocFournisseur"
);

const blocRechercheArticle =
document.getElementById(
    "blocRechercheArticle"
);

if(codeFournisseurRecherche !== ""){

    blocFournisseur.style.display =
    "none";

    blocRechercheArticle.style.display =
    "none";

}
else{

    blocFournisseur.style.display =
    "";

    blocRechercheArticle.style.display =
    "";

}

document
.getElementById(
    "codeFournisseurReception"
)
?.value
?.toLowerCase() || "";


    const recherche =
    document.getElementById(
        "rechercheReception"
    )
    .value
    .toLowerCase();
const dejaVus = new Set();
    let html = "";

    Object.keys(stock).forEach(categorie => {

        stock[categorie].forEach(article => {
            
            if(dejaVus.has(String(article.code))){
    return;
}

dejaVus.add(String(article.code));

if(
    fournisseur &&
    String(article.fournisseur || "")
    .toLowerCase() !== fournisseur
){
    return;
}
const matchRecherche =

    String(article.code || "")
    .toLowerCase()
    .includes(recherche)

    ||

    String(article.article || "")
    .toLowerCase()
    .includes(recherche)

    ||

    String(article.codeFournisseur || "")
    .toLowerCase()
    .includes(recherche);

const matchCodeFournisseur =

    codeFournisseurRecherche === ""

    ||

    String(article.codeFournisseur || "")
    .toLowerCase()
    .includes(codeFournisseurRecherche);

if(
    matchRecherche
    &&
    matchCodeFournisseur
){

                html += `

                <div class="card">

                   <b>${article.article}</b>

<br>

Code :
${article.code}

${
codeFournisseurRecherche === ""
?
`
<br>

Fournisseur :
${article.fournisseur || "-"}

<br>

Code fournisseur :
${article.codeFournisseur || "-"}

<br>

Colisage :
${article.colisage || 1}

<br>

Prix actuel :
${Number(article.prix || 0).toFixed(2)} €
`
:
""
}
                    <br>
                   
                    Destination :

                    <select
                    id="destination_${article.id}">

                        <option>
                        HDLP MINI BAR
                        </option>

                        <option>
                        HDLP SOFT
                        </option>

                        <option>
                        HDLP BAR
                        </option>

                        <option>
                        HDLP SEMINAIRE
                        </option>

                        <option>
                        RCLP ALCOOL
                        </option>

                        <option>
                        RCLP SOFT
                        </option>

                        <option>
                        RCLP VIN
                        </option>

                    </select>

                    <br><br>

             

Cartons :

<input
type="number"
min="0"
id="cartons_${article.id}"
placeholder=""
oninput="calculReception('${article.id}',${article.colisage || 1},${article.prix || 0})">

<br><br>

Pièces :

<input
type="number"
min="0"
id="pieces_${article.id}"
placeholder=""
oninput="calculReception('${article.id}',${article.colisage || 1},${article.prix || 0})">

<br><br>

<div id="totalPieces_${article.id}">
Total réception : 0 pièce(s)
</div>

<br>

Montant réception (€)

<br>

<input
type="number"
step="0.01"
id="montant_${article.id}"
placeholder=""
onfocus="this.dataset.auto='0'">

<br><br>

<button
onclick="
receptionRapide(
'${article.code}',
'${article.id}'
)
">
✅ Réception
</button>


                </div>

                `;

            }

        });

    });

    document.getElementById(
        "resultatsReception"
    ).innerHTML = html;

}
function calculReception(
    id,
    colisage,
    prix
){

    const cartons = Number(
        document.getElementById(
            "cartons_" + id
        ).value || 0
    );

    const pieces = Number(
        document.getElementById(
            "pieces_" + id
        ).value || 0
    );

    const totalPieces =
        (cartons * colisage)
        + pieces;

    document.getElementById(
        "totalPieces_" + id
    ).innerHTML =

    "Total réception : <b>" +
    totalPieces +
    "</b> pièce(s)";

    const montant =
        totalPieces *
        Number(prix || 0);

 const champMontant =
document.getElementById(
    "montant_" + id
);

if(totalPieces > 0){

    if(
        champMontant.value === "" ||
        champMontant.dataset.auto !== "0"
    ){
        champMontant.value = montant.toFixed(2);
        champMontant.dataset.auto = "1";
    }

}else{

    champMontant.value = "";
    champMontant.dataset.auto = "1";

}

}
function receptionRapide(
    code,
    id
){

    const destination =
    document.getElementById(
        "destination_" + id
    ).value;

    const article =
    stock[destination]
    ?.find(a =>
        String(a.code) === String(code)
    );

    if(!article){

        alert(
            "Article introuvable dans la destination"
        );

        return;
    }

  const cartons =
Number(
document.getElementById(
"cartons_" + id
).value || 0
);

const pieces =
Number(
document.getElementById(
"pieces_" + id
).value || 0
);

const quantiteReelle =

(cartons *
Number(article.colisage || 1))

+

pieces;


    article.stock =
    Number(article.stock || 0)
    +
    quantiteReelle;

    const montant =
    Number(
        document.getElementById(
            "montant_" + id
        ).value || 0
    );

    if(
        montant > 0 &&
        quantiteReelle > 0
    ){

        const nouveauPrix =
        montant /
        quantiteReelle;

        Object.keys(stock)
        .forEach(categorie => {

            stock[categorie]
            .forEach(a => {

                if(
                    String(a.code)
                    ===
                    String(article.code)
                ){

                    a.prix =
                    Number(
                        nouveauPrix.toFixed(2)
                    );

                }

            });

        });

    }

    if(!article.mouvements){

        article.mouvements = [];

    }

    article.mouvements.push({

        date:
        new Date()
        .toLocaleString(),

        type:
        "ENTREE",

        quantite:
        quantiteReelle,

        origine:
        "RECEPTION RAPIDE",

        fournisseur:
        article.fournisseur || ""

    });

    save();

    alert(
        "✅ Réception enregistrée\n\n" +
        quantiteReelle +
        " pièce(s) ajoutée(s)"
    );

    rechercherReception();

}
function importStock(event){

    const file =
    event.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        stock =
        JSON.parse(
            e.target.result
        );

        save();

        render();

        alert(
        "Sauvegarde restaurée"
        );

    };

    reader.readAsText(file);

}
function modifierArticle(id){

  const article =
(stock[categorieActive] || [])
.find(a => a.id === id);


    if(!article) return;

    let nouveauStock =
    prompt(
        "Stock",
        article.stock
    );

    if(nouveauStock === null) return;

    let nouveauPrix =
    prompt(
        "Prix",
        article.prix
    );

    if(nouveauPrix === null) return;

    article.stock =
    Number(nouveauStock);

    article.prix =
    Number(nouveauPrix);

    save();

    render();

}
function remettreStocksAZero(){

    if(
        !confirm(
            "Remettre tous les stocks à zéro ?"
        )
    ){
        return;
    }

    Object.keys(stock)
    .forEach(categorie => {

        stock[categorie]
        .forEach(article => {

            article.stock = 0;

        });

    });

    save();

    render();

    alert(
        "Tous les stocks ont été remis à zéro ✅"
    );

}
function voirMouvements(id){

    const article =
    (stock[categorieActive] || [])
    .find(a => a.id === id);

    if(!article) return;

    if(
        !article.mouvements ||
        article.mouvements.length === 0
    ){
        alert(
            "Aucun mouvement"
        );
        return;
    }

    let texte =
    "📜 HISTORIQUE\n\n";

    article.mouvements
    .slice()
    .reverse()
    .forEach(m => {

        texte +=

        "📅 " +
        (m.date || "") +

        "\n" +

        "Type : " +
        (m.type || "") +

        "\n" +

        "Qté : " +
        (m.quantite || 0) +

        "\n" +

        "Origine : " +
        (m.origine || "") +

        "\n";

        if(m.fournisseur){

            texte +=

            "Fournisseur : " +

            m.fournisseur +

            "\n";

        }

        texte += "\n";

    });

    alert(texte);

}
function exportStock(){

    const blob =
    new Blob(
        [
            JSON.stringify(
                stock,
                null,
                2
            )
        ],
        {
            type:"application/json"
        }
    );

    const lien =
    document.createElement("a");

    lien.href =
    URL.createObjectURL(blob);

    lien.download =
    "stock-central.json";

    lien.click();

}
function renderOnglets(){

document.getElementById(
"ongletsPrincipaux"
).innerHTML = `

<div style="width:100%;display:flex;gap:10px;">

<button
class="tab"
style="${
siteActif==='DASHBOARD'
? 'background:#28a745;color:white;'
: ''
}"
onclick="changerSite('DASHBOARD')">

📊 TABLEAU DE BORD

</button>

<button
class="tab"
style="${
siteActif==='HISTORIQUE'
? 'background:#6f42c1;color:white;'
: ''
}"
onclick="changerSite('HISTORIQUE')">

📜 HISTORIQUE

</button>

</div>

<div style="width:100%;display:flex;gap:10px;">

<button
class="tab"
style="${
siteActif==='HDLP'
? 'background:#1976d2;color:white;'
: ''
}"
onclick="changerSite('HDLP')">

🏨 STOCK HDLP

</button>

<button
class="tab"
style="${
siteActif==='RCLP'
? 'background:#ff9800;color:white;'
: ''
}"
onclick="changerSite('RCLP')">

🍴 STOCK RCLP

</button>

</div>

<div style="width:100%;">

<button
class="tab"
style="
width:100%;
${
siteActif==='VENTES'
? 'background:#e91e63;color:white;'
: ''
}"
onclick="changerSite('VENTES')">

📈 VENTES BOUTIQUE

</button>

</div>

`;

let html = "";

if(
    siteActif === "HDLP" ||
    siteActif === "RCLP"
){
    categories[siteActif]
    .forEach(c=>{

        const couleur =
        siteActif === "RCLP"
        ? "#ff9800"
        : "#1976d2";

        const style =
        categorieActive === c
        ? `background:${couleur};color:white;`
        : "";

  html += `
<button
class="tab"
style="
${style}
font-size:22px;
padding:20px;
min-height:80px;
font-weight:bold;
margin:5px;
width:100%;
"
onclick="changerCategorie('${c}')">

${c}

</button>
`;

    });

}

document.getElementById(
"sousOnglets"
).innerHTML = html;

}
function changerSite(site){

    siteActif = site;

    if(site === "HDLP"){

        categorieActive = "TOUS_HDLP";

    }
    else if(site === "RCLP"){

        categorieActive = "TOUS_RCLP";

    }
    else if(site === "HISTORIQUE"){

        categorieActive = "HISTORIQUE";

    }
    else if(site === "VENTES"){

        categorieActive = "VENTES";

    }
    else{

        categorieActive = "DASHBOARD";

    }

    renderOnglets();

    render();

}
function changerCategorie(cat){

categorieActive = cat;

renderOnglets();

render();

}
function importRemonteeHDLP(){

    const mouvements =
    JSON.parse(
        localStorage.getItem(
            "remonteeHDLP"
        )
    ) || [];

    if(mouvements.length === 0){

        alert("Aucune remontée HDLP");

        return;

    }

    let html = `

    <div class="card">

    <h2>📥 Remontées HDLP</h2>
<button onclick="supprimerRemonteesHDLP()">
🗑️ Purger HDLP
</button>
    `;

    mouvements.forEach((m,index)=>{

        const caveMemo =
        localStorage.getItem(
            "cave_" + m.code
        ) || "HDLP BAR";

        html += `

        <div style="
        border-bottom:1px solid #ddd;
        padding:10px;
        ">

            <b>
            ${m.article}
            </b>
<br>

Type :

${
m.type === "REDESCENTE"
?
"<span style='color:#28a745;font-weight:bold'>🟢 REDESCENTE</span>"
:
"<span style='color:#dc3545;font-weight:bold'>🔴 REMONTEE</span>"
}

            <br>

            Code :
            ${m.code}

            <br>

            Quantité :
            ${m.quantite}

            <br><br>

            Cave :

            <select
            id="caveHDLP_${index}">

                <option
                value="HDLP MINI BAR"
                ${
                caveMemo ===
                "HDLP MINI BAR"
                ? "selected"
                : ""
                }>
                HDLP MINI BAR
                </option>

                <option
                value="HDLP SOFT"
                ${
                caveMemo ===
                "HDLP SOFT"
                ? "selected"
                : ""
                }>
                HDLP SOFT
                </option>

                <option
                value="HDLP BAR"
                ${
                caveMemo ===
                "HDLP BAR"
                ? "selected"
                : ""
                }>
                HDLP BAR
                </option>

                <option
                value="HDLP SEMINAIRE"
                ${
                caveMemo ===
                "HDLP SEMINAIRE"
                ? "selected"
                : ""
                }>
                HDLP SEMINAIRE
                </option>

            </select>

        </div>

        `;

    });

    html += `

    <br>

    <button
    onclick="validerImportHDLP()">

    ✅ Importer les remontées

    </button>

    </div>

    `;

    document
    .getElementById("cards")
    .innerHTML =
    html;

}
function supprimerVentesBoutique(){

    if(
        !confirm(
            "Supprimer toutes les ventes boutique ?"
        )
    ){
        return;
    }

    localStorage.removeItem(
        "ventesBoutique"
    );

    alert(
        "Ventes boutique supprimées ✅"
    );

}
function supprimerRemonteesRCLP(){

    if(
        !confirm(
            "Supprimer toutes les remontées RCLP ?"
        )
    ){
        return;
    }

    localStorage.removeItem(
        "remonteeRCLP"
    );

    alert(
        "Remontées RCLP supprimées ✅"
    );

}
function supprimerRemonteesHDLP(){

    if(
        !confirm(
            "Supprimer toutes les remontées HDLP ?"
        )
    ){
        return;
    }

    localStorage.removeItem(
        "remonteeHDLP"
    );

    alert(
        "Remontées HDLP supprimées ✅"
    );

}

function validerImportHDLP(){

    const mouvements =
    JSON.parse(
        localStorage.getItem(
            "remonteeHDLP"
        )
    ) || [];

    mouvements.forEach((m,index) => {

        const cave =

        document
        .getElementById(
            "caveHDLP_" + index
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

        // Gestion remontée / redescente

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
            ? "REDESCENTE HDLP"
            : "REMONTEE HDLP"

        });

    });

    save();

    localStorage.removeItem(
        "remonteeHDLP"
    );

    changerSite(
        "DASHBOARD"
    );

    alert(
        "Mouvements HDLP importés ✅"
    );

}

function importRemonteeRCLP(){

    const mouvements =
    JSON.parse(
        localStorage.getItem(
            "remonteeRCLP"
        )
    ) || [];

    if(mouvements.length === 0){

        alert("Aucune remontée RCLP");

        return;

    }

    let html = `

    <div class="card">

    <h2>📥 Remontées RCLP</h2>
<button onclick="supprimerRemonteesRCLP()">
🗑️ Purger RCLP
</button>
    `;

    mouvements.forEach((m,index)=>{

        const caveMemo =
        localStorage.getItem(
            "cave_" + m.code
        ) || "RCLP ALCOOL";

        html += `

        <div style="
        border-bottom:1px solid #ddd;
        padding:10px;
        ">

            <b>
            ${m.article}
            </b>
<br>

Type :

<span style="
font-weight:bold;
color:${
m.type === "REDESCENTE"
? "#28a745"
: "#dc3545"
};
">

${m.type}

</span>

            <br>

            Code :
            ${m.code}

            <br>

            Quantité :
            ${m.quantite}

            <br><br>

            Cave :

            <select
            id="caveRCLP_${index}">

                <option
                value="RCLP ALCOOL"
                ${
                caveMemo ===
                "RCLP ALCOOL"
                ? "selected"
                : ""
                }>
                RCLP ALCOOL
                </option>

                <option
                value="RCLP SOFT"
                ${
                caveMemo ===
                "RCLP SOFT"
                ? "selected"
                : ""
                }>
                RCLP SOFT
                </option>

                <option
                value="RCLP VIN"
                ${
                caveMemo ===
                "RCLP VIN"
                ? "selected"
                : ""
                }>
                RCLP VIN
                </option>

            </select>

        </div>

        `;

    });

    html += `

    <br>

    <button
    onclick="validerImportRCLP()">

    ✅ Importer les remontées

    </button>

    </div>

    `;

    document
    .getElementById("cards")
    .innerHTML =
    html;

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
function importVentesBoutique(){

    const ventes =
    JSON.parse(
        localStorage.getItem(
            "ventesBoutique"
        )
    ) || [];

    if(ventes.length === 0){

        alert(
            "Aucune vente boutique"
        );

        return;

    }

    let html = `

    <div class="card">

    <h2>🛍️ Ventes Boutique</h2>
<button onclick="supprimerVentesBoutique()">
🗑️ Purger Boutique
</button>
    `;

    ventes.forEach((v,index)=>{

        const caveMemo =
        localStorage.getItem(
            "cave_" + v.code
        ) || "HDLP SOFT";

        html += `

        <div style="
        border-bottom:1px solid #ddd;
        padding:10px;
        ">

            <b>
            ${v.article}
            </b>

            <br>

            Code :
            ${v.code}

            <br>

            Quantité :
            ${v.quantite}

            <br><br>

            Cave :

            <select
            id="venteBoutique_${index}">

                <option value="HDLP MINI BAR"
                ${caveMemo==="HDLP MINI BAR"?"selected":""}>
                HDLP MINI BAR
                </option>

                <option value="HDLP SOFT"
                ${caveMemo==="HDLP SOFT"?"selected":""}>
                HDLP SOFT
                </option>

                <option value="HDLP BAR"
                ${caveMemo==="HDLP BAR"?"selected":""}>
                HDLP BAR
                </option>

                <option value="HDLP SEMINAIRE"
                ${caveMemo==="HDLP SEMINAIRE"?"selected":""}>
                HDLP SEMINAIRE
                </option>

                <option value="RCLP ALCOOL"
                ${caveMemo==="RCLP ALCOOL"?"selected":""}>
                RCLP ALCOOL
                </option>

                <option value="RCLP SOFT"
                ${caveMemo==="RCLP SOFT"?"selected":""}>
                RCLP SOFT
                </option>

                <option value="RCLP VIN"
                ${caveMemo==="RCLP VIN"?"selected":""}>
                RCLP VIN
                </option>

            </select>

        </div>

        `;

    });

    html += `

    <br>

    <button
    onclick="validerImportBoutique()">

    ✅ Importer les ventes

    </button>

    </div>

    `;

    document.getElementById(
        "cards"
    ).innerHTML = html;

}
function validerImportBoutique(){

    const ventes =
    JSON.parse(
        localStorage.getItem(
            "ventesBoutique"
        )
    ) || [];

    ventes.forEach((v,index)=>{

        const cave =

        document
        .getElementById(
            "venteBoutique_" + index
        )
        .value;

        localStorage.setItem(
            "cave_" + v.code,
            cave
        );

        const article =

        stock[cave]
        ?.find(a =>

            String(a.code)

            ===

            String(v.code)

        );

        if(!article) return;

        article.stock =

        Number(article.stock || 0)

        -

        Number(v.quantite || 0);

        if(!article.mouvements){

            article.mouvements = [];

        }

        article.mouvements.push({

            date:
            v.date,

            type:
            "SORTIE",

            quantite:
            v.quantite,

            origine:
            "VENTE BOUTIQUE"

        });

    });

    save();

    localStorage.removeItem(
        "ventesBoutique"
    );

    changerSite(
        "DASHBOARD"
    );

    alert(
        "Ventes Boutique importées ✅"
    );

}
function importCommandeHDLP(){

    const commandes =
    JSON.parse(
        localStorage.getItem(
            "commandeHDLP"
        )
    ) || [];

    if(commandes.length === 0){

        alert(
            "Aucune commande HDLP"
        );

        return;

    }

    let html = `

    <div class="card">

    <h2>🚚 Commandes HDLP</h2>

    `;

    commandes.forEach((c,index)=>{

        const caveMemo =
        localStorage.getItem(
            "cave_" + c.code
        ) || "HDLP BAR";

        const articleExiste =
        stock[caveMemo]
        ?.find(a =>

            String(a.code)
            ===
            String(c.code)

        );

        const montantDefaut =

        articleExiste?.prix

        ? Number(articleExiste.prix) *
          Number(c.quantite)

        : "";

        html += `

        <div style="
        border-bottom:1px solid #ddd;
        padding:10px;
        ">

            <b>
            ${c.article}
            </b>

            <br>

            Code :
            ${c.code}

            <br>

            Quantité :
            +${c.quantite}

            <br><br>

            Cave :

            <select
            id="commandeHDLP_${index}">

                <option value="HDLP MINI BAR"
                ${caveMemo==="HDLP MINI BAR"?"selected":""}>
                HDLP MINI BAR
                </option>

                <option value="HDLP SOFT"
                ${caveMemo==="HDLP SOFT"?"selected":""}>
                HDLP SOFT
                </option>

                <option value="HDLP BAR"
                ${caveMemo==="HDLP BAR"?"selected":""}>
                HDLP BAR
                </option>

                <option value="HDLP SEMINAIRE"
                ${caveMemo==="HDLP SEMINAIRE"?"selected":""}>
                HDLP SEMINAIRE
                </option>

            </select>

            <br><br>

            Valeur achat (€)

            <br>

            <input
            type="number"
            step="0.01"
            id="prixHDLP_${index}"
            value="${montantDefaut}"
            placeholder="Montant total">

        </div>

        `;

    });

    html += `

    <br>

    <button
    onclick="validerImportCommandeHDLP()">

    ✅ Importer les réceptions

    </button>

    </div>

    `;

    document
    .getElementById("cards")
    .innerHTML =
    html;

}

function validerImportCommandeHDLP(){

    const commandes =
    JSON.parse(
        localStorage.getItem(
            "commandeHDLP"
        )
    ) || [];

    commandes.forEach((c,index)=>{

        const cave =

        document
        .getElementById(
            "commandeHDLP_" + index
        )
        .value;

        const montant =
        Number(
            document
            .getElementById(
                "prixHDLP_" + index
            )
            .value || 0
        );

        const prixUnitaire =

        Number(c.quantite) > 0

        ? montant /
          Number(c.quantite)

        : 0;

        localStorage.setItem(
            "cave_" + c.code,
            cave
        );

        const article =

        stock[cave]
        ?.find(a =>

            String(a.code)

            ===

            String(c.code)

        );

        if(!article) return;

        article.stock =

        Number(article.stock || 0)

        +

        Number(c.quantite || 0);

       if(prixUnitaire > 0){

    Object.keys(stock).forEach(categorie => {

        stock[categorie].forEach(a => {

            if(
                String(a.code).trim() ===
                String(article.code).trim()
            ){

                a.prix =
                Number(
                    prixUnitaire.toFixed(2)
                );

            }

        });

    });

}
        if(!article.mouvements){

            article.mouvements = [];

        }

     article.mouvements.push({

    date:
    c.date,

    type:
    "ENTREE",

    quantite:
    c.quantite,

    origine:
    "COMMANDE HDLP",

    fournisseur:
    c.fournisseur || ""

});

    });

    save();

    localStorage.removeItem(
        "commandeHDLP"
    );

    changerSite(
        "DASHBOARD"
    );

    alert(
        "Commandes HDLP importées ✅"
    );

}
function importCommandeRCLP(){

    const commandes =
    JSON.parse(
        localStorage.getItem(
            "commandeRCLP"
        )
    ) || [];

    if(commandes.length === 0){

        alert(
            "Aucune commande RCLP"
        );

        return;

    }

    let html = `

    <div class="card">

    <h2>🚚 Commandes RCLP</h2>

    `;

    commandes.forEach((c,index)=>{

        const caveMemo =
        localStorage.getItem(
            "cave_" + c.code
        ) || "RCLP ALCOOL";

        const articleExiste =
        stock[caveMemo]
        ?.find(a =>

            String(a.code)
            ===
            String(c.code)

        );

        const montantDefaut =

        articleExiste?.prix

        ? Number(articleExiste.prix) *
          Number(c.quantite)

        : "";

        html += `

        <div style="
        border-bottom:1px solid #ddd;
        padding:10px;
        ">

            <b>
            ${c.article}
            </b>

            <br>

            Code :
            ${c.code}

            <br>

            Quantité :
            +${c.quantite}

            <br><br>

            Cave :

            <select
            id="commandeRCLP_${index}">

                <option value="RCLP ALCOOL"
                ${caveMemo==="RCLP ALCOOL"?"selected":""}>
                RCLP ALCOOL
                </option>

                <option value="RCLP SOFT"
                ${caveMemo==="RCLP SOFT"?"selected":""}>
                RCLP SOFT
                </option>

                <option value="RCLP VIN"
                ${caveMemo==="RCLP VIN"?"selected":""}>
                RCLP VIN
                </option>

            </select>

            <br><br>

            Valeur achat (€)

            <br>

            <input
            type="number"
            step="0.01"
            id="prixRCLP_${index}"
            value="${montantDefaut}"
            placeholder="Montant total">

        </div>

        `;

    });

    html += `

    <br>

    <button
    onclick="validerImportCommandeRCLP()">

    ✅ Importer les réceptions

    </button>

    </div>

    `;

    document
    .getElementById("cards")
    .innerHTML =
    html;

}
function validerImportCommandeRCLP(){

    const commandes =
    JSON.parse(
        localStorage.getItem(
            "commandeRCLP"
        )
    ) || [];

    commandes.forEach((c,index)=>{

        const cave =

        document
        .getElementById(
            "commandeRCLP_" + index
        )
        .value;

        const montant =
        Number(
            document
            .getElementById(
                "prixRCLP_" + index
            )
            .value || 0
        );

        const prixUnitaire =

        Number(c.quantite) > 0

        ? montant /
          Number(c.quantite)

        : 0;

        localStorage.setItem(
            "cave_" + c.code,
            cave
        );

        const article =

        stock[cave]
        ?.find(a =>

            String(a.code)

            ===

            String(c.code)

        );

        if(!article) return;

        article.stock =

        Number(article.stock || 0)

        +

        Number(c.quantite || 0);

     if(prixUnitaire > 0){

    Object.keys(stock).forEach(categorie => {

        stock[categorie].forEach(a => {

            if(
                String(a.code).trim() ===
                String(article.code).trim()
            ){

                a.prix =
                Number(
                    prixUnitaire.toFixed(2)
                );

            }

        });

    });

}

        if(!article.mouvements){

            article.mouvements = [];

        }

    article.mouvements.push({

    date:
    c.date,

    type:
    "ENTREE",

    quantite:
    c.quantite,

    origine:
    "COMMANDE RCLP",

    fournisseur:
    c.fournisseur || ""

});

    });

    save();

    localStorage.removeItem(
        "commandeRCLP"
    );

    changerSite(
        "DASHBOARD"
    );

    alert(
        "Commandes RCLP importées ✅"
    );

}
function transfererArticle(id){

    articleTransfertActif =
    (stock[categorieActive] || [])
    .find(a => a.id === id);

    if(!articleTransfertActif) return;

    document.getElementById(
        "articleTransfert"
    ).innerHTML =

    "<b>" +
    articleTransfertActif.article +
    "</b><br>Stock : " +
    articleTransfertActif.stock;

    document.getElementById(
        "quantiteTransfert"
    ).value = "";

    document.getElementById(
        "popupTransfert"
    ).style.display =
    "block";

}
function transfertCoupe(id){

    const article =
    (stock[categorieActive] || [])
    .find(a => a.id === id);

    if(!article) return;

    const quantite =
    Number(
        prompt(
            "Quantité à transférer en coupes ?",
            "1"
        )
    );

    if(
        isNaN(quantite)
        ||
        quantite <= 0
    ){
        return;
    }

    if(
        Number(article.stock || 0)
        < quantite
    ){
        alert("Stock insuffisant");
        return;
    }

    const champagneCoupe =

    Object.values(stock)
    .flat()
    .find(a =>
        String(a.code) === "185"
    );

    if(!champagneCoupe){

        alert(
            "Article code 185 introuvable"
        );

        return;
    }

    article.stock -= quantite;

    champagneCoupe.stock =
    Number(
        champagneCoupe.stock || 0
    ) + quantite;

    article.mouvements =
    article.mouvements || [];

    champagneCoupe.mouvements =
    champagneCoupe.mouvements || [];

    article.mouvements.push({

        date:
        new Date().toLocaleString(),

        type:
        "TRANSFERT COUPE",

        quantite:
        quantite,

        origine:
        "VERS CODE 185"

    });

    champagneCoupe.mouvements.push({

        date:
        new Date().toLocaleString(),

        type:
        "TRANSFERT COUPE",

        quantite:
        quantite,

        origine:
        article.article

    });

    save();

    render();

    alert(
        "✅ " +
        quantite +
        " transférée(s) vers Champagne Coupe"
    );

}
function fermerTransfert(){

    document.getElementById(
        "popupTransfert"
    ).style.display =
    "none";

    articleTransfertActif = null;

}
function validerTransfert(){

    if(!articleTransfertActif) return;

    const quantite =
    Number(
        document.getElementById(
            "quantiteTransfert"
        ).value
    );

    if(
        isNaN(quantite) ||
        quantite <= 0
    ){
        alert(
            "Quantité invalide"
        );
        return;
    }

    const destination =
    document.getElementById(
        "destinationTransfert"
    ).value;

    const articleDestination =
    stock[destination]
    ?.find(a =>

        String(a.code)

        ===

        String(
            articleTransfertActif.code
        )

    );

    if(!articleDestination){

        alert(
            "Article introuvable dans cette cave"
        );

        return;
    }
if(
    quantite >
    Number(articleTransfertActif.stock || 0)
){
    alert("Stock insuffisant");
    return;
}
    articleTransfertActif.stock =

    Number(
        articleTransfertActif.stock || 0
    )

    -

    quantite;

    articleDestination.stock =

    Number(
        articleDestination.stock || 0
    )

    +

    quantite;

    if(!articleTransfertActif.mouvements){

        articleTransfertActif.mouvements = [];

    }

    if(!articleDestination.mouvements){

        articleDestination.mouvements = [];

    }

    articleTransfertActif.mouvements.push({

      date:
new Date().toISOString(),

        type:
        "TRANSFERT SORTIE",

        quantite:
        quantite,

        origine:
        "VERS " + destination

    });

    articleDestination.mouvements.push({

        date:
        new Date()
        .toLocaleString(),

        type:
        "TRANSFERT ENTREE",

        quantite:
        quantite,

        origine:
        "DEPUIS " + categorieActive

    });

    save();

    fermerTransfert();

    render();

    alert(
        "Transfert effectué ✅"
    );

}
function render(){

let liste = [];

if(categorieActive === "TOUS_HDLP"){

    Object.keys(stock).forEach(cat => {

        if(cat.startsWith("HDLP")){

          (stock[cat] || []).forEach(a => {

    liste.push({
        ...a,
        cave: cat
    });

});

        }

    });

}
else if(categorieActive === "TOUS_RCLP"){

    Object.keys(stock).forEach(cat => {

        if(cat.startsWith("RCLP")){

         (stock[cat] || []).forEach(a => {

    liste.push({
        ...a,
        cave: cat
    });

});

        }

    });

}
else{

    liste = stock[categorieActive] || [];

}
const valeurRecherche =
document.getElementById("search")
?.value || "";

const rechercheCode =
valeurRecherche.includes(" - ")
? valeurRecherche.split(" - ")[0].trim()
: "";

const rechercheTexte =
valeurRecherche.includes(" - ")
? valeurRecherche.split(" - ").slice(1).join(" - ").toLowerCase().trim()
: valeurRecherche.toLowerCase().trim();
    const filtreCave =
document.getElementById("filtreCave")
?.value || "";
  const filtreCategorie =
document.getElementById(
    "filtreCategorie"
)?.value
||
localStorage.getItem(
    "filtreCategorie"
)
||
"";
const filtreStock =
localStorage.getItem(
    "filtreStock"
) ?? "";

    
let mouvements = [];

Object.keys(stock)
.forEach(categorie => {

    stock[categorie]
    .forEach(article => {

        (article.mouvements || [])
        .forEach(m => {

            mouvements.push({

                article:
                article.article,

                code:
                article.code,

                cave:
                categorie,

                ...m

            });

        });

    });

});

const categoriesProduits =

[
    ...new Set(

        Object.values(stock)
        .flat()
        .map(a => a.categorie)
        .filter(c => c)

    )

]

.sort();

const fournisseurs =

[
    ...new Set(

        mouvements
        .map(m => m.fournisseur)
        .filter(f => f)

    )

]

.sort();

    
let html = "";
if(categorieActive === "HISTORIQUE"){

    let html = `

    <div class="card">

        <h2>📜 Historique Global</h2>

       <label>Site :</label>

<select
id="filtreSite"
onchange="
localStorage.setItem(
'filtreSite',
this.value
);
render();
">

<option value=""
${localStorage.getItem('filtreSite') === '' ? 'selected' : ''}>
Tous
</option>

<option value="HDLP"
${localStorage.getItem('filtreSite') === 'HDLP' ? 'selected' : ''}>
HDLP
</option>

<option value="RCLP"
${localStorage.getItem('filtreSite') === 'RCLP' ? 'selected' : ''}>
RCLP
</option>

</select>

<br><br>

<label>Type :</label>

        <select
        id="filtreType"
        onchange="
        localStorage.setItem(
        'filtreType',
        this.value
        );
        render();
        ">

            <option value=""
            ${localStorage.getItem('filtreType') === '' ? 'selected' : ''}>
            Tous
            </option>

            <option value="ENTREE"
            ${localStorage.getItem('filtreType') === 'ENTREE' ? 'selected' : ''}>
            Entrées
            </option>

            <option value="SORTIE"
            ${localStorage.getItem('filtreType') === 'SORTIE' ? 'selected' : ''}>
            Sorties
            </option>

            <option value="TRANSFERT"
            ${localStorage.getItem('filtreType') === 'TRANSFERT' ? 'selected' : ''}>
            Transferts
            </option>

        </select>

        <br><br>

        <label>Date début :</label>

        <input
        type="date"
        id="filtreDateDebut"
        value="${
        localStorage.getItem(
        'filtreDateDebut'
        ) || ''
        }"
        onchange="
        localStorage.setItem(
        'filtreDateDebut',
        this.value
        );
        render();
        ">

        <br><br>

        <label>Date fin :</label>

        <input
        type="date"
        id="filtreDateFin"
        value="${
        localStorage.getItem(
        'filtreDateFin'
        ) || ''
        }"
        onchange="
        localStorage.setItem(
        'filtreDateFin',
        this.value
        );
        render();
        ">
<br><br>

<label>Fournisseur :</label>

<select
id="filtreFournisseur"
onchange="
localStorage.setItem(
'filtreFournisseur',
this.value
);
render();
">

<option value="">
Tous
</option>

${fournisseurs.map(f => `

<option
value="${f}"
${
localStorage.getItem(
'filtreFournisseur'
) === f
? 'selected'
: ''
}>

${f}

</option>

`).join("")}

</select>

<br><br>

<label>Origine :</label>

<select
id="filtreOrigine"
onchange="
localStorage.setItem(
'filtreOrigine',
this.value
);
render();
">

<option value="">
Toutes
</option>

<option value="REMONTEE HDLP">
Remontées HDLP
</option>

<option value="REMONTEE RCLP">
Remontées RCLP
</option>

<option value="REDESCENTE HDLP">
Redescentes HDLP
</option>

<option value="REDESCENTE RCLP">
Redescentes RCLP
</option>

<option value="VENTE BOUTIQUE">
Ventes Boutique
</option>

<option value="COMMANDE HDLP">
Commandes HDLP
</option>

<option value="COMMANDE RCLP">
Commandes RCLP
</option>

<option value="TRANSFERT">
Transferts
</option>

</select>

<br><br>
<label>Article / Code :</label>

<input
id="filtreArticle"
value="${
localStorage.getItem('filtreArticle') || ''
}"
placeholder="Code ou nom article"
onchange="
localStorage.setItem(
'filtreArticle',
this.value
);
render();
">


<br><br>
<button
onclick="exportHistoriqueExcel()">

📊 Export Excel

</button>
    </div>

    `;


const filtreSite =
localStorage.getItem(
    "filtreSite"
) || "";
    
    const filtreType =
    localStorage.getItem(
        "filtreType"
    ) || "";

    const filtreOrigine =
localStorage.getItem(
    "filtreOrigine"
) || "";

    const filtreFournisseur =
localStorage.getItem(
    "filtreFournisseur"
) || "";
const filtreArticle =
localStorage.getItem(
    "filtreArticle"
) || "";
    const filtreDateDebut =
    localStorage.getItem(
        "filtreDateDebut"
    ) || "";

    const filtreDateFin =
    localStorage.getItem(
        "filtreDateFin"
    ) || "";

  
    mouvements
    .reverse()
    .forEach(m => {
if(filtreArticle){

    const recherche =
    filtreArticle.toLowerCase();

    const matchArticle =
    String(m.article || "")
    .toLowerCase()
    .includes(recherche);

    const matchCode =
    String(m.code || "")
    .includes(recherche);

    if(
        !matchArticle &&
        !matchCode
    ){
        return;
    }

}
if(filtreSite){

    const cave =
    String(
        m.cave || ""
    ).toUpperCase();

    if(
        filtreSite === "HDLP" &&
        !cave.includes("HDLP")
    ){
        return;
    }

    if(
        filtreSite === "RCLP" &&
        !cave.includes("RCLP")
    ){
        return;
    }

}

        if(
            filtreType &&
            !String(m.type)
            .includes(filtreType)
        ){
            return;
        }
        if(
    filtreOrigine
){

    if(
        filtreOrigine ===
        "TRANSFERT"
    ){

        if(
            !String(m.type)
            .includes("TRANSFERT")
        ){
            return;
        }

    }
    else{

        if(
            String(
                m.origine || ""
            )

            !==

            filtreOrigine
        ){
            return;
        }

    }

}
if(
    filtreFournisseur &&
    String(
        m.fournisseur || ""
    )
    .toUpperCase() !==
    filtreFournisseur
){
    return;
}
        
        let dateMouvement = "";

        if(
            String(m.date)
            .includes("/")
        ){

            const morceaux =
            String(m.date)
            .split(" ")[0]
            .split("/");

            if(
                morceaux.length === 3
            ){

                dateMouvement =

                morceaux[2] + "-" +
                morceaux[1].padStart(2,"0") + "-" +
                morceaux[0].padStart(2,"0");

            }

        }
        else{

            dateMouvement =
            String(m.date)
            .substring(0,10);

        }

        if(
            filtreDateDebut &&
            dateMouvement <
            filtreDateDebut
        ){
            return;
        }

        if(
            filtreDateFin &&
            dateMouvement >
            filtreDateFin
        ){
            return;
        }

        html += `

        <div class="card">

            <b>
            ${m.article}
            </b>

            <br>

            Code :
            ${m.code}

            <br>

            Type :
            ${m.type}

            <br>

            Quantité :
            ${m.quantite}

            <br>

            Origine :
            ${m.origine}

            <br>

            Cave :
            ${m.cave}

            <br>

            ${
            m.fournisseur
            ?
            "Fournisseur : " +
            m.fournisseur +
            "<br>"
            :
            ""
            }

            Date :
            ${m.date}

        </div>

        `;

    });

    document.getElementById(
        "cards"
    ).innerHTML = html;

    return;

} 
    if(categorieActive === "VENTES"){

    renderVentesBoutique();

    return;

}
if(categorieActive === "DASHBOARD"){
    

const categorieDashboard =
localStorage.getItem(
    "categorieDashboard"
) || "";

const stockMiniDashboard =
localStorage.getItem(
    "stockMiniDashboard"
);
    let valeurHDLP = 0;
    let valeurRCLP = 0;

    let totalArticles = 0;
    let sansPrix = 0;
    let stockZero = 0;

    Object.keys(stock).forEach(cat=>{

        stock[cat].forEach(a=>{

            totalArticles++;

            if(Number(a.prix || 0) === 0){
                sansPrix++;
            }

            if(Number(a.stock || 0) === 0){
                stockZero++;
            }

            const valeur =
                Number(a.stock || 0)
                *
                Number(a.prix || 0);

            if(cat.startsWith("HDLP")){

                valeurHDLP += valeur;

            }else if(cat.startsWith("RCLP")){

                valeurRCLP += valeur;

            }

        });

    });
if(valeurRecherche.trim() !== ""){

    const categorieDashboard =
    localStorage.getItem(
        "categorieDashboard"
    ) || "";

    const stockMiniDashboard =
    Number(
        localStorage.getItem(
            "stockMiniDashboard"
        ) || 0
    );

    let resultats = [];
    const dejaVus = new Set();

Object.keys(stock).forEach(categorie => {

    stock[categorie].forEach(article => {

        const matchRecherche =

            (
                rechercheTexte !== "" &&
                (article.article || "")
                .toLowerCase()
                .includes(rechercheTexte)
            )

            ||

            (
                rechercheCode !== "" &&
                String(article.code || "") === rechercheCode
            );

        if(!matchRecherche){
            return;
        }

        if(dejaVus.has(article.code)){
            return;
        }

        dejaVus.add(article.code);

        let stockHDLP = 0;
        let stockRCLP = 0;
        let prix = 0;

        Object.keys(stock).forEach(cat => {

            stock[cat].forEach(a => {

                if(
                    String(a.code) ===
                    String(article.code)
                ){

                    prix = a.prix || prix;

                    if(cat.startsWith("HDLP")){
                        stockHDLP += Number(a.stock || 0);
                    }

                    if(cat.startsWith("RCLP")){
                        stockRCLP += Number(a.stock || 0);
                    }

                }

            });

        });

        resultats.push({

            article: article.article,
            code: article.code,
            categorie: article.categorie || "",
            prix: prix,
            stockHDLP: stockHDLP,
            stockRCLP: stockRCLP

        });

    });

});

            
  let html = `



`;

    resultats.forEach(r => {

        html += `

        <div class="card">

            <h3>${r.article}</h3>

           Code : ${r.code}

<br>

Catégorie :
${r.categorie || "-"}

            <br><br>

            Prix :
            ${Number(r.prix || 0).toFixed(2)} €

            <br><br>

            🏨 HDLP :
            <b>${r.stockHDLP}</b>

            <br><br>

            🍴 RCLP :
            <b>${r.stockRCLP}</b>

            <br><br>

            📦 TOTAL :
            <b>${r.stockHDLP + r.stockRCLP}</b>

        </div>

        `;

    });

    document.getElementById("cards").innerHTML = html;

    return;

}
    let analyseCategorie = "";
if(categorieDashboard){

    const dejaVus = new Set();

    Object.keys(stock).forEach(cat => {

        stock[cat].forEach(article => {

            if(article.categorie !== categorieDashboard){
                return;
            }

            if(dejaVus.has(article.code)){
                return;
            }

            dejaVus.add(article.code);

            let stockHDLP = 0;
            let stockRCLP = 0;

            Object.keys(stock).forEach(c => {

                stock[c].forEach(a => {

                    if(String(a.code) === String(article.code)){

                        if(c.startsWith("HDLP")){
                            stockHDLP += Number(a.stock || 0);
                        }

                        if(c.startsWith("RCLP")){
                            stockRCLP += Number(a.stock || 0);
                        }

                    }

                });

            });

  if(
    stockMiniDashboard !== null &&
    stockMiniDashboard !== "" &&
    stockHDLP < Number(stockMiniDashboard) &&
    stockRCLP < Number(stockMiniDashboard)
){
    return;
}
            analyseCategorie += `

           <div class="card" style="
width:100%;
box-sizing:border-box;
">

                <b>${article.article}</b>

                <br><br>

                🏨 HDLP :
                <b>${stockHDLP}</b>

                <br><br>

                🍴 RCLP :
                <b>${stockRCLP}</b>

                <br><br>

                📦 TOTAL :
                <b>${stockHDLP + stockRCLP}</b>

            </div>

            `;

        });

    });

}
document.getElementById("cards").innerHTML = `

<div style="
margin-left:-10px;
margin-right:-10px;
background:white;
border-radius:12px;
box-shadow:0 2px 6px rgba(0,0,0,.15);
margin-bottom:10px;
overflow:hidden;
">


<button
onclick="toggleAnalyse()"
style="
width:100%;
min-height:80px;
font-size:22px;
font-weight:bold;
border:none;
border-radius:0;
background:#f8f9fa;
cursor:pointer;
margin:0;
display:block;
box-sizing:border-box;
">


${analyseOuverte ? "🔽" : "▶️"} Analyse par catégorie

</button>

${
analyseOuverte
?
`

<div style="
padding:15px;
display:flex;
gap:10px;
width:100%;
box-sizing:border-box;
align-items:flex-end;
">

<div style="
flex:1;
min-width:0;
">

<b>Catégorie</b>

<br><br>

<select
style="
width:100%;
height:50px;
font-size:18px;
box-sizing:border-box;
"
onchange="
localStorage.setItem(
'categorieDashboard',
this.value
);
render();
">

<option value="">
Sélectionner
</option>

${categoriesProduits.map(c=>`

<option
value="${c}"
${categorieDashboard===c ? "selected" : ""}>

${c}

</option>

`).join("")}

</select>

</div>

<div style="
width:120px;
flex-shrink:0;
">

<b>Stock supérieur à</b>

<br><br>

<input
type="number"
style="
width:100%;
height:50px;
font-size:18px;
box-sizing:border-box;
"
value="${stockMiniDashboard || ""}"
onchange="
localStorage.setItem(
'stockMiniDashboard',
this.value
);
render();
">

</div>

</div>

`
:
""
}

</div>

<div class="card">
    <h2>🏨 HDLP</h2>
    Valeur du stock :
    <br><br>
    <strong>${valeurHDLP.toFixed(2)} €</strong>
</div>

<div class="card">
    <h2>🍴 RCLP</h2>
    Valeur du stock :
    <br><br>
    <strong>${valeurRCLP.toFixed(2)} €</strong>
</div>

<div class="card">

<h2>📊 GLOBAL</h2>

Articles :
${totalArticles}

<br><br>

Articles sans prix :
${sansPrix}

<br><br>

Articles stock zéro :
${stockZero}

<br><br>

Valeur HDLP :
${valeurHDLP.toFixed(2)} €

<br><br>

Valeur RCLP :
${valeurRCLP.toFixed(2)} €

<br><br>

<strong style="font-size:22px;color:#1976d2">

Valeur totale :
${(valeurHDLP + valeurRCLP).toFixed(2)} €

</strong>

</div>

${analyseCategorie}

`;

renderOnglets();
return;

}
    if(
    categorieActive === "TOUS_HDLP" ||
    categorieActive === "TOUS_RCLP"
){

html += `

<div class="card">

<b>Catégorie</b>

<br><br>

<select

id="filtreCategorie"
onchange="
localStorage.setItem(
'filtreCategorie',
this.value
);
render();
">


<option value=""
${filtreCategorie === "" ? "selected" : ""}
>
Toutes
</option>

${categoriesProduits.map(c => `

<option
value="${c}"
${filtreCategorie === c ? "selected" : ""}>

${c}

</option>

`).join("")}

</select>
<br><br>

<b>Stock minimum</b>

<br><br>

<input
type="number"
placeholder="Aucun filtre"
value="${filtreStock}"
onchange="
localStorage.setItem(
'filtreStock',
this.value
);
render();
">
</div>

`;

}
liste
.filter(a=>{

const matchRecherche =

valeurRecherche === ""

||

(
    rechercheTexte !== "" &&
    (a.article || "")
    .toLowerCase()
    .includes(rechercheTexte)
)

||

(
    rechercheCode !== "" &&
    String(a.code || "") === rechercheCode
);

const matchCave =

!filtreCave ||

a.cave === filtreCave;
    const matchCategorie =

!filtreCategorie ||

a.categorie === filtreCategorie;
const matchStock =

filtreStock === ""

||

Number(a.stock || 0)
>=
Number(filtreStock);
    
return (
    matchRecherche &&
    matchCave &&
    matchCategorie &&
    matchStock
);

})
.forEach(a=>{

const valeur =
(Number(a.stock)||0)
*
(Number(a.prix)||0);

html += `

<div class="card">

<b>${a.article}</b>

<br>

Code : ${a.code}

<br>

Catégorie :
<b>${a.categorie || "-"}</b>



${
categorieActive === "TOUS_HDLP"
||
categorieActive === "TOUS_RCLP"
?
`
<br>
Cave : <b>${a.cave}</b>
`
:
""
}

<br><br>
Stock :
<input
type="number"
value="${a.stock||0}"
onchange="
stock['${a.cave || categorieActive}']
.find(x=>x.id==='${a.id}')
.stock=Number(this.value);

save();
render();
"
>


<br><br>

Prix :

<input
type="number"
step="0.01"
value="${a.prix || 0}"

onchange="

const nouveauPrix = Number(this.value);

Object.keys(stock).forEach(categorie => {

    stock[categorie].forEach(article => {

        if(
            String(article.code).trim() ===
            String('${a.code}').trim()
        ){
            article.prix = nouveauPrix;
        }

    });

});

save();
render();

"

>

<br>
<div class="valeur"
style="
color:${Number(a.stock) < 0 ? '#dc3545' : '#1976d2'};
font-weight:bold;
">

Valeur :
${valeur.toFixed(2)} €

</div>

<br>

<button
onclick="modifierArticle('${a.id}')">

✏️ Modifier

</button>

<button
onclick="voirMouvements('${a.id}')">

📜 Historique

</button>

<button
onclick="transfererArticle('${a.id}')">

🔄 Transférer

</button>
${
String(a.cave || categorieActive)
.includes("RCLP")
?
`
<button
onclick="transfertCoupe('${a.id}')">

🥂 Coupe

</button>
`
:
""
}

</div>
`;

});
let totalStock = 0;
let totalValeur = 0;

liste.forEach(a => {

    totalStock += Number(a.stock || 0);

    totalValeur +=
    Number(a.stock || 0)
    *
    Number(a.prix || 0);

});

html += `

<div class="card">

<b>RÉCAPITULATIF</b>

<br><br>

Articles :
${liste.length}

<br>

Articles avec stock :
${liste.filter(a =>
    Number(a.stock) > 0
).length}

<br>

Stock total :
${totalStock}

<br>

Valeur totale :
${totalValeur.toFixed(2)} €

</div>
`;
document.getElementById(
"cards"
).innerHTML = html;

}

function exportHistoriqueExcel(){

    const filtreSite =
    localStorage.getItem(
        "filtreSite"
    ) || "";

    const filtreType =
    localStorage.getItem(
        "filtreType"
    ) || "";

    const filtreFournisseur =
    localStorage.getItem(
        "filtreFournisseur"
    ) || "";

    const filtreDateDebut =
    localStorage.getItem(
        "filtreDateDebut"
    ) || "";

    const filtreDateFin =
    localStorage.getItem(
        "filtreDateFin"
    ) || "";

    let exportData = [];

    Object.keys(stock)
    .forEach(categorie => {

        stock[categorie]
        .forEach(article => {

            (article.mouvements || [])
            .forEach(m => {

                if(
                    filtreSite &&
                    !categorie.startsWith(
                        filtreSite
                    )
                ){
                    return;
                }

                if(
                    filtreType &&
                    !String(m.type)
                    .includes(filtreType)
                ){
                    return;
                }

        if(
    filtreFournisseur &&
    String(m.fournisseur || "").toUpperCase() !==
    String(filtreFournisseur).toUpperCase()
){
    return;
}

                let dateMouvement = "";

                if(
                    String(m.date)
                    .includes("/")
                ){

                    const morceaux =
                    m.date
                    .split(" ")[0]
                    .split("/");

                    if(
                        morceaux.length === 3
                    ){

                        dateMouvement =

                        morceaux[2] + "-" +
                        morceaux[1].padStart(2,"0") + "-" +
                        morceaux[0].padStart(2,"0");

                    }

                }
                else{

                    dateMouvement =
                    String(m.date)
                    .substring(0,10);

                }

                if(
                    filtreDateDebut &&
                    dateMouvement <
                    filtreDateDebut
                ){
                    return;
                }

                if(
                    filtreDateFin &&
                    dateMouvement >
                    filtreDateFin
                ){
                    return;
                }

                exportData.push({

                    Date:
                    m.date,

                    Article:
                    article.article,

                    Code:
                    article.code,

                    Cave:
                    categorie,

                    Type:
                    m.type,

                    Quantite:
                    m.quantite,

                    Origine:
                    m.origine,

                    Fournisseur:
                    m.fournisseur || ""

                });

            });

        });

    });

    if(exportData.length === 0){

        alert(
            "Aucun mouvement à exporter"
        );

        return;

    }

    const wb =
    XLSX.utils.book_new();

    const ws =
    XLSX.utils.json_to_sheet(
        exportData
    );

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Historique"
    );

    const maintenant =
    new Date();

    const fichier =

    "historique-stock-" +

    maintenant.getFullYear() +

    "-" +

    String(
        maintenant.getMonth()+1
    ).padStart(2,"0") +

    "-" +

    String(
        maintenant.getDate()
    ).padStart(2,"0") +

    ".xlsx";

    XLSX.writeFile(
        wb,
        fichier
    );

}
function importerExcel(event){

    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const workbook =
        XLSX.read(
            e.target.result,
            {type:"array"}
        );
const ancienStock =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || {};

stock = {

"HDLP MINI BAR": [],
"HDLP SOFT": [],
"HDLP BAR": [],
"HDLP SEMINAIRE": [],

"RCLP ALCOOL": [],
"RCLP SOFT": [],
"RCLP VIN": []

};
     

     function importerFeuille(
    nomFeuille,
    categorie
){

    const sheet =
    workbook.Sheets[nomFeuille];

    if(!sheet) return;

    const rows =
    XLSX.utils.sheet_to_json(
        sheet,
        {defval:""}
    );

    rows.forEach(row=>{

        const code =
        row.NA ||
        row.CODE ||
        "";

        const ancien =
        ancienStock[categorie]
        ?.find(a =>
            String(a.code) === String(code)
        );

stock[categorie].push({

    id: ancien?.id || crypto.randomUUID(),

    code: code,

    article: row.ARTICLE || "",

    categorie: ancien?.categorie || "",

    stock: ancien?.stock || 0,

    prix: ancien?.prix || 0,

    fournisseur:
    ancien?.fournisseur || "",

    codeFournisseur:
    ancien?.codeFournisseur || "",

    colisage:
    ancien?.colisage || 1,

    mouvements:
    ancien?.mouvements || []

});

    });

}

 importerFeuille(
    "INVENTAIRE HDLP CAVE MINI BAR",
    "HDLP MINI BAR"
);

importerFeuille(
    "INVENTAIRE HDLP CAVE SOFT",
    "HDLP SOFT"
);

importerFeuille(
    "INVENTAIRE CAVE BAR",
    "HDLP BAR"
);

importerFeuille(
    "INVENTAIRE CAVE SEMINAIRE",
    "HDLP SEMINAIRE"
);

importerFeuille(
    "INVENTAIRE RCLP CAVE ALCOOL",
    "RCLP ALCOOL"
);

importerFeuille(
    "INVENTAIRE RCLP CAVE SOFT",
    "RCLP SOFT"
);

importerFeuille(
    "INVENTAIRE RCLP CAVE VIN",
    "RCLP VIN"
);

        save();
mettreAJourSuggestions();
     changerSite("DASHBOARD");

        alert("Import terminé");

    };

       reader.readAsArrayBuffer(file);

}
  function renderVentesBoutique(){

    const ventes =
    JSON.parse(
        localStorage.getItem(
            "ventesBoutique"
        )
    ) || [];

    let html = `

    <div class="card">

    <h2>📈 Ventes Boutique</h2>

    Date début

    <br><br>

    <input
    type="date"
    id="dateDebutVente">

    <br><br>

    Date fin

    <br><br>

    <input
    type="date"
    id="dateFinVente">

    <br><br>

    <button
    onclick="calculerStatsBoutique()">

    📊 Afficher

    </button>

    </div>

   <div id="resultatStatsBoutique"></div>

<div class="card">

<h2>📈 Evolution des ventes</h2>

<canvas id="graphVentes"></canvas>

</div>

    `;

    document.getElementById(
        "cards"
    ).innerHTML = html;

}
        function calculerStatsBoutique(){

  let ventes = [];

Object.keys(stock).forEach(categorie => {

    stock[categorie].forEach(article => {

        (article.mouvements || []).forEach(m => {

            if(m.origine === "VENTE BOUTIQUE"){

                ventes.push({

                    article: article.article,

                    code: article.code,

                    quantite: Number(m.quantite || 0),

                    date: m.date

                });

            }

        });

    });

});

            const ventesJour = {};
            
    const debut =
    document.getElementById(
        "dateDebutVente"
    ).value;

    const fin =
    document.getElementById(
        "dateFinVente"
    ).value;

    let total = 0;

    const articles = {};
const categoriesVentes = {};

    ventes.forEach(v => {

        let dateVente = "";

        if(
            String(v.date)
            .includes("/")
        ){

            const p =
            v.date
            .split(" ")[0]
            .split("/");

            dateVente =
            p[2] + "-" +
            p[1].padStart(2,"0") + "-" +
            p[0].padStart(2,"0");

        }
        else{

            dateVente =
            String(v.date)
            .substring(0,10);

        }

        if(
            debut &&
            dateVente < debut
        ){
            return;
        }

        if(
            fin &&
            dateVente > fin
        ){
            return;
        }

        total += Number(
            v.quantite || 0
        );
if(!ventesJour[dateVente]){

    ventesJour[dateVente] = 0;

}

ventesJour[dateVente] +=
Number(v.quantite || 0);
        if(
            !articles[v.article]
        ){

            articles[v.article] = 0;

        }

        articles[v.article] +=
        Number(v.quantite || 0);
let categorieArticle = "";

Object.values(stock)
.flat()
.forEach(a => {

    if(String(a.code) === String(v.code)){

        categorieArticle =
        a.categorie || "Sans catégorie";

    }

});

if(!categoriesVentes[categorieArticle]){

    categoriesVentes[categorieArticle] = 0;

}

categoriesVentes[categorieArticle] +=
Number(v.quantite || 0);
    });

    let top =
    Object.entries(articles)

    .sort(
        (a,b)=>b[1]-a[1]
    )

    .slice(0,35);

    let html = `

    <div class="card">

    <h2>📊 Résultat</h2>

    Quantité vendue :

    <b>${total}</b>

    <br><br>

    <h3>🏆 Top ventes</h3>

    `;

  top.forEach(t => {

    const pourcentage =

    total > 0

    ? ((t[1] / total) * 100)
      .toFixed(1)

    : 0;

    html += `

    ${t[0]}
    :

    <b>${t[1]}</b>

    (${pourcentage}%)

    <br>

    `;

});

    html += "</div>";

    document.getElementById(
        "resultatStatsBoutique"
    ).innerHTML =
    html;
const labels =
Object.keys(categoriesVentes);

const data =
Object.values(categoriesVentes);

const canvas =
document.getElementById(
    "graphVentes"
);

if(canvas){

    const ancien =
    Chart.getChart(canvas);

    if(ancien){

        ancien.destroy();

    }

    new Chart(canvas,{

        type:"bar",

        data:{

            labels: labels,

            datasets:[{

                label:"Quantités vendues",

                data:data,

                backgroundColor:[
                    "#1976d2",
                    "#ff9800",
                    "#28a745",
                    "#e91e63",
                    "#9c27b0",
                    "#795548",
                    "#607d8b"
                ]

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{
                    display:false
                }

            },

            scales:{

                y:{
                    beginAtZero:true
                }

            }

        }

    });

}

}
mettreAJourSuggestions();

changerSite("DASHBOARD");changerSite("DASHBOARD");
