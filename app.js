// alert(
//     stock["HDLP BAR"]?.length || 0
// );

// alert(
//     localStorage.getItem("inventaireHDLP")
//         .substring(0,300)
// );
const STORAGE_KEY = "StockCentral";
let siteActif = "DASHBOARD";
let stock =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || {};
let articleTransfertActif = null;
let fournisseurs = JSON.parse(
    localStorage.getItem("Fournisseurs")
) || [];
let analyseOuverte =
localStorage.getItem(
    "analyseOuverte"
) === "1";
let receptionCode = "";
let receptionId = "";
let ongletRemontees = "HDLP";
let validationOuverte = null;
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
    const stockOptimise = {};

    Object.keys(stock).forEach(categorie => {
        stockOptimise[categorie] = stock[categorie].map(article => ({
            ...article,
            // On garde uniquement les 3 mouvements les plus récents pour alléger
            mouvements: (article.mouvements || []).slice(-3) 
        }));
    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stockOptimise)
    );
}
function analyserStockageNavigateur() {
    let tailleTotaleApp = 0;
    let tailleGlobalLocalStorage = 0;
    let detailsParCle = "";

    // Parcourt tout le localStorage pour calculer les tailles
    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        const valeur = localStorage.getItem(cle) || "";
        // Chaque caractère en JavaScript (UTF-16) pèse 2 octets
        const tailleEnOctets = (cle.length + valeur.length) * 2;
        
        tailleGlobalLocalStorage += tailleEnOctets;
        
        // On isole les clés principales de votre appli pour le détail
        if (["StockCentral", "Fournisseurs", "inventaireHDLP", "remonteeHDLP", "remonteeRCLP"].includes(cle)) {
            tailleTotaleApp += tailleEnOctets;
            detailsParCle += `• ${cle} : ${(tailleEnOctets / (1024 * 1024)).toFixed(2)} Mo\n`;
        }
    }

    // La limite standard du localStorage est généralement de 5 Mo (5 * 1024 * 1024 octets)
    const limiteEstimeeOctets = 5 * 1024 * 1024;
    const pourcentageUtilise = ((tailleGlobalLocalStorage / limiteEstimeeOctets) * 100).toFixed(1);

    // Affichage du rapport complet
    let rapport = `📊 RAPPORT DE STOCKAGE LOCAL\n\n`;
    rapport += `Total global utilisé : ${(tailleGlobalLocalStorage / (1024 * 1024)).toFixed(2)} Mo / ~5 Mo (${pourcentageUtilise}%)\n\n`;
    rapport += `Détail de vos clés principales :\n${detailsParCle}`;

    alert(rapport);
}

function modifierFournisseur(id, champ, valeur){

    const fournisseur = fournisseurs.find(
        f => String(f.id) === String(id)
    );

    if(!fournisseur) return;

    valeur = String(valeur).trim();

    if(champ === "email"){
        if(
            valeur !== "" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur)
        ){
            alert("Adresse email invalide");
            return;
        }
    }

    if(
        champ === "portable" ||
        champ === "bureau"
    ){
        valeur = valeur.replace(
            /[^0-9+ ]/g,
            ""
        );
    }

    if(champ === "nom"){

        const existe = fournisseurs.some(
            f =>
                String(f.id) !== String(id) &&
                String(f.nom || "")
                    .trim()
                    .toUpperCase() ===
                valeur.toUpperCase()
        );

        if(existe){
            alert("Ce fournisseur existe déjà");
            return;
        }
    }

    fournisseur[champ] = valeur;

    if(champ === "representant" && valeur){

        const fournisseurExistant = fournisseurs.find(
            f =>
                String(f.id) !== String(id) &&
                String(f.representant || "")
                    .trim()
                    .toUpperCase() ===
                valeur.toUpperCase() &&
                (
                    f.portable ||
                    f.email ||
                    f.bureau
                )
        );

        if(fournisseurExistant){

            fournisseur.portable =
                fournisseurExistant.portable || "";

            fournisseur.email =
                fournisseurExistant.email || "";

            fournisseur.bureau =
                fournisseurExistant.bureau || "";
        }
    }

    saveFournisseurs();
    afficherFournisseurs();
}
function toggleAnalyse(){

    analyseOuverte = !analyseOuverte;

    localStorage.setItem(
        "analyseOuverte",
        analyseOuverte ? "1" : "0"
    );

    render();

}
function changerOngletRemontees(type){

    ongletRemontees = type;

    render();

}
function changerSite(site){

    siteActif = site;

    if(site === "APPLICATIONS"){
        categorieActive = "APPLICATIONS";
    }
    else if(site === "HDLP"){
        categorieActive = "TOUS_HDLP";
    }
    else if(site === "RCLP"){
        categorieActive = "TOUS_RCLP";
    }
    else if(site === "VENTES"){
        categorieActive = "VENTES";
    }
    else if(site === "ARTICLES"){
        categorieActive = "ARTICLES";
    }
    else if(site === "FOURNISSEURS"){
        categorieActive = "FOURNISSEURS";
    }
    else if(site === "REMONTEES_EFFECTUEES"){
        categorieActive = "REMONTEES_EFFECTUEES";
    }
    else{
        categorieActive = "DASHBOARD";
    }

    renderOnglets();
    render();

}
function saveFournisseurs(){

    localStorage.setItem(
        "Fournisseurs",
        JSON.stringify(fournisseurs)
    );

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
alert(Object.keys(stock));
    const fichier = event.target.files[0];

    if(!fichier) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const workbook = XLSX.read(
            e.target.result,
            {type:"array"}
        );
console.log("Feuilles trouvées :", workbook.SheetNames);

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
function inspecterInventaireHDLP(){

    const data = localStorage.getItem("inventaireHDLP");

    alert(
        "Taille : " +
        (data.length / 1024).toFixed(2) +
        " Ko"
    );

    const json = JSON.parse(data);

    alert(
        "Type : " +
        (Array.isArray(json) ? "tableau" : typeof json)
    );

    alert(
        "Nombre d'éléments : " +
        (json.length || Object.keys(json).length)
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

<button onclick="analyserStockage()">
📦 Analyser stockage
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
<button onclick="analyserStockageNavigateur()">💾 Voir l'espace disque</button>
<div style="width:100%;display:flex;gap:10px;">

<button
class="tab"
style="${
siteActif==='STAT_HDLP'
? 'background:#1976d2;color:white;'
: ''
}"
onclick="changerSite('STAT_HDLP')">

📊 REMONTÉES HDLP

</button>

<button
class="tab"
style="${
siteActif==='STAT_RCLP'
? 'background:#ff9800;color:white;'
: ''
}"
onclick="changerSite('STAT_RCLP')">

📊 REMONTÉES RCLP

</button>

</div>
</div>

<div style="width:100%;display:flex;gap:10px;">

<button
class="tab"
style="
${
siteActif==='APPLICATIONS'
? 'background:#673ab7;color:white;'
: ''
}"
onclick="changerSite('APPLICATIONS')">
📱 APPLICATIONS
</button>

<button
class="tab"
style="
${
siteActif==='REMONTEES_EFFECTUEES'
? 'background:#4caf50;color:white;'
: ''
}"
onclick="changerSite('REMONTEES_EFFECTUEES')">
🍾 REMONTÉES EFFECTUÉES
</button>

</div>

<div style="width:100%;display:flex;gap:10px;">

<button
class="tab"
style="
${
siteActif==='ARTICLES'
? 'background:#795548;color:white;'
: ''
}"
onclick="changerSite('ARTICLES')">
📦 ARTICLES
</button>

<button
class="tab"
style="
${
siteActif==='FOURNISSEURS'
? 'background:#009688;color:white;'
: ''
}"
onclick="changerSite('FOURNISSEURS')">
🚚 FOURNISSEURS
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
function ouvrirApplications(){

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <h2>📱 Applications</h2>

        <button
        style="width:100%;height:70px;"
        onclick="ouvrirRemonteeHDLP()">

        📤 Remontées HDLP

        </button>

        <br><br>

        <button
        style="width:100%;height:70px;"
        onclick="ouvrirRemonteeRCLP()">

        📤 Remontées RCLP

        </button>

        <br><br>

        <button
        style="width:100%;height:70px;"
      onclick="ouvrirSaisieVentesBoutique()">

        🛍️ Ventes Boutique

        </button>

        <br><br>

        <button
        style="width:100%;height:70px;"
        onclick="ouvrirCommandeHDLP()">

        🚚 Commandes HDLP

        </button>

        <br><br>

        <button
        style="width:100%;height:70px;"
        onclick="ouvrirCommandeRCLP()">

        🚚 Commandes RCLP

        </button>

    </div>

    `;

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

<button
style="background:#dc3545;margin-left:10px;"
onclick="annulerCommandeHDLP()">

❌ Annuler réception

</button>
    </div>

    `;

    document
    .getElementById("cards")
    .innerHTML =
    html;

}
function annulerCommandeHDLP(){

    if(
        !confirm(
            "Annuler toutes les réceptions HDLP en attente ?"
        )
    ){
        return;
    }

    localStorage.removeItem(
        "commandeHDLP"
    );

    changerSite(
        "DASHBOARD"
    );

    alert(
        "Réceptions HDLP annulées ✅"
    );

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

      let article =
stock[cave]
?.find(a =>
    String(a.code) === String(c.code)
);

if(!article){

    article = {

        id: crypto.randomUUID(),

        code: c.code,

        article: c.article,

        categorie: "",

        stock: 0,

        prix: 0,

        fournisseur: c.fournisseur || "",

        codeFournisseur: "",

        colisage: Number(c.conditionnement || 1),

        mouvements: []

    };

    stock[cave].push(article);

}

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

<button
style="background:#dc3545;margin-left:10px;"
onclick="annulerCommandeRCLP()">

❌ Annuler réception

</button>

    </div>

    `;

    document
    .getElementById("cards")
    .innerHTML =
    html;

}
function annulerCommandeRCLP(){

    if(
        !confirm(
            "Annuler toutes les réceptions RCLP en attente ?"
        )
    ){
        return;
    }

    localStorage.removeItem(
        "commandeRCLP"
    );

    changerSite(
        "DASHBOARD"
    );

    alert(
        "Réceptions RCLP annulées ✅"
    );

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

      let article =
stock[cave]
?.find(a =>
    String(a.code) === String(c.code)
);

if(!article){

    article = {

        id: crypto.randomUUID(),

        code: c.code,

        article: c.article,

        categorie: "",

        stock: 0,

        prix: 0,

        fournisseur: c.fournisseur || "",

        codeFournisseur: "",

        colisage: Number(c.conditionnement || 1),

        mouvements: []

    };

    stock[cave].push(article);

}

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

  
   if(categorieActive === "APPLICATIONS"){
    ouvrirApplications();
    return;
} 
    if(categorieActive === "ARTICLES"){

    renderArticles();

    return;

}
if(categorieActive === "FOURNISSEURS"){

    renderFournisseurs();

    return;

}    
 if(categorieActive === "REMONTEES_EFFECTUEES"){

    let remontees =
    getRemonteesEffectuees();

    if(ongletRemontees === "HDLP"){

        remontees = remontees.filter(r =>
            r.type === "HDLP" ||
            r.type === "REDESCENTE HDLP"
        );

    }

    if(ongletRemontees === "RCLP"){

        remontees = remontees.filter(r =>
            r.type === "RCLP" ||
            r.type === "REDESCENTE RCLP"
        );

    }

    if(ongletRemontees === "BOUTIQUE"){

        remontees = remontees.filter(r =>
            r.type === "BOUTIQUE" ||
            r.type === "REDESCENTE BOUTIQUE"
        );

    }

    let html = `

    <div class="card">

        <h2>🍾 Remontées effectuées</h2>

        <div style="
            display:flex;
            gap:10px;
            margin-bottom:15px;
        ">

           <button
class="tab"
style="
${
ongletRemontees === 'HDLP'
? 'background:#1976d2;color:white;'
: ''
}
"
onclick="
ongletRemontees='HDLP';
render();
">
🏨 HDLP
</button>

<button
class="tab"
style="
${
ongletRemontees === 'RCLP'
? 'background:#ff9800;color:white;'
: ''
}
"
onclick="
ongletRemontees='RCLP';
render();
">
🍴 RCLP
</button>

<button
class="tab"
style="
${
ongletRemontees === 'BOUTIQUE'
? 'background:#e91e63;color:white;'
: ''
}
"
onclick="
ongletRemontees='BOUTIQUE';
render();
">
🛍️ Boutique
</button>

        </div>

        <input
        type="date"
        id="filtreDateRemontees"
        onchange="render()"
        style="
        width:100%;
        padding:10px;
        "
        >
<br><br>

<input
type="text"
id="filtreArticleRemontees"
placeholder="🔎 Code ou article"
onchange="render()"
style="
width:100%;
padding:10px;
"
>
    </div>
    `;

    const dateRecherche =
    document.getElementById(
        "filtreDateRemontees"
    )?.value || "";
const rechercheArticle =
(
    document.getElementById(
        "filtreArticleRemontees"
    )?.value || ""
)
.toLowerCase();

    const validations = {};

    remontees.forEach(r => {

        const id =
        r.validationId ||
        "sansValidation";

        if(dateRecherche){

            const dateLigne =
            String(r.date || "")
            .substring(0,10);

            if(
                dateLigne !==
                dateRecherche
            ){
                return;
            }

        }
if(rechercheArticle){

    const trouve =
    String(
        r.code || ""
    )
    .toLowerCase()
    .includes(
        rechercheArticle
    )

    ||

    String(
        r.designation || ""
    )
    .toLowerCase()
    .includes(
        rechercheArticle
    );

    if(!trouve){
        return;
    }

}

        if(!validations[id]){

            validations[id] = {

                date: r.date,

                dateHeure:
                r.dateHeure,

                lignes: []

            };

        }

        validations[id]
        .lignes
        .push(r);

    });

    Object.entries(validations)
    .reverse()
    .forEach(([id, validation]) => {

        const heure =
        validation.dateHeure
        ?
        new Date(
            validation.dateHeure
        ).toLocaleTimeString(
            "fr-FR",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        )
        :
        "--:--";

        const total =
        validation.lignes.reduce(
            (s,r) =>
            s + Number(r.quantite || 0),
            0
        );

        html += `

        <div class="card">

            <button
            style="
                width:100%;
                text-align:left;
                padding:15px;
                font-size:18px;
                font-weight:bold;
            "
            onclick="
            validationOuverte =
            validationOuverte === '${id}'
            ? null
            : '${id}';
            render();
            ">

            📦 Validation

            ${new Date(
                validation.date
            ).toLocaleDateString()}

            - ${heure}

            <br><br>

            ${validation.lignes.length}
            article(s)

            -

            ${total}
            quantité(s)

            </button>

        `;

      if(validationOuverte === id){

    html += `

    <div style="margin-top:10px;">

        <button
        style="
        background:#dc3545;
        color:white;
        "
        onclick="
        event.stopPropagation();
        supprimerValidation('${id}');
        ">
        🗑️ Supprimer la validation
        </button>

    </div>

    `;

    validation.lignes.forEach(ligne => {

        html += `

        <div style="
            border-top:1px solid #ddd;
            padding:10px;
            margin-top:5px;
        ">

            <b>${ligne.designation}</b>

            <br>

            Code :
            ${ligne.code}

            <br><br>

           <select
id="cave_${ligne.id}"
style="width:100%;"
>

<option value="HDLP SOFT"
${ligne.cave === "HDLP SOFT" ? "selected" : ""}>
HDLP SOFT
</option>

<option value="HDLP BAR"
${ligne.cave === "HDLP BAR" ? "selected" : ""}>
HDLP BAR
</option>

<option value="HDLP MINI BAR"
${ligne.cave === "HDLP MINI BAR" ? "selected" : ""}>
HDLP MINI BAR
</option>

<option value="HDLP SEMINAIRE"
${ligne.cave === "HDLP SEMINAIRE" ? "selected" : ""}>
HDLP SEMINAIRE
</option>

<option value="RCLP SOFT"
${ligne.cave === "RCLP SOFT" ? "selected" : ""}>
RCLP SOFT
</option>

<option value="RCLP VIN"
${ligne.cave === "RCLP VIN" ? "selected" : ""}>
RCLP VIN
</option>

<option value="RCLP ALCOOL"
${ligne.cave === "RCLP ALCOOL" ? "selected" : ""}>
RCLP ALCOOL
</option>

</select>

            <br><br>

            Type :
            ${ligne.type}

            <br><br>

            Quantité :

            <input
            type="number"
            id="quantite_${ligne.id}"
            value="${ligne.quantite}"
            style="width:100%;"
            >

            <br><br>

            <button
            onclick="
            modifierRemontee(
            '${ligne.id}'
            )">
            💾 Enregistrer
            </button>

            <button
            style="
            background:#dc3545;
            color:white;
            margin-left:5px;
            "
            onclick="
            supprimerRemontee(
            '${ligne.id}'
            )">
            🗑️ Supprimer
            </button>

        </div>

        `;

    });

}

        html += `
        </div>
        `;

    });

    document.getElementById(
        "cards"
    ).innerHTML = html;

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
const boutonMaj = `
<div class="card">
<button
onclick="mettreAJourStockJson()"
style="
width:100%;
height:70px;
background:#28a745;
color:white;
font-size:22px;
font-weight:bold;
border:none;
border-radius:8px;
">
🔄 METTRE À JOUR STOCK.JSON
</button>
</div>
`;
  document.getElementById("cards").innerHTML =
boutonMaj + html;


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
<div class="card">
<button
onclick="mettreAJourStockJson()"
style="
width:100%;
height:70px;
background:#28a745;
color:white;
font-size:22px;
font-weight:bold;
border:none;
border-radius:8px;
">
🔄 METTRE À JOUR STOCK.JSON
</button>
</div>

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
width:100px;
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

String(a.code || "")
.includes(valeurRecherche.trim())

||

(a.article || "")
.toLowerCase()
.includes(
    valeurRecherche
    .toLowerCase()
    .trim()
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
function supprimerValidation(validationId){

    if(
        !confirm(
            "Supprimer toute la validation ?"
        )
    ){
        return;
    }

    let remontees =
    getRemonteesEffectuees();

    remontees
    .filter(r =>

        r.validationId ===
        validationId

    )
    .forEach(ligne => {

        annulerImpactStock(
            ligne
        );

    });

    save();

    remontees =
    remontees.filter(r =>

        r.validationId !==
        validationId

    );

    saveRemonteesEffectuees(
        remontees
    );

    validationOuverte = null;

    render();

}
function estRedescente(type){

    return String(type)
    .startsWith("REDESCENTE");

}
function trouverArticleStock(
    cave,
    code
){

    return (
        stock[cave] || []
    ).find(a =>

        String(a.code) ===
        String(code)

    );

}
function annulerImpactStock(ligne){

    const articleStock =
    trouverArticleStock(
        ligne.caveOrigine || ligne.cave,
        ligne.code
    );

    if(!articleStock){
        return;
    }

    if(
        estRedescente(
            ligne.type
        )
    ){

        articleStock.stock =
        Number(articleStock.stock || 0)
        - Number(
            ligne.quantiteOrigine ??
            ligne.quantite ??
            0
        );

    }else{

        articleStock.stock =
        Number(articleStock.stock || 0)
        + Number(
            ligne.quantiteOrigine ??
            ligne.quantite ??
            0
        );

    }

}
function appliquerImpactStock(ligne){

    const articleStock =
    trouverArticleStock(
        ligne.cave,
        ligne.code
    );

    if(!articleStock){
        return;
    }

    if(
        estRedescente(
            ligne.type
        )
    ){

        articleStock.stock =
        Number(articleStock.stock || 0)
        + Number(
            ligne.quantite || 0
        );

    }else{

        articleStock.stock =
        Number(articleStock.stock || 0)
        - Number(
            ligne.quantite || 0
        );

    }

}

function supprimerRemontee(id){

    if(
        !confirm(
            "Supprimer cet article ?"
        )
    ){
        return;
    }

    let remontees =
    getRemonteesEffectuees();

    const ligne =
    remontees.find(
        r => r.id === id
    );

    if(ligne){

        annulerImpactStock(
            ligne
        );

        save();

    }

    remontees =
    remontees.filter(
        r => r.id !== id
    );

    saveRemonteesEffectuees(
        remontees
    );

    render();

}

function modifierRemontee(id){

    const remontees =
    getRemonteesEffectuees();

    const ligne =
    remontees.find(
        r => r.id === id
    );

    if(!ligne){
        return;
    }

    annulerImpactStock(
        ligne
    );

    ligne.cave =
    document.getElementById(
        "cave_" + id
    ).value;

    ligne.quantite =
    Number(
        document.getElementById(
            "quantite_" + id
        ).value || 0
    );

    appliquerImpactStock(
        ligne
    );

    ligne.caveOrigine =
    ligne.cave;

    ligne.quantiteOrigine =
    ligne.quantite;

    save();

    saveRemonteesEffectuees(
        remontees
    );

    alert(
        "Modification enregistrée"
    );

    render();

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

    alert("DEBUT IMPORT");

    const workbook = XLSX.read(
        e.target.result,
        { type: "array" }
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

        function importerFeuille(nomFeuille, categorie){

            const sheet =
                workbook.Sheets[nomFeuille];

            if(!sheet){
                console.log(
                    "Feuille introuvable :",
                    nomFeuille
                );
                return;
            }

            const rows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    { defval: "" }
                );

            rows.forEach(row => {

                const code =
                    row.NA ||
                    row.CODE ||
                    "";

                const ancien =
                    ancienStock[categorie]
                    ?.find(a =>
                        String(a.code) ===
                        String(code)
                    );

                const colisage =
                    Number(
                        ancien?.colisage || 1
                    );

                const stockInventaire =
                    (
                        Number(row.PAQUET || 0)
                        * colisage
                    )
                    +
                    Number(row.PIECE || 0);

                stock[categorie].push({

                    id:
                        ancien?.id ||
                        crypto.randomUUID(),

                    code: code,

                    article:
                        ancien?.article ||
                        row.ARTICLE ||
                        "",

                    categorie:
                        ancien?.categorie || "",

                    stock: stockInventaire,

                    prix:
                        ancien?.prix || 0,

                    fournisseur:
                        ancien?.fournisseur || "",

                    codeFournisseur:
                        ancien?.codeFournisseur || "",

                    colisage: colisage,

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
alert("AVANT SAVE");
      
save();
localStorage.removeItem("inventaireHDLP");
alert("APRES SAVE");
        alert(
            "Vérification stock code 60 : " +
            (
                stock["HDLP BAR"]
                ?.find(
                    a => String(a.code) === "60"
                )?.stock || "introuvable"
            )
        );

        mettreAJourSuggestions();
        render();

        alert("✅ Inventaire importé");

    };

    reader.readAsArrayBuffer(file);

}

function renderArticles(){

    const fournisseurs = [
        ...new Set(
            Object.values(stock)
            .flat()
            .map(a => a.fournisseur)
            .filter(f => f)
        )
    ].sort();

    const categories = [
        ...new Set(
            Object.values(stock)
            .flat()
            .map(a => a.categorie)
            .filter(c => c)
        )
    ].sort();

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <h2>📦 Gestion des articles</h2>

        <input
        id="rechercheArticleMaster"
        placeholder="Code ou article"
        oninput="afficherArticlesMaster()">

        <br><br>

        <button onclick="nouvelArticle()">
        ➕ Nouvel article
        </button>

        <br><br>

        <div id="listeArticlesMaster"></div>

    </div>

    `;

    afficherArticlesMaster();

}
function afficherArticlesMaster(){

    const recherche =
    document.getElementById(
        "rechercheArticleMaster"
    )?.value
    ?.toLowerCase() || "";

    const dejaVu = new Set();

    let html = "";

    Object.values(stock)
    .flat()
    .forEach(article => {

        if(dejaVu.has(article.code)){
            return;
        }

        dejaVu.add(article.code);

        if(
            recherche &&
            !String(article.code)
            .includes(recherche) &&
            !String(article.article)
            .toLowerCase()
            .includes(recherche)
        ){
            return;
        }

        html += `

        <div class="card">

        <b>${article.article}</b>

        <br><br>

        Code

        <input
        value="${article.code}"
        onchange="
       modifierArticleMaster(
'${article.id}',
'code',
this.value
)">

        <br><br>

        Article

        <input
        value="${article.article}"
        onchange="
        modifierArticleMaster(
      '${article.id}',
        'article',
        this.value
        )">

        <br><br>

        Fournisseur

        <input
        list="listeFournisseursMaster"
        value="${article.fournisseur || ''}"
        onchange="
       modifierArticleMaster(
'${article.id}',
'fournisseur',
this.value
)">

        <br><br>

        Code fournisseur

        <input
        value="${article.codeFournisseur || ''}"
        onchange="
        modifierArticleMaster(
      '${article.id}',
        'codeFournisseur',
        this.value
        )">

        <br><br>

        Catégorie

        <input
        list="listeCategoriesMaster"
        value="${article.categorie || ''}"
        onchange="
        modifierArticleMaster(
      '${article.id}',
        'categorie',
        this.value
        )">

        <br><br>

        Prix

        <input
        type="number"
        step="0.01"
        value="${article.prix || 0}"
        onchange="
        modifierArticleMaster(
      '${article.id}',
        'prix',
        this.value
        )">

        <br><br>

        Colisage

        <input
        type="number"
        value="${article.colisage || 1}"
        onchange="
        modifierArticleMaster(
      '${article.id}',
        'colisage',
        this.value
        )">

        </div>

        `;
    });

    html += `

    <datalist id="listeFournisseursMaster">

    ${
        [...new Set(
            Object.values(stock)
            .flat()
            .map(a => a.fournisseur)
            .filter(f => f)
        )]
        .sort()
        .map(f=>
            `<option value="${f}">`
        )
        .join("")
    }

    </datalist>

    <datalist id="listeCategoriesMaster">

    ${
        [...new Set(
            Object.values(stock)
            .flat()
            .map(a => a.categorie)
            .filter(c => c)
        )]
        .sort()
        .map(c=>
            `<option value="${c}">`
        )
        .join("")
    }

    </datalist>
    `;

    document.getElementById(
        "listeArticlesMaster"
    ).innerHTML = html;

}
function modifierArticleMaster(
    id,
    champ,
    valeur
){

    Object.keys(stock).forEach(categorie => {

        stock[categorie].forEach(article => {

            if(article.id === id){

                article[champ] =
                champ === "prix"
                || champ === "colisage"
                ? Number(valeur)
                : valeur;

            }

        });

    });

    save();

    afficherArticlesMaster();

}
function nouvelArticle(){

    const code =
    prompt("Code article");

    if(!code) return;

    const article =
    prompt("Nom article");

    if(!article) return;

    Object.keys(stock).forEach(categorie => {
if(!stock[categorie]){
    console.error("Catégorie introuvable :", categorie);
    return;
}
  
        stock[categorie].push({

            id: crypto.randomUUID(),

            code: code,

            article: article,

            categorie: "",

            stock: 0,

            prix: 0,

            fournisseur: "",

            codeFournisseur: "",

            colisage: 1,

            mouvements: []

        });

    });

    save();

    afficherArticlesMaster();

}
function renderFournisseurs(){

    Object.values(stock)
    .flat()
    .forEach(article => {

        const nom = String(
            article.fournisseur || ""
        ).trim();

        if(
            nom &&
            !fournisseurs.some(
                f =>
                    String(f.nom)
                        .trim()
                        .toUpperCase() ===
                    nom.toUpperCase()
            )
        ){

            fournisseurs.push({

                id: crypto.randomUUID(),

                nom: nom,

                numeroClient: "",

                representant: "",

                portable: "",

                bureau: "",

                email: ""

            });

        }

    });

    saveFournisseurs();

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <h2>🚚 Gestion des fournisseurs</h2>

        <input
        id="rechercheFournisseur"
        placeholder="Nom fournisseur ou représentant"
        oninput="afficherFournisseurs()">

        <br><br>

        <button onclick="nouveauFournisseur()">
        ➕ Nouveau fournisseur
        </button>

        <br><br>

        <div id="listeFournisseurs"></div>

    </div>

    `;

    afficherFournisseurs();

}
function analyserStockage() {

    const donnees = [];

    Object.keys(localStorage).forEach(cle => {

        const taille =
            (localStorage.getItem(cle) || "").length;

        donnees.push({
            cle,
            taille
        });

    });

    donnees.sort(
        (a, b) => b.taille - a.taille
    );

    let rapport = "📦 TOP STOCKAGE\n\n";
    let total = 0;

    donnees.forEach(item => {

        total += item.taille;

        rapport +=
            item.cle +
            " : " +
            (item.taille / 1024).toFixed(2) +
            " Ko\n";

    });

    rapport +=
        "\nTOTAL : " +
        (total / 1024).toFixed(2) +
        " Ko";

    alert(rapport);
}
function nouveauFournisseur(){
    fournisseurs.push({
        id: Date.now().toString(),
        nom: "",
        numeroClient: "",
        representant: "",
        portable: "",
        bureau: "",
        email: ""
    });

    saveFournisseurs();
    afficherFournisseurs();
}
function afficherFournisseurs(){

    const recherche =
    document.getElementById(
        "rechercheFournisseur"
    )?.value?.toLowerCase() || "";

    let html = "";

    fournisseurs.forEach(f => {

        if(
            recherche &&
            !String(f.nom || "")
                .toLowerCase()
                .includes(recherche)
            &&
            !String(f.representant || "")
                .toLowerCase()
                .includes(recherche)
        ){
            return;
        }
if(f.representant === "DUPONT"){   // mettez le nom testé

    alert(
        JSON.stringify(f,null,2)
    );

}
        html += `

        <div class="card">

        Nom fournisseur

        <input
        value="${f.nom || ''}"
       onchange="
modifierFournisseur(
'${f.id}',
'nom',
this.value
)">

        <br><br>

        Numéro client

        <input
        value="${f.numeroClient || ''}"
  onchange="
modifierFournisseur(
'${f.id}',
'numeroClient',
this.value
)">

        <br><br>

        Nom du représentant

<input
    value="${f.representant || ''}"
    onchange="
        modifierFournisseur(
            '${f.id}',
            'representant',
            this.value
        )
    ">
<br><br>
Portable

<br>

<input
type="tel"
value="${f.portable || ''}"
onchange="
modifierFournisseur(
'${f.id}',
'portable',
this.value
)"
style="width:100%;"
>

<br><br>

<button
onclick="location.href='tel:${f.portable || ''}'"
style="
width:48%;
height:55px;
background:#28a745;
color:white;
font-weight:bold;
border:none;
border-radius:8px;
"
>
APPELER
</button>

<button
onclick="location.href='sms:${f.portable || ''}'"
style="
width:48%;
height:55px;
background:#2196f3;
color:white;
font-weight:bold;
border:none;
border-radius:8px;
float:right;
"
>
SMS
</button>



        <br><br>

        Téléphone bureau

     <input
type="tel"
inputmode="numeric"
value="${f.bureau || ''}"
onchange="
modifierFournisseur(
'${f.id}',
'bureau',
this.value
)">

        <br><br>

Adresse mail

<br>

<input
type="email"
value="${f.email || ''}"
onchange="
modifierFournisseur(
'${f.id}',
'email',
this.value
)"
style="width:100%;"
>

<br><br>

<button
type="button"
onclick="location.href='mailto:${f.email || ''}'"
style="
width:100%;
height:55px;
background:#ff9800;
color:white;
font-size:18px;
font-weight:bold;
border:none;
border-radius:8px;
"
>
ENVOYER MAIL
</button>

<br><br>

<button
type="button"
style="
width:100%;
height:55px;
background:#dc3545;
color:white;
font-size:18px;
font-weight:bold;
border:none;
border-radius:8px;
"
onclick="supprimerFournisseur('${f.id}')"
>
SUPPRIMER LE FOURNISSEUR
</button>

</div>

        `;

    });

    document.getElementById(
        "listeFournisseurs"
    ).innerHTML = html;

}
           
function renderStatsRemontees(site){

document.getElementById("cards").innerHTML = `

<div class="card">

<h2>📊 Remontées ${site}</h2>

Date début

<br><br>

<input
type="date"
id="dateDebutRemontee">

<br><br>

Date fin

<br><br>

<input
type="date"
id="dateFinRemontee">

<br><br>

<button
onclick="calculerStatsRemontees('${site}')">

📊 Afficher

</button>

</div>

<div id="resultatStatsRemontee"></div>

<div class="card">

<h2>📈 Evolution des remontées</h2>

<button
onclick="ouvrirGraphiquePleinEcran('graphRemontees')"
style="
width:100%;
height:60px;
font-size:20px;
font-weight:bold;
margin-bottom:10px;
">
🔍 Plein écran
</button>

<canvas id="graphRemontees"></canvas>

</div>

`;

}
function calculerStatsRemontees(site){

let mouvements = [];

Object.keys(stock).forEach(categorie => {

    stock[categorie].forEach(article => {

        (article.mouvements || []).forEach(m => {

          if(
    String(m.origine || "")
    .includes("REMONTEE")
    &&
    String(m.origine || "")
    .includes(site)
){

                mouvements.push({

                    article: article.article,

                    code: article.code,

                    quantite: Number(m.quantite || 0),

                    date: m.date,

                    categorie: article.categorie || "Sans catégorie"

                });

            }

        });

    });

});

const debut =
document.getElementById(
    "dateDebutRemontee"
).value;

const fin =
document.getElementById(
    "dateFinRemontee"
).value;

const ventesJour = {};
const articles = {};
const categoriesStats = {};

let total = 0;

mouvements.forEach(v => {

    let dateVente = "";

    if(String(v.date).includes("/")){

        const p =
        v.date.split(" ")[0].split("/");

        dateVente =
        p[2] + "-" +
        p[1].padStart(2,"0") + "-" +
        p[0].padStart(2,"0");

    }else{

        dateVente =
        String(v.date).substring(0,10);

    }

    if(debut && dateVente < debut){
        return;
    }

    if(fin && dateVente > fin){
        return;
    }

    total += v.quantite;

    if(!articles[v.article]){
        articles[v.article] = 0;
    }

    articles[v.article] += v.quantite;

    if(!ventesJour[dateVente]){
        ventesJour[dateVente] = 0;
    }

    ventesJour[dateVente] += v.quantite;

    if(!categoriesStats[v.categorie]){
        categoriesStats[v.categorie] = 0;
    }

    categoriesStats[v.categorie] += v.quantite;

});

const top = Object.entries(articles)
.sort((a,b)=>b[1]-a[1])
.slice(0,35);

let html = `

<div class="card">

<h2>📊 Résultat</h2>

Quantité remontée :

<b>${total}</b>

<br><br>

<h3>🏆 Top remontées</h3>

`;

top.forEach(t=>{

const pourcentage =

total > 0
? ((t[1]/total)*100).toFixed(1)
: 0;

html += `

${t[0]} :

<b>${t[1]}</b>

(${pourcentage}%)

<br>

`;

});

html += "</div>";

document.getElementById(
"resultatStatsRemontee"
).innerHTML = html;

const canvas =
document.getElementById(
"graphRemontees"
);

if(canvas){

const ancien =
Chart.getChart(canvas);

if(ancien){
ancien.destroy();
}
canvas.height =
Math.max(
    500,
    Object.keys(categoriesStats).length * 50
);
new Chart(canvas,{

type:"bar",

data:{

labels:
Object.keys(categoriesStats),

datasets:[{

label:"Quantités remontées",

data:
Object.values(categoriesStats),

backgroundColor:[
"#1976d2",
"#ff9800",
"#28a745",
"#e91e63",
"#9c27b0",
"#795548"
]

}]

},
        options:{
    indexAxis:'y',
    responsive:false,
    maintainAspectRatio:true,

            layout:{
                padding:{
                    left:20
                }
            },

            plugins:{
                legend:{
                    display:false
                }
            },

            scales:{
                y:{
                    ticks:{
                        autoSkip:false,
                        font:{
                            size:16
                        }
                    }
                },
                x:{
                    beginAtZero:true,
                    ticks:{
                        maxRotation:0,
                        minRotation:0,
                        font:{
                            size:14
                        }
                    }
                }
            }
        }

    });
}
}
function ouvrirGraphiquePleinEcran(id){

    const canvas =
    document.getElementById(id);

    if(!canvas) return;

    const image =
    canvas.toDataURL("image/png");

    const fenetre =
    window.open("","Graphique");

    fenetre.document.write(`
        <html>
        <head>
            <title>Graphique</title>
        </head>
        <body style="
            margin:0;
            display:flex;
            justify-content:center;
            align-items:center;
            background:white;
        ">
            <img
            src="${image}"
            style="
                width:100%;
                height:auto;
            ">
        </body>
        </html>
    `);

}
function mettreAJourStockJson(){

    const blob = new Blob(
        [
            JSON.stringify(stock, null, 2)
        ],
        {
            type: "application/json"
        }
    );

    const lien =
    document.createElement("a");

    lien.href =
    URL.createObjectURL(blob);

    lien.download =
    "stock.json";

    lien.click();

}
function migrerRemontees(){

    const remontees =
    getRemonteesEffectuees();

    remontees.forEach(r => {

        if(!r.caveOrigine){

            r.caveOrigine = r.cave;

        }

        if(
            r.quantiteOrigine ===
            undefined
        ){

            r.quantiteOrigine =
            r.quantite;

        }

    });

    saveRemonteesEffectuees(
        remontees
    );

    alert(
        "Migration terminée"
    );

}

function getRemonteesEffectuees(){

    return JSON.parse(
        localStorage.getItem(
            "remonteesEffectuees"
        ) || "[]"
    );

}

function saveRemonteesEffectuees(data){

    // Conserver uniquement les 200 dernières lignes
    if(data.length > 200){
        data = data.slice(0, 200);
    }

    localStorage.setItem(
        "remonteesEffectuees",
        JSON.stringify(data)
    );

}
function supprimerFournisseur(id){

    if(!confirm("Supprimer ce fournisseur ?")){
        return;
    }

    fournisseurs = fournisseurs.filter(
        f => f.id !== id
    );

    saveFournisseurs();

    afficherFournisseurs();


}      
mettreAJourSuggestions();

changerSite("DASHBOARD");
console.log(
    "Stock 60 au démarrage :",
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    )?.["HDLP BAR"]
    ?.find(a => String(a.code) === "60")
);
