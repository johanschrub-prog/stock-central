const STORAGE_KEY = "StockCentral";
let siteActif = "DASHBOARD";
let stock =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || {};



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
 function voirMouvements(id){

    const article =
    (stock[categorieActive] || [])
    .find(a => a.id === id);

    if(!article) return;

    if(
        !article.mouvements ||
        article.mouvements.length === 0
    ){
        alert("Aucun mouvement");
        return;
    }

    alert(
        article.mouvements
        .map(m =>

            `${m.date}
${m.type}
${m.quantite}
${m.origine}`

        )
        .join("\n\n")
    );

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
`;

let html = "";

if(siteActif !== "DASHBOARD"){

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
        style="${style}"
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

    categorieActive = "HDLP MINI BAR";

}
else if(site === "RCLP"){

    categorieActive = "RCLP ALCOOL";

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

function render(){

const liste =
stock[categorieActive] || [];

const recherche =
document.getElementById("search")
?.value
?.toLowerCase() || "";

let html = "";
if(categorieActive === "DASHBOARD"){

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

 document.getElementById("cards").innerHTML ="";

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

`;
renderOnglets();
return;

}
liste
.filter(a=>

(a.article||"")
.toLowerCase()
.includes(recherche)

||

(a.code||"")
.toString()
.toLowerCase()
.includes(recherche)

)
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

<br><br>

Stock :
<input
type="number"
value="${a.stock||0}"
onchange="
stock['${categorieActive}']
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
value="${a.prix||0}"

onchange="
stock['${categorieActive}']
.find(x=>x.id==='${a.id}')
.prix=Number(this.value);

save();
render();
"
>

<br>

<div class="valeur">

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

    id:
    ancien?.id ||
    crypto.randomUUID(),

    code: code,

    article:
    row.ARTICLE || "",

    stock:
    ancien?.stock || 0,

    prix:
    ancien?.prix || 0,

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

     changerSite("DASHBOARD");

        alert("Import terminé");

    };

       reader.readAsArrayBuffer(file);

}
changerSite("DASHBOARD");
