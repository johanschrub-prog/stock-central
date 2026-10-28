let boutiqueTab = "vente";

let boutiqueData =
JSON.parse(
    localStorage.getItem("boutiqueData")
) || [];

function ouvrirVentesBoutique(){

    renderVentesBoutique();

}

function renderVentesBoutique(){

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <button onclick="changerSite('APPLICATIONS')">
            ⬅ Retour
        </button>

        <h2>🛍️ Ventes Boutique</h2>

        <button onclick="changerOngletBoutique('resume')">
            📋 RÉSUMÉ
        </button>

        <button onclick="changerOngletBoutique('vente')">
            VENTES
        </button>

        <hr>

        <input
        id="rechercheBoutique"
        placeholder="🔍 Recherche article"
        oninput="renderContenuBoutique()"
        style="
        width:100%;
        padding:10px;
        margin-bottom:10px;
        ">

        <input
        id="rechercheCodeBoutique"
        type="text"
        inputmode="numeric"
        placeholder="📦 Code article"
        oninput="renderContenuBoutique()"
        style="
        width:100%;
        padding:10px;
        margin-bottom:10px;
        ">

        <div id="contenuBoutique"></div>

    </div>

    `;

    renderContenuBoutique();

}
function changerOngletBoutique(tab){

    boutiqueTab = tab;

    renderContenuBoutique();

}
function chargerArticlesBoutique(){

    if(boutiqueData.length > 0){
        return;
    }

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

        boutiqueData.push({

            id: crypto.randomUUID(),

            code: article.code,

            article: article.article,

            vente: 0

        });

    });

    localStorage.setItem(
        "boutiqueData",
        JSON.stringify(boutiqueData)
    );

}
function renderContenuBoutique(){

    if(boutiqueTab === "resume"){

        renderResumeBoutique();

        return;

    }

    chargerArticlesBoutique();

    const recherche =
    document.getElementById(
        "rechercheBoutique"
    )?.value?.toLowerCase() || "";

    const rechercheCode =
    document.getElementById(
        "rechercheCodeBoutique"
    )?.value || "";

    let html = "";

    boutiqueData

    .sort((a,b)=>
        Number(a.code)-Number(b.code)
    )

    .filter(article => {

        const okTexte =

            recherche === ""

            ||

            String(article.article)
            .toLowerCase()
            .includes(recherche);

        const okCode =

            rechercheCode === ""

            ||

            String(article.code)
            .startsWith(rechercheCode);

        return okTexte && okCode;

    })

    .forEach(article => {

        const stockHDLP =
        getStockHDLP(article.code);

        const stockRCLP =
        getStockRCLP(article.code);

        html += `

        <div class="card">

            <b>${article.article}</b>

            <br>

            Code : ${article.code}

            <br><br>

            <span style="
            color:#1976d2;
            font-weight:bold;
            ">
            📦 HDLP : ${stockHDLP}
            </span>

            <br>

            <span style="
            color:#ff9800;
            font-weight:bold;
            ">
            📦 RCLP : ${stockRCLP}
            </span>

            <br><br>

            Vente

            <br>

            <input
            type="number"
            id="vente_${article.id}"
            value="${article.vente || ''}"
            placeholder="Quantité"

            onkeydown="
            if(event.key==='Enter'){
                validerVenteBoutique('${article.id}');
            }
            ">

            <br><br>

            <button
            onclick="
            validerVenteBoutique(
            '${article.id}'
            )">
            ✅ OK
            </button>

        </div>

        `;

    });

    document.getElementById(
        "contenuBoutique"
    ).innerHTML = html;

}



