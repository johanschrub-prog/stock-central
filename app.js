const STORAGE_KEY = "StockCentral";

let stock =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || {};

let siteActif = "HDLP";

let categorieActive = "CAVE MINI BAR";

const categories = {

HDLP:[
"CAVE MINI BAR",
"CAVE SOFT",
"CAVE BAR",
"CAVE SEMINAIRE"
],

RCLP:[
"CAVE ALCOOL",
"CAVE SOFT",
"CAVE VIN"
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

html += `
<button
class="tab ${categorieActive===c?'active':''}"
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
a=this.value
">

<br><br>

Prix :
${Number(a.prix||0).toFixed(2)} €

<br>

<div class="valeur">

Valeur :
${valeur.toFixed(2)} €

</div>

</div>

`;

});

document.getElementById(
"cards"
).innerHTML = html;

}

renderOnglets();

render();
