let rclpTab = "rclp";

let rclpData =
JSON.parse(
    localStorage.getItem("rclpData")
) || [];
function ouvrirRemonteeRCLP(){
    renderRemonteeRCLP();
}
function renderRemonteeRCLP(){

    document.getElementById("cards").innerHTML = `

    <div class="card">

        <button onclick="changerSite('APPLICATIONS')">
            ⬅ Retour
        </button>

        <h2>📤 Remontées RCLP</h2>

        <button onclick="changerOngletRCLP('resume')">
            📋 RÉSUMÉ
        </button>

        <button onclick="changerOngletRCLP('rclp')">
            RCLP
        </button>

        <hr>

        <input
        id="rechercheRCLP"
        placeholder="🔍 Recherche article"
        oninput="renderContenuRCLP()"
        style="
        width:100%;
        padding:10px;
        margin-bottom:10px;
        ">

     <input
id="rechercheCodeRCLP"
type="text"
inputmode="numeric"
pattern="[0-9]*"
autocomplete="off"
        placeholder="📦 Code article"
        oninput="renderContenuRCLP()"
        style="
        width:100%;
        padding:10px;
        margin-bottom:10px;
        ">

        <div id="contenuRCLP"></div>

    </div>

    `;

    renderContenuRCLP();
}
function changerOngletRCLP(tab){
    rclpTab = tab;
    renderContenuRCLP();
}
function chargerArticlesRCLP(){

    if(rclpData.length > 0){
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

     rclpData.push({

    id: crypto.randomUUID(),

    code: article.code,

    article: article.article,

    remontee: 0,

    redescente: 0

});

    });

 localStorage.setItem(
    "rclpData",
    JSON.stringify(rclpData)
);

}
function renderContenuRCLP(){

    if(rclpTab === "resume"){
        renderResumeRCLP();
        return;
    }

    chargerArticlesRCLP();

    const recherche =
    document.getElementById(
        "rechercheRCLP"
    )?.value?.toLowerCase() || "";

    const rechercheCode =
    document.getElementById(
        "rechercheCodeRCLP"
    )?.value || "";

    let html = "";

    rclpData

    .sort((a,b)=>
        Number(a.code)-Number(b.code)
    )

    .filter(article=>{

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

    .forEach(article=>{

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

            ⬆️ Remontée

            <br>

            <input
            type="number"
            id="remontee_${article.id}"
            value="${article.remontee || ''}"
            placeholder="Remontée">

            <br><br>

            ⬇️ Redescente

            <br>

            <input
            type="number"
            id="redescente_${article.id}"
            value="${article.redescente || ''}"
            placeholder="Redescente"

            onkeydown="
            if(event.key==='Enter'){
                validerQuantiteRCLP('${article.id}');
            }
            ">

            <br><br>

            <button
            onclick="
            validerQuantiteRCLP(
            '${article.id}'
            )">
            ✅ OK
            </button>

        </div>

        `;

    });

    document.getElementById(
        "contenuRCLP"
    ).innerHTML = html;
}
function validerQuantiteRCLP(id){

    const article =
    rclpData.find(
        a => a.id === id
    );

    if(!article) return;

    const remontee = Number(
        document.getElementById(
            "remontee_" + id
        ).value || 0
    );

    const redescente = Number(
        document.getElementById(
            "redescente_" + id
        ).value || 0
    );

    article.remontee = remontee;
    article.redescente = redescente;

    localStorage.setItem(
        "rclpData",
        JSON.stringify(rclpData)
    );

    const rechercheCode =
    document.getElementById(
        "rechercheCodeRCLP"
    );

    if(rechercheCode){

        rechercheCode.value = "";

        const rechercheArticle =
        document.getElementById(
            "rechercheRCLP"
        );

        if(rechercheArticle){
            rechercheArticle.value = "";
        }

        rechercheCode.focus();

        renderContenuRCLP();
    }
}
function renderResumeRCLP(){

    let html = "<h3>📋 Résumé des remontées RCLP</h3>";

    let totalArticles = 0;
    let totalQuantites = 0;

    rclpData.forEach(article => {

        const remontee =
Number(article.remontee || 0);

const redescente =
Number(article.redescente || 0);

if(
    remontee <= 0 &&
    redescente <= 0
){
    return;
}

        totalArticles++;
        totalQuantites += remontee + redescente;

        html += `

       <div
class="card card-resume"

id="resume_${article.id}"

onclick="
surlignerArticleResume(
'${article.id}'
)
">

            <b>${article.article}</b>

            <br>
Code :
 ${article.code}
 <br><br>
            ⬆️ Remontée : ${remontee}

<br>

⬇️ Redescente : ${redescente}

            <br><br>

         <input
    type="checkbox"
    id="check_${article.id}"
    checked
>

À traiter

            <br><br>

            Cave d'origine :

            <select id="cave_${article.id}">
                <option>RCLP SOFT</option>
                <option>RCLP VIN</option>
                <option>RCLP ALCOOL</option>
            </select>

            <br><br>

            <button
            style="
                background:#dc3545;
                color:white;
            "
            onclick="retirerArticleResumeRCLP('${article.id}')">
                🗑️ Retirer
            </button>

        </div>

        `;

    });

    html += `

    <div class="card">

        <b>Total articles :</b>
        ${totalArticles}

        <br>

        <b>Total quantités :</b>
        ${totalQuantites}

        <br><br>

        Date de remontée

        <br>

        <input
            type="date"
            id="dateRemonteeRCLP"
            value="${
                new Date()
                .toISOString()
                .split("T")[0]
            }"
        >

        <br><br>

        <button
        onclick="validerRemonteeResumeRCLP()">
            ✅ Valider la remontée
        </button>

    </div>

    `;

    document.getElementById(
        "contenuRCLP"
    ).innerHTML = html;
}
function retirerArticleResumeRCLP(id){

    const article =
    rclpData.find(
        a => a.id === id
    );

    if(article){

        article.remontee = 0;

        article.redescente = 0;

    }

    save();

    localStorage.setItem(
        "rclpData",
        JSON.stringify(rclpData)
    );

    renderResumeRCLP();

}
function validerRemonteeResumeRCLP(){

    const date =
    document.getElementById(
        "dateRemonteeRCLP"
    ).value;

    const mouvements = [];

    const validationId =
    crypto.randomUUID();

    const remontees =
    getRemonteesEffectuees();

    rclpData.forEach(article => {

        const remontee =
        Number(article.remontee || 0);

        const redescente =
        Number(article.redescente || 0);

        if(
            remontee <= 0 &&
            redescente <= 0
        ){
            return;
        }

        const coche =
        document.getElementById(
            "check_" + article.id
        );

        if(!coche.checked){
            return;
        }

        const cave =
        document.getElementById(
            "cave_" + article.id
        ).value;

        const articleStock =
        (stock[cave] || [])
        .find(a =>
            String(a.code) ===
            String(article.code)
        );

        if(articleStock){

            articleStock.stock =
            Number(articleStock.stock || 0)
            - remontee
            + redescente;

        }

        mouvements.push({

            article: article.article,

            code: article.code,

            remontee: remontee,

            redescente: redescente,

            cave: cave,

            date: date,

            type: "Mouvement RCLP"

        });

        if(remontee > 0){

            remontees.unshift({

                id: crypto.randomUUID(),

                validationId: validationId,

                date: date,
 dateHeure: new Date().toISOString(),
                type: "RCLP",

                cave: cave,

                articleId: article.id,

                code: article.code,

                designation: article.article,

                quantite: remontee

            });

        }

        if(redescente > 0){

            remontees.unshift({

                id: crypto.randomUUID(),

                validationId: validationId,

                date: date,

                type: "REDESCENTE RCLP",

                cave: cave,

                articleId: article.id,

                code: article.code,

                designation: article.article,

                quantite: redescente

            });

        }

        article.remontee = 0;
        article.redescente = 0;

    });

    saveRemonteesEffectuees(remontees);

    save();

    localStorage.setItem(
        "rclpData",
        JSON.stringify(rclpData)
    );

    let historique =
    JSON.parse(
        localStorage.getItem(
            "mouvements"
        )
    ) || [];

    historique.push(...mouvements);

    localStorage.setItem(
        "mouvements",
        JSON.stringify(historique)
    );

    alert(
        mouvements.length +
        " article(s) validé(s)"
    );

    changerOngletRCLP("rclp");

}
function surlignerArticleResume(id){

    const carte =
    document.getElementById(
        "resume_" + id
    );

    if(!carte) return;

    carte.classList.toggle(
        "article-selectionne"
    );

}
