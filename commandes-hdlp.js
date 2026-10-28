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

        <button
        onclick="
        enregistrerCommandeHDLP()
        ">
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
            ${article.destination}

            <br>

            Cartons :
            ${article.cartons}

            <br>

            Pièces :
            ${article.pieces}

            <br>

            Total :
            ${article.totalPieces}

            <br>

            Montant :
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

    document.getElementById(
        "cards"
    ).innerHTML = html;

}
