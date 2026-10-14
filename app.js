const STORAGE_KEY = "StockCentral";

let stock =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || {};

let siteActif = "HDLP";

let categorieActive = "HDLP MINI BAR";

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

function renderOnglets(){

document.getElementById(
"ongletsPrincipaux"
).innerHTML = `

<button
class="tab ${siteActif==='HDLP'?'active':''}"
onclick="changerSite('HDLP')">
🏨 STOCK HDLP
</button>

<button
class="tab ${siteActif==='RCLP'?'active':''}"
onclick="changerSite('RCLP')">
🍴 STOCK RCLP
</button>
`;

let html = "";

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

document.getElementById(
"sousOnglets"
).innerHTML = html;

}


function changerSite(site){

siteActif = site;

categorieActive =
categories[site][0];

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
">


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
">

<br>

<div class="valeur">

Valeur :
${valeur.toFixed(2)} €

</div>

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

renderOnglets();

render();
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

                stock[categorie].push({

                    id: crypto.randomUUID(),

                    code:
                    row.NA ||
                    row.CODE ||
                    "",

                    article:
                    row.ARTICLE ||
                    "",

                    stock: 0,

                    prix: 0

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

        render();

        alert("Import terminé");

    };

    reader.readAsArrayBuffer(file);

}
