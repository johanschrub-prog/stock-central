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
                ${cmd.fournisseur}
                </b>

                <br>

                ${cmd.date}

                <br>

                ${cmd.statut}

                <br><br>

                ${Number(
                    cmd.montantTotal || 0
                ).toFixed(2)} €

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

            <div
            id="total_${article.code}">
            Total : 0 €
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

        totalPieces
        * prix;

    document.getElementById(
        "total_" + code
    ).innerHTML =

    "Total : " +
    montant.toFixed(2) +
    " €";

}
