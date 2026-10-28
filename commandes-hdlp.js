let commandesHDLP =
JSON.parse(
    localStorage.getItem(
        "commandesHDLP"
    )
) || [];

let commandeHDLPCourante = [];

let fournisseurCommandeHDLP = "";

function ouvrirCommandeHDLP(){

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <button
        onclick="changerSite('APPLICATIONS')">
            ⬅ Retour
        </button>

        <h2>📦 Commandes HDLP</h2>

        <button
        onclick="nouvelleCommandeHDLP()">
            ➕ Nouvelle commande
        </button>

        <button
        onclick="listeCommandesHDLP()">
            📋 Commandes enregistrées
        </button>

        <hr>

        Sélectionnez une action.

    </div>

    `;

}
function nouvelleCommandeHDLP(){

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <button
        onclick="ouvrirCommandeHDLP()">
            ⬅ Retour
        </button>

        <h2>
        ➕ Nouvelle commande HDLP
        </h2>

        Fournisseur

        <br>

        <input
        id="fournisseurCommandeHDLP"
        list="listeFournisseurs"
        placeholder="Choisir un fournisseur"

        oninput="
        chargerArticlesCommandeHDLP()
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
        id="rechercheCommandeHDLP"
        placeholder="
        🔍 Article / Code / Code fournisseur
        "

        oninput="
        chargerArticlesCommandeHDLP()
        "

        style="
        width:100%;
        padding:10px;
        ">

        <br><br>

        <div
        id="contenuCommandeHDLP">
        </div>

    </div>

    `;

}
function listeCommandesHDLP(){

    let html = `

    <div class="card">

        <button
        onclick="ouvrirCommandeHDLP()">
            ⬅ Retour
        </button>

        <h2>
        📋 Commandes enregistrées
        </h2>

    `;

    if(
        commandesHDLP.length === 0
    ){

        html += `
        Aucun document.
        `;

    }else{

        commandesHDLP
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
                ouvrirDetailCommandeHDLP(
                '${cmd.id}'
                )">
                    👁️ Ouvrir
                </button>

            </div>

            `;

        });

    }

    html += `
    </div>
    `;

    document.getElementById(
        "cards"
    ).innerHTML = html;

}
function chargerArticlesCommandeHDLP(){

    const fournisseur =

    document.getElementById(
        "fournisseurCommandeHDLP"
    )?.value || "";

    const recherche =

    document.getElementById(
        "rechercheCommandeHDLP"
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

        <div class="card">

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

            value="0"

            oninput="
            calculCommandeHDLP(
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

            value="0"

            oninput="
            calculCommandeHDLP(
            '${article.code}',
            ${article.colisage || 1},
            ${article.prix || 0}
            )
            ">

            <br><br>

           <div id="total_${article.code}">
0 pièce(s) - 0 €
</div>

        </div>

        `;

    });

html += `

<div class="card">

    <b>
    Total commande :
    </b>

    <span id="totalCommandeHDLP">
        0.00 €
    </span>

</div>

<div class="card">

    <button
    onclick="enregistrerCommandeHDLP()">
        ✅ Enregistrer commande
    </button>

</div>

`;

    document.getElementById(
        "contenuCommandeHDLP"
    ).innerHTML = html;

}
function calculCommandeHDLP(
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

    const totalPieces =
    (cartons * colisage)
    + pieces;

    const montant =
    totalPieces * prix;

    document.getElementById(
        "total_" + code
    ).innerHTML =

    totalPieces +
    " pièce(s) - " +

    montant.toFixed(2) +

    " €";

    let totalCommande = 0;

    document
    .querySelectorAll(
        "[id^='total_']"
    )
    .forEach(div => {

        if(
            div.id ===
            "totalCommandeHDLP"
        ){
            return;
        }

        const texte =
        div.innerText;

        const montant =
        parseFloat(
            texte
            .split("-")[1]
            ?.replace("€","")
            ?.trim()
        ) || 0;

        totalCommande += montant;

    });

    const total =
    document.getElementById(
        "totalCommandeHDLP"
    );

    if(total){

        total.innerHTML =
        totalCommande.toFixed(2)
        + " €";

    }

}
function enregistrerCommandeHDLP(){

    const fournisseur =

    document.getElementById(
        "fournisseurCommandeHDLP"
    )?.value || "";

    if(fournisseur === ""){

        alert(
            "Choisissez un fournisseur"
        );

        return;

    }

    const articlesCommande = [];

    let montantTotal = 0;

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

        const cartons =
        Number(
            document.getElementById(
                "cartons_" + article.code
            )?.value || 0
        );

        const pieces =
        Number(
            document.getElementById(
                "pieces_" + article.code
            )?.value || 0
        );

        if(
            cartons <= 0 &&
            pieces <= 0
        ){
            return;
        }

        const totalPieces =

        (cartons *
        Number(article.colisage || 1))

        + pieces;

        const montant =

        totalPieces *

        Number(
            article.prix || 0
        );

        montantTotal += montant;

        articlesCommande.push({

            code:
            article.code,

            article:
            article.article,

            destination:

            document.getElementById(
                "destination_" +
                article.code
            )?.value || "",

            cartons:
            cartons,

            pieces:
            pieces,

            colisage:
            Number(
                article.colisage || 1
            ),

            totalPieces:
            totalPieces,

            prix:
            Number(
                article.prix || 0
            ),

            montant:
            montant

        });

    });

    if(
        articlesCommande.length === 0
    ){

        alert(
            "Aucun article commandé"
        );

        return;

    }

    commandesHDLP.push({

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
        "commandesHDLP",
        JSON.stringify(
            commandesHDLP
        )
    );

    alert(
        "Commande enregistrée ✅"
    );

    listeCommandesHDLP();

}
function ouvrirDetailCommandeHDLP(id){

    const commande =
    commandesHDLP.find(
        c => c.id === id
    );

    if(!commande) return;

    let html = `

    <div class="card">

        <button
        onclick="listeCommandesHDLP()">
            ⬅ Retour
        </button>

        <h2>
        🚚 ${commande.fournisseur}
        </h2>

        📅 ${commande.date}

        <br>

        📌 ${commande.statut}

    </div>

    `;

    commande.articles
    .forEach(article => {

        html += `

        <div class="card">

            <b>
            ${article.article}
            </b>

            <br>

            Code :
            ${article.code}

            <br>

           Destination :

<select
id="destination_${commande.id}_${article.code}">

<option ${
article.destination === "HDLP SOFT"
? "selected" : ""
}>
HDLP SOFT
</option>

<option ${
article.destination === "HDLP BAR"
? "selected" : ""
}>
HDLP BAR
</option>

<option ${
article.destination === "HDLP MINI BAR"
? "selected" : ""
}>
HDLP MINI BAR
</option>

<option ${
article.destination === "HDLP SEMINAIRE"
? "selected" : ""
}>
HDLP SEMINAIRE
</option>

<option ${
article.destination === "RCLP SOFT"
? "selected" : ""
}>
RCLP SOFT
</option>

<option ${
article.destination === "RCLP VIN"
? "selected" : ""
}>
RCLP VIN
</option>

<option ${
article.destination === "RCLP ALCOOL"
? "selected" : ""
}>
RCLP ALCOOL
</option>

</select>

            <br>

           Cartons :

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

            <br>

           Total :
<span id="totalDetail_${article.code}">
${article.totalPieces}
</span>
 pièce(s)
            <br>

         Prix réception :

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

<input
type="number"
step="0.01"

id="montantReception_${commande.id}_${article.code}"

value="${article.montant.toFixed(2)}"

oninput="
majPrixReception(
'${commande.id}',
'${article.code}',
${article.totalPieces}
)
">

<br><br>

Montant estimé :

${Number(
    article.montant
).toFixed(2)} €
        </div>

        `;

    });

    html += `

    <div class="card">

        <b>

        Total commande :

        ${Number(
            commande.montantTotal
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
        sauvegarderCommandeHDLP(
        '${commande.id}'
        )">
            💾 Sauvegarder les modifications
        </button>

        <br><br>

        <button
        style="
            background:#28a745;
            color:white;
            font-weight:bold;
        "
        onclick="
        receptionnerCommandeHDLP(
        '${commande.id}'
        )">
            ✅ Réceptionner la commande
        </button>

    </div>

    `;

}
    document.getElementById(
        "cards"
    ).innerHTML = html;

}
function sauvegarderCommandeHDLP(id){

    const commande =
    commandesHDLP.find(
        c => c.id === id
    );

    if(!commande) return;

    commande.articles
    .forEach(article => {

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

        article.totalPieces =

        (
            article.cartons *
            Number(
                article.colisage || 1
            )
        )
        +
        article.pieces;

        article.montant =

        article.totalPieces *
        Number(
            article.prix || 0
        );

    });

    commande.montantTotal =

    commande.articles.reduce(

        (total,a)=>

        total +
        Number(a.montant || 0),

        0

    );

    localStorage.setItem(

        "commandesHDLP",

        JSON.stringify(
            commandesHDLP
        )

    );

    alert(
        "Commande mise à jour ✅"
    );

    ouvrirDetailCommandeHDLP(id);

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
function receptionnerCommandeHDLP(id){

    const commande =
    commandesHDLP.find(
        c => c.id === id
    );

    if(!commande) return;

    if(
        !confirm(
            "Confirmer la réception ?"
        )
    ){
        return;
    }

    commande.articles.forEach(article => {
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

article.montant =
montantReception;
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
                    Number(
                        article.prix || 0
                    );

                }

            });

        });

    });

    commande.statut =
    "RECEPTIONNEE";

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stock)
    );

    localStorage.setItem(
        "commandesHDLP",
        JSON.stringify(
            commandesHDLP
        )
    );

    alert(
        "Commande réceptionnée ✅"
    );

    ouvrirDetailCommandeHDLP(id);

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
    commandesHDLP.find(
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
