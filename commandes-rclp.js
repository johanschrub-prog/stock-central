let commandesRCLP =
JSON.parse(
    localStorage.getItem(
        "commandesRCLP"
    )
) || [];
let focusRechercheReceptionRCLP = false;
let filtreRechercheReceptionRCLP = "";
let filtreDateDebutReceptionRCLP = "";
let filtreDateFinReceptionRCLP = "";
let filtreFactureReceptionRCLP = false;
let commandeRCLPCourante = {};
let commandeRCLPArticles = {};

let fournisseurCommandeRCLP = "";

function ouvrirCommandeRCLP(){

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <button
        onclick="changerSite('APPLICATIONS')">
            ⬅ Retour
        </button>

        <h2>📦 Commandes RCLP</h2>

        <button
        onclick="nouvelleCommandeRCLP()">
            ➕ Nouvelle commande
        </button>

        <button
        onclick="listeCommandesRCLP()">
            📋 Commandes enregistrées
        </button>
<button
onclick="listeCommandesReceptionneesRCLP()">
    ✅ Réceptionnées
</button>
        <hr>

        Sélectionnez une action.

    </div>

    `;

}
function nouvelleCommandeRCLP(){

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <button
        onclick="ouvrirCommandeRCLP()">
            ⬅ Retour
        </button>

        <h2>
        ➕ Nouvelle commande RCLP
        </h2>

        Fournisseur

        <br>

        <input
        id="fournisseurCommandeRCLP"
        list="listeFournisseurs"
        placeholder="Choisir un fournisseur"

        oninput="
        chargerArticlesCommandeRCLP()
        "

        style="
        width:100%;
        padding:10px;
        ">

        <datalist
        id="listeFournisseurs">

        ${
            fournisseurs
            .map(f =>
                `<option value="${f.nom}">`
            )
            .join("")
        }

        </datalist>

        <br><br>

       <input
id="rechercheCommandeRCLP"
placeholder="
🔍 Article / Code / Code fournisseur
"

oninput="
chargerArticlesCommandeRCLP()
"

style="
width:100%;
padding:10px;
">

<br><br>

<div class="card">

    <b>
    Total commande :
    </b>

    <span id="totalCommandeRCLP">
    0.00 €
    </span>

    <br><br>

    <button
    onclick="
    enregistrerCommandeRCLP()
    "
    style="
    width:100%;
    background:#28a745;
    color:white;
    font-weight:bold;
    ">
        ✅ Enregistrer commande
    </button>

</div>

<div
id="contenuCommandeRCLP">
</div>

    </div>

    `;

}
function listeCommandesRCLP(){

    let html = `

    <div class="card">

        <button
        onclick="ouvrirCommandeRCLP()">
            ⬅ Retour
        </button>

        <h2>
        📋 Commandes en attente
        </h2>

    `;

    const commandesEnAttente =

    commandesRCLP.filter(
        c =>
        c.statut ===
        "EN ATTENTE"
    );

    if(
        commandesEnAttente.length === 0
    ){

        html += `
        Aucune commande en attente.
        `;

    }else{

        commandesEnAttente
        .slice()
        .reverse()
        .forEach(cmd => {

            html += `

            <div class="card">

                <b>
                🚚 ${cmd.fournisseur}
                </b>

                <br><br>

                📅 ${cmd.date}

                <br>

                💰 ${Number(
                    cmd.montantTotal || 0
                ).toFixed(2)} €

                <br>

                📦 ${cmd.articles.length}
                article(s)

                <br>

                📌 ${cmd.statut}

                <br><br>

                <button
                onclick="
                ouvrirDetailCommandeRCLP(
                '${cmd.id}'
                )
                ">
                    👁️ Ouvrir
                </button>

            </div>

            `;

        });

    }

    html += `</div>`;

    document.getElementById(
        "cards"
    ).innerHTML = html;

}
function chargerArticlesCommandeRCLP(){

    const fournisseur =

    document.getElementById(
        "fournisseurCommandeRCLP"
    )?.value || "";

    const recherche =

    document.getElementById(
        "rechercheCommandeRCLP"
    )?.value
    ?.toLowerCase() || "";

    let html = "";

    const dejaVus =
    new Set();

    Object.values(stock)

    .flat()

    .forEach(article => {

      if(
    fournisseur !== ""
    &&
    String(
        article.fournisseur || ""
    ) !== fournisseur
){
    return;
}

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

        const match =

        String(article.article || "")
        .toLowerCase()
        .includes(recherche)

        ||

        String(article.code || "")
        .toLowerCase()
        .includes(recherche)

        ||

        String(
            article.codeFournisseur || ""
        )
        .toLowerCase()
        .includes(recherche);

        if(
            recherche !== ""
            &&
            !match
        ){
            return;
        }

        html += `

       <div class="card"
style="
${
commandeRCLPArticles[
article.code
]
?
'border:3px solid #28a745;'
:
''
}
">

            <b>
            ${article.article}
            </b>

            <br>

            Code :
            ${article.code}

            <br>

            Code fournisseur :
            ${article.codeFournisseur || "-"}
<br>

Fournisseur :
${article.fournisseur || "-"}
            <br>

            Prix pièce :
            ${Number(
                article.prix || 0
            ).toFixed(2)} €
<br>

Colisage :
${article.colisage || 1}
            <br><br>

            Stock destination

            <br>

            <select
            id="destination_${article.code}">

                <option>
                HDLP SOFT
                </option>

                <option>
                HDLP BAR
                </option>

                <option>
                HDLP MINI BAR
                </option>

                <option>
                HDLP SEMINAIRE
                </option>

                <option>
                RCLP SOFT
                </option>

                <option>
                RCLP VIN
                </option>

                <option>
                RCLP ALCOOL
                </option>

            </select>

            <br><br>

            Cartons

            <br>

            <input
            type="number"

            id="cartons_${article.code}"

          value="${
commandeRCLPCourante[
article.code
]?.cartons || 0
}"

            oninput="
            calculCommandeRCLP(
            '${article.code}',
            ${article.colisage || 1},
            ${article.prix || 0}
            )
            ">

            <br><br>

            Pièces

            <br>

            <input
            type="number"

            id="pieces_${article.code}"

          value="${
commandeRCLPCourante[
article.code
]?.pieces || 0
}"

            oninput="
            calculCommandeRCLP(
            '${article.code}',
            ${article.colisage || 1},
            ${article.prix || 0}
            )
            ">

            <br><br>

        <div id="total_${article.code}">
0 pièce(s) - 0 €
</div>

<br><br>

<button
onclick="
validerArticleCommandeRCLP(
'${article.code}',
'${article.article}',
${article.colisage || 1},
${article.prix || 0}
)
">
✅ OK
</button>

        </div>

        `;

    });


    document.getElementById(
        "contenuCommandeRCLP"
    ).innerHTML = html;

}
function calculCommandeRCLP(
    code,
    colisage,
    prix
){

    const cartons =
    Number(
        document.getElementById(
            "cartons_" + code
        )?.value || 0
    );

    const pieces =
    Number(
        document.getElementById(
            "pieces_" + code
        )?.value || 0
    );

    commandeRCLPCourante[code] = {

        cartons: cartons,
        pieces: pieces

    };

    const totalPieces =
    (cartons * colisage)
    + pieces;

    const montant =
    totalPieces * prix;

    const zone =
    document.getElementById(
        "total_" + code
    );

    if(zone){

        zone.innerHTML =
        totalPieces +
        " pièce(s) - " +
        montant.toFixed(2) +
        " €";

    }

}

function enregistrerCommandeRCLP(){

    const fournisseur =

    document.getElementById(
        "fournisseurCommandeRCLP"
    )?.value || "";

    if(fournisseur === ""){

        alert(
            "Choisissez un fournisseur"
        );

        return;

    }

    const articlesCommande =

    Object.values(
        commandeRCLPArticles
    );

    if(
        articlesCommande.length === 0
    ){

        alert(
            "Aucun article validé"
        );

        return;

    }

    const montantTotal =

    articlesCommande.reduce(

        (total,a)=>

        total +
        Number(
            a.montant || 0
        ),

        0

    );

    commandesRCLP.push({

        id:
        crypto.randomUUID(),

        fournisseur:
        fournisseur,

        date:
        new Date()
        .toLocaleString(),

        statut:
        "EN ATTENTE",

        montantTotal:
        montantTotal,

        articles:
        articlesCommande

    });

    localStorage.setItem(

        "commandesRCLP",

        JSON.stringify(
            commandesRCLP
        )

    );

    commandeRCLPArticles = {};
    commandeRCLPCourante = {};

    alert(
        "Commande enregistrée ✅"
    );

    listeCommandesRCLP();

}
function ouvrirDetailCommandeRCLP(id){

    const commande =
    commandesRCLP.find(
        c => c.id === id
    );

    if(!commande) return;

    let html = `

    <div class="card">

        <button
        onclick="listeCommandesRCLP()">
            ⬅ Retour
        </button>

        <h2>
        🚚 ${commande.fournisseur}
        </h2>

        📅 ${commande.date}
${commande.dateReception ?

`<br>
🚚 Réception :
${commande.dateReception}`

: ""}

${commande.dateFacture ?

`<br>
🧾 Facture :
${commande.dateFacture}`

: ""}
        <br>

        📌 ${commande.statut}
${commande.statut === "RECEPTIONNEE" ? `

<br><br>

<label>

<input
type="checkbox"

id="factureRecue_${commande.id}"

${commande.factureRecue ? "checked" : ""}

onchange="
majFactureRecueRCLP(
'${commande.id}'
)
">

🧾 Facture reçue

</label>

` : ""}
    </div>

    `;

    commande.articles.forEach(article => {

        html += `

        <div class="card">

            <b>
            ${article.article}
            </b>

            <br>

            Code :
            ${article.code}
<br><br>

Code fournisseur :

<br>

<input
type="text"

id="codeFournisseur_${commande.id}_${article.code}"

value="${
article.codeFournisseur || ""
}">
            <br><br>

            Destination :

            <br>

            <select
            id="destination_${commande.id}_${article.code}">

                <option ${
                article.destination==="HDLP SOFT"
                ? "selected" : ""
                }>
                HDLP SOFT
                </option>

                <option ${
                article.destination==="HDLP BAR"
                ? "selected" : ""
                }>
                HDLP BAR
                </option>

                <option ${
                article.destination==="HDLP MINI BAR"
                ? "selected" : ""
                }>
                HDLP MINI BAR
                </option>

                <option ${
                article.destination==="HDLP SEMINAIRE"
                ? "selected" : ""
                }>
                HDLP SEMINAIRE
                </option>

                <option ${
                article.destination==="RCLP SOFT"
                ? "selected" : ""
                }>
                RCLP SOFT
                </option>

                <option ${
                article.destination==="RCLP VIN"
                ? "selected" : ""
                }>
                RCLP VIN
                </option>

                <option ${
                article.destination==="RCLP ALCOOL"
                ? "selected" : ""
                }>
                RCLP ALCOOL
                </option>

            </select>

            <br><br>

            Cartons :

            <br>

            <input
            type="number"
            id="cartons_${commande.id}_${article.code}"
            value="${article.cartons}"

            oninput="
            recalculerDetailCommande(
            '${commande.id}',
            '${article.code}',
            ${article.colisage}
            )
            ">

            <br><br>

            Pièces :

            <br>

            <input
            type="number"
            id="pieces_${commande.id}_${article.code}"
            value="${article.pieces}"

            oninput="
            recalculerDetailCommande(
            '${commande.id}',
            '${article.code}',
            ${article.colisage}
            )
            ">

            <br><br>

            Total :

            <span
            id="totalDetail_${article.code}">
            ${article.totalPieces}
            </span>

            pièce(s)

            <br><br>

            Prix réception :

            <br>

            <input
            type="number"
            step="0.01"

            id="prixReception_${commande.id}_${article.code}"

            value="${article.prix}"

            oninput="
            majMontantReception(
            '${commande.id}',
            '${article.code}'
            )
            ">

            <br><br>

            Montant réception :

            <br>

            <input
            type="number"
            step="0.01"

            id="montantReception_${commande.id}_${article.code}"

            value="${Number(
                article.montant || 0
            ).toFixed(2)}"

            oninput="
            majPrixReception(
            '${commande.id}',
            '${article.code}',
            ${article.totalPieces}
            )
            ">

            <br><br>

            <button
            style="
            background:#dc3545;
            color:white;
            "
            onclick="
            supprimerLigneCommandeRCLP(
            '${commande.id}',
            '${article.code}'
            )
            ">
            🗑️ Supprimer la ligne
            </button>

        </div>

        `;

    });

    html += `

    <div class="card">

        <b>

        Total commande :

        ${Number(
            commande.montantTotal || 0
        ).toFixed(2)} €

        </b>

    </div>

    `;

if(
    commande.statut ===
    "EN ATTENTE"
){

    html += `

    <div class="card">

        <button
        onclick="
        sauvegarderCommandeRCLP(
        '${commande.id}'
        )
        ">
            💾 Sauvegarder
        </button>

        <br><br>

        <button
        style="
        background:#28a745;
        color:white;
        "
        onclick="
        receptionnerCommandeRCLP(
        '${commande.id}'
        )
        ">
            ✅ Réceptionner
        </button>
<br><br>

<button
style="
background:#dc3545;
color:white;
"
onclick="
supprimerCommandeRCLP(
'${commande.id}'
)
">
🗑️ Supprimer la commande
</button>
    </div>

    `;

}
else{

    html += `

    <div class="card">

        <button
        style="
        background:#ffc107;
        color:black;
        font-weight:bold;
        "
        onclick="
        mettreAJourFactureRCLP(
        '${commande.id}'
        )
        ">
            💰 Mettre à jour avec la facture
        </button>
<br><br>

<button
style="
background:#dc3545;
color:white;
"
onclick="
supprimerCommandeReceptionneeRCLP(
'${commande.id}'
)
">
↩️ Annuler la réception
</button>
        <br><br>

        <button
        onclick="
        sauvegarderCommandeRCLP(
        '${commande.id}'
        )
        ">
            💾 Sauvegarder les modifications
        </button>

    </div>

    `;

}

document.getElementById(
    "cards"
).innerHTML = html;

}
       
function sauvegarderCommandeRCLP(id){

    const commande =
    commandesRCLP.find(
        c => c.id === id
    );

    if(!commande) return;

    commande.articles.forEach(article => {

        article.cartons =
        Number(
            document.getElementById(
                `cartons_${id}_${article.code}`
            )?.value || 0
        );

        article.pieces =
        Number(
            document.getElementById(
                `pieces_${id}_${article.code}`
            )?.value || 0
        );

        article.destination =
        document.getElementById(
            `destination_${id}_${article.code}`
        )?.value || "";

        article.codeFournisseur =
        document.getElementById(
            `codeFournisseur_${id}_${article.code}`
        )?.value || "";
        Object.keys(stock)
.forEach(categorie => {

    stock[categorie]
    .forEach(a => {

        if(
            String(a.code)
            ===
            String(article.code)
        ){

            a.codeFournisseur =
            article.codeFournisseur;

        }

    });

});

        article.prix =
        Number(
            document.getElementById(
                `prixReception_${id}_${article.code}`
            )?.value || 0
        );

        article.totalPieces =
        (
            article.cartons *
            Number(article.colisage || 1)
        )
        +
        article.pieces;

        article.montant =
        article.totalPieces *
        article.prix;

    });

    commande.montantTotal =

    commande.articles.reduce(

        (total,a) =>

        total +
        Number(a.montant || 0),

        0

    );
localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stock)
);
    localStorage.setItem(
        "commandesRCLP",
        JSON.stringify(
            commandesRCLP
        )
    );

    alert(
        "Commande mise à jour ✅"
    );

    ouvrirDetailCommandeRCLP(id);

}
function recalculerDetailCommande(
    id,
    code,
    colisage
){

    const cartons =
    Number(
        document.getElementById(
            `cartons_${id}_${code}`
        )?.value || 0
    );

    const pieces =
    Number(
        document.getElementById(
            `pieces_${id}_${code}`
        )?.value || 0
    );

    const totalPieces =
    (cartons * colisage)
    + pieces;

    const zone =
    document.getElementById(
        `totalDetail_${code}`
    );

    if(zone){

        zone.innerHTML =
        totalPieces;

    }

}
function receptionnerCommandeRCLP(id){

    const commande =
    commandesRCLP.find(
        c => c.id === id
    );

    if(!commande) return;

    if(
        commande.statut ===
        "RECEPTIONNEE"
    ){
        return;
    }

    if(
        !confirm(
            "Confirmer la réception de la commande ?"
        )
    ){
        return;
    }

    commande.articles.forEach(article => {
article.prix =
Number(
document.getElementById(
`prixReception_${id}_${article.code}`
)?.value

|| article.prix

|| 0
);
        const montantReception =

        Number(
        document.getElementById(
        `montantReception_${id}_${article.code}`
        )?.value

        || article.montant

        || 0
        );

        const prixReception =

        article.totalPieces > 0

        ?

        montantReception /
        article.totalPieces

        :

        0;

        article.prix =
        prixReception;

        const destination =
        article.destination;

        const articleStock =

        (stock[destination] || [])

        .find(a =>

            String(a.code)
            ===
            String(article.code)

        );

        if(articleStock){

            articleStock.stock =

            Number(
                articleStock.stock || 0
            )

            +

            Number(
                article.totalPieces || 0
            );

        }

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
                    prixReception;

                    a.codeFournisseur =
                    article.codeFournisseur || "";

                }

            });

        });

    });

    commande.statut =
    "RECEPTIONNEE";
commande.dateReception =
new Date()
.toLocaleString();

commande.dateReceptionISO =
new Date()
.toISOString()
.split("T")[0];

commande.factureRecue =
false;
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stock)
    );

    localStorage.setItem(
        "commandesRCLP",
        JSON.stringify(
            commandesRCLP
        )
    );

    alert(
        "✅ Commande réceptionnée"
    );

    ouvrirDetailCommandeRCLP(id);

}
function majPrixReception(
    commandeId,
    code,
    totalPieces
){

    const montant =

    Number(
    document.getElementById(
        `montantReception_${commandeId}_${code}`
    )?.value || 0
    );

    if(totalPieces <= 0){
        return;
    }

    const nouveauPrix =

    montant / totalPieces;

    const champPrix =
    document.getElementById(
        `prixReception_${commandeId}_${code}`
    );

    if(champPrix){

        champPrix.value =
        nouveauPrix.toFixed(4);

    }

}
function majMontantReception(
    commandeId,
    code
){

    const commande =
    commandesRCLP.find(
        c => c.id === commandeId
    );

    if(!commande) return;

    const article =
    commande.articles.find(
        a => String(a.code) === String(code)
    );

    if(!article) return;

    const prix =

    Number(
    document.getElementById(
        `prixReception_${commandeId}_${code}`
    )?.value || 0
    );

    const montant =

    prix *
    Number(article.totalPieces || 0);

    const champMontant =
    document.getElementById(
        `montantReception_${commandeId}_${code}`
    );

    if(champMontant){

        champMontant.value =
        montant.toFixed(2);

    }

}
function supprimerLigneCommandeRCLP(
    commandeId,
    code
){

    const commande =
    commandesRCLP.find(
        c => c.id === commandeId
    );

    if(!commande) return;

    commande.articles =
    commande.articles.filter(
        a =>
        String(a.code)
        !==
        String(code)
    );

    commande.montantTotal =

    commande.articles.reduce(

        (total,a) =>

        total +
        Number(a.montant || 0),

        0

    );

    localStorage.setItem(

        "commandesRCLP",

        JSON.stringify(
            commandesRCLP
        )

    );

    ouvrirDetailCommandeRCLP(
        commandeId
    );

}
function validerArticleCommandeRCLP(
    code,
    articleNom,
    colisage,
    prix
){

    const cartons =
    Number(
        document.getElementById(
            "cartons_" + code
        )?.value || 0
    );

    const pieces =
    Number(
        document.getElementById(
            "pieces_" + code
        )?.value || 0
    );

    const destination =
    document.getElementById(
        "destination_" + code
    )?.value || "";

    if(
        cartons <= 0 &&
        pieces <= 0
    ){
        let totalCommande =

Object.values(
    commandeRCLPArticles
)

.reduce(

(total,a)=>

total +
Number(a.montant || 0),

0

);

const zoneTotal =
document.getElementById(
    "totalCommandeRCLP"
);

if(zoneTotal){

    zoneTotal.innerHTML =
    totalCommande.toFixed(2)
    + " €";

}
        alert(
            "Aucune quantité saisie"
        );
        return;
    }

    const totalPieces =
    (cartons * colisage)
    + pieces;

    const montant =
    totalPieces * prix;

    commandeRCLPArticles[code] = {

        code: code,

        article: articleNom,

        cartons: cartons,

        pieces: pieces,

        colisage: colisage,

        totalPieces: totalPieces,

        prix: prix,

        montant: montant,

        destination: destination

    };

    alert(
        articleNom +
        " ajouté à la commande ✅"
    );

}
function listeCommandesReceptionneesRCLP(){

  const champRecherche =
document.getElementById(
    "rechercheReceptionRCLP"
);

if(champRecherche){

    filtreRechercheReceptionRCLP =
    champRecherche.value.toLowerCase();

}

const recherche =
filtreRechercheReceptionRCLP;

   const champDateDebut =
document.getElementById(
    "dateDebutReceptionRCLP"
);

if(champDateDebut){

    filtreDateDebutReceptionRCLP =
    champDateDebut.value;

}

const dateDebut =
filtreDateDebutReceptionRCLP;

  const champDateFin =
document.getElementById(
    "dateFinReceptionRCLP"
);

if(champDateFin){

    filtreDateFinReceptionRCLP =
    champDateFin.value;

}

const dateFin =
filtreDateFinReceptionRCLP;

  const caseFacture =
document.getElementById(
    "factureRecueFiltre"
);

if(caseFacture){

    filtreFactureReceptionRCLP =
    caseFacture.checked;

}

const factureSeulement =
filtreFactureReceptionRCLP;

    let html = `

    <div class="card">

        <button
        onclick="ouvrirCommandeRCLP()">
            ⬅ Retour
        </button>

        <h2>
        ✅ Commandes réceptionnées
        </h2>

        🔍 Recherche

        <br>

  <input
id="rechercheReceptionRCLP"

value="${recherche}"

placeholder="
Fournisseur ou article
"

onkeyup="
filtrerReceptionRCLP()
">

        <br><br>

        📅 Du

        <br>

        <input
        type="date"

        id="dateDebutReceptionRCLP"

        value="${dateDebut}"

        onchange="
        listeCommandesReceptionneesRCLP()
        ">

        <br><br>

        📅 Au

        <br>

        <input
        type="date"

        id="dateFinReceptionRCLP"

        value="${dateFin}"

        onchange="
        listeCommandesReceptionneesRCLP()
        ">

        <br><br>

        <input
        type="checkbox"

        id="factureRecueFiltre"

        ${
            factureSeulement
            ? "checked"
            : ""
        }

        onchange="
        listeCommandesReceptionneesRCLP()
        ">

        Facture reçue uniquement

    </div>

    `;

    let commandesReceptionnees =

    commandesRCLP.filter(
        c =>
        c.statut ===
        "RECEPTIONNEE"
    );

    commandesReceptionnees =
    commandesReceptionnees.filter(cmd => {

        const matchRecherche =

        recherche === ""

        ||

        cmd.fournisseur
        ?.toLowerCase()
        .includes(recherche)

        ||

        cmd.articles.some(a =>

            a.article
            ?.toLowerCase()
            .includes(recherche)

        );

        const dateCommande =
        cmd.dateReceptionISO || "";

        const matchDateDebut =

        dateDebut === ""

        ||

        dateCommande >= dateDebut;

        const matchDateFin =

        dateFin === ""

        ||

        dateCommande <= dateFin;

        const matchFacture =

        !factureSeulement

        ||

        cmd.factureRecue === true;

        return (

            matchRecherche

            &&

            matchDateDebut

            &&

            matchDateFin

            &&

            matchFacture

        );

    });

    if(
        commandesReceptionnees.length === 0
    ){

        html += `

        <div class="card">
        Aucune commande trouvée.
        </div>

        `;

    }else{

        commandesReceptionnees
        .slice()
        .reverse()
        .forEach(cmd => {

            html += `

           <div
class="card commandeReceptionRCLP"

data-fournisseur="${cmd.fournisseur}"

data-articles="${cmd.articles
.map(a => a.article)
.join(' ')}">

                <b>
                🚚 ${cmd.fournisseur}
                </b>

                <br><br>

                📅 ${
                    cmd.dateReception
                    || cmd.date
                }

                <br>

                💰 ${Number(
                    cmd.montantTotal || 0
                ).toFixed(2)} €

                <br>

                📦 ${cmd.articles.length}
                article(s)

                <br>

                🧾 ${
                    cmd.factureRecue
                    ? "Facture reçue ✅"
                    : "Facture manquante ❌"
                }

                <br><br>

                <button
                onclick="
                ouvrirDetailCommandeRCLP(
                '${cmd.id}'
                )
                ">
                    👁️ Ouvrir
                </button>

            </div>

            `;

        });

    }

document.getElementById(
    "cards"
).innerHTML = html;

}
function mettreAJourFactureRCLP(id){

    const commande =
    commandesRCLP.find(
        c => c.id === id
    );

    if(!commande) return;

    commande.articles.forEach(article => {

        article.codeFournisseur =
        document.getElementById(
            `codeFournisseur_${id}_${article.code}`
        )?.value || "";

        const prixFacture =
        Number(
            document.getElementById(
                `prixReception_${id}_${article.code}`
            )?.value || 0
        );

        const montantFacture =
        Number(
            document.getElementById(
                `montantReception_${id}_${article.code}`
            )?.value || 0
        );

        article.prix =
        prixFacture;

        article.montant =
        montantFacture;

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
                    prixFacture;

                    a.codeFournisseur =
                    article.codeFournisseur;

                }

            });

        });

    });

    commande.montantTotal =

    commande.articles.reduce(

        (total,a) =>
        total +
        Number(
            a.montant || 0
        ),

        0

    );

    commande.dateFacture =
    new Date()
    .toLocaleString();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stock)
    );

    localStorage.setItem(
        "commandesRCLP",
        JSON.stringify(
            commandesRCLP
        )
    );

    alert(
        "✅ Facture enregistrée"
    );

    ouvrirDetailCommandeRCLP(id);

}
function supprimerCommandeRCLP(id){

    if(
        !confirm(
            "Supprimer cette commande ?"
        )
    ){
        return;
    }

    commandesRCLP =
    commandesRCLP.filter(
        c => c.id !== id
    );

    localStorage.setItem(
        "commandesRCLP",
        JSON.stringify(
            commandesRCLP
        )
    );

    alert(
        "Commande supprimée ✅"
    );

    listeCommandesRCLP();

}
function supprimerCommandeReceptionneeRCLP(id){

    const commande =
    commandesRCLP.find(
        c => c.id === id
    );

    if(!commande) return;

    if(
        !confirm(
            "La réception va être annulée et les stocks seront retirés. Continuer ?"
        )
    ){
        return;
    }

    commande.articles.forEach(article => {

        const destination =
        article.destination;

        const articleStock =

        (stock[destination] || [])

        .find(a =>

            String(a.code)
            ===
            String(article.code)

        );

        if(articleStock){

            articleStock.stock =

            Number(
                articleStock.stock || 0
            )

            -

            Number(
                article.totalPieces || 0
            );

            if(
                articleStock.stock < 0
            ){

                articleStock.stock = 0;

            }

        }

    });

    commandesRCLP =
    commandesRCLP.filter(
        c => c.id !== id
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stock)
    );

    localStorage.setItem(
        "commandesRCLP",
        JSON.stringify(
            commandesRCLP
        )
    );

    alert(
        "Réception annulée ✅"
    );

    listeCommandesReceptionneesRCLP();

}
function majFactureRecueRCLP(id){

    const commande =
    commandesRCLP.find(
        c => c.id === id
    );

    if(!commande) return;

    const caseFacture =
    document.getElementById(
        `factureRecue_${id}`
    );

    commande.factureRecue =
    caseFacture?.checked || false;

    localStorage.setItem(
        "commandesRCLP",
        JSON.stringify(
            commandesRCLP
        )
    );

}
function filtrerReceptionRCLP(){

    const recherche =

    document.getElementById(
        "rechercheReceptionRCLP"
    )
    .value
    .toLowerCase();

    document
    .querySelectorAll(
        ".commandeReceptionRCLP"
    )
    .forEach(carte => {

        const fournisseur =
        (
            carte.dataset.fournisseur || ""
        ).toLowerCase();

        const articles =
        (
            carte.dataset.articles || ""
        ).toLowerCase();

        const visible =

        fournisseur.includes(recherche)

        ||

        articles.includes(recherche);

        carte.style.display =
        visible
        ? ""
        : "none";

    });

}
