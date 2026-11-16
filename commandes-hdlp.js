let commandesHDLP = JSON.parse(localStorage.getItem("commandesHDLP")) || [];
let focusRechercheReceptionHDLP = false;
let filtreRechercheReceptionHDLP = "";
let filtreDateDebutReceptionHDLP = "";
let filtreDateFinReceptionHDLP = "";
let filtreFactureReceptionHDLP = false;
let commandeHDLPCourante = {};
let commandeHDLPArticles = {};
let fournisseurCommandeHDLP = "";
let destinationDefautHDLP = localStorage.getItem("destinationDefautHDLP") || "HDLP BAR";

function commandeHDLP() {
    ouvrirCommandeHDLP();
}

function ouvrirCommandeHDLP(){
    document.getElementById("cards").innerHTML = `
    <div class="card" style="text-align: center; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff;">
        <div style="text-align: left; margin-bottom: 15px;">
            <button onclick="changerSite('APPLICATIONS')" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                ⬅ Retour
            </button>
        </div>
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">📦 Commandes HDLP</h2>
        <br>
        <div style="display: flex; flex-direction: column; gap: 15px; max-width: 600px; margin: 0 auto;">
            <div style="width: 100%;">
                <button onclick="nouvelleCommandeHDLP()" style="width: 100%; height: 70px; font-size: 16px; font-weight: bold; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    ➕ Nouvelle commande
                </button>
            </div>
            <div style="display: flex; gap: 4%; width: 100%;">
                <button onclick="listeCommandesHDLP()" style="width: 48%; height: 70px; font-size: 16px; font-weight: bold; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    📋 Commandes enregistrées
                </button>
                <button onclick="listeCommandesReceptionneesHDLP()" style="width: 48%; height: 70px; font-size: 16px; font-weight: bold; background: #ff9800; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    ✅ Réceptionnées
                </button>
            </div>
        </div>
        
        <hr style="margin-top: 25px; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin-bottom: 0;">Sélectionnez une action.</p>
    </div>
    `;
}

function nouvelleCommandeHDLP(){
    const totalInitial = Object.values(commandeHDLPArticles).reduce((t, a) => t + Number(a.montant || 0), 0);
    document.getElementById("cards").innerHTML = `
    <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff;">
        <div style="margin-bottom: 15px;">
            <button onclick="ouvrirCommandeHDLP()" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                ⬅ Retour
            </button>
        </div>
        
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">➕ Nouvelle commande HDLP</h2>
        <br>
        <div style="margin-bottom: 15px;">
            <label style="font-size: 13px; font-weight: bold; color: #495057; display: block; margin-bottom: 5px;">🏢 Fournisseur</label>
            <input
            id="fournisseurCommandeHDLP"
            list="listeFournisseurs"
            placeholder="Choisir un fournisseur"
            oninput="chargerArticlesCommandeHDLP()"
            style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
            <datalist id="listeFournisseurs">
            ${
                typeof fournisseurs !== 'undefined' ? fournisseurs.map(f => `<option value="${f.nom}">`).join("") : ""
            }
            </datalist>
        </div>
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-bottom: 15px;">
            <div>
                <label style="font-size: 13px; font-weight: bold; color: #495057; display: block; margin-bottom: 5px;">📦 Code article</label>
                <input
                id="codeCommandeHDLP"
                type="text"
                inputmode="numeric"
                placeholder="Code direct"
                onkeydown="if(event.key==='Enter'){ rechercherCodeCommandeHDLP(); }"
                style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
            </div>
            <div style="display: flex; align-items: flex-end;">
                <button
                onclick="rechercherCodeCommandeHDLP()"
                style="height: 44px; padding: 0 15px; background: #0d6efd; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                ➡️ Aller
                </button>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <input
            id="rechercheCommandeHDLP"
            placeholder="🔍 Rechercher par article, code ou code fournisseur"
            oninput="chargerArticlesCommandeHDLP()"
            style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
        </div>
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 10px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="font-size: 14px; color: #666; display: block;">Total estimé</span>
                <span id="totalCommandeHDLP" style="font-size: 20px; font-weight: bold; color: #198754;">${totalInitial.toFixed(2)} €</span>
            </div>
            <button
            onclick="enregistrerCommandeHDLP()"
            style="background: #198754; color: white; border: none; padding: 12px 20px; font-weight: bold; font-size: 15px; border-radius: 8px; cursor: pointer;">
                ✅ Enregistrer
            </button>
        </div>
        <div id="contenuCommandeHDLP"></div>
    </div>
    `;
    chargerArticlesCommandeHDLP();
}

function rechercherCodeCommandeHDLP(){
    const code = document.getElementById("codeCommandeHDLP")?.value || "";
    if(code === "") return;
    const carte = document.getElementById("article_" + code);
    if(!carte){
        alert("Article introuvable");
        return;
    }
    carte.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
    carte.style.background = "#fff3cd";
    setTimeout(() => {
        carte.style.background = commandeHDLPArticles[code] ? "#f4fbf7" : "#fff";
    }, 2000);
    const destination = document.getElementById("destination_" + code);
    if(destination){
        destination.focus();
    }
}

function listeCommandesHDLP(){
    let html = `
    <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff;">
        <div style="margin-bottom: 15px;">
            <button onclick="ouvrirCommandeHDLP()" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                ⬅ Retour
            </button>
        </div>
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">📋 Commandes en attente</h2>
        <br>
    `;
    const commandesEnAttente = commandesHDLP.filter(c => c.statut === "EN ATTENTE");
    if(commandesEnAttente.length === 0){
        html += `
        <div style="text-align: center; padding: 40px; color: #666; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; font-size: 15px;">Aucune commande en attente.</p>
        </div>
        `;
    } else {
        commandesEnAttente.slice().reverse().forEach(cmd => {
            html += `
            <div style="border: 1px solid #e9ecef; border-radius: 10px; padding: 15px; margin-bottom: 15px; background: #fcfcfc; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">🚚 ${cmd.fournisseur}</h4>
                        <span style="font-size: 12px; color: #666;">📅 ${cmd.date}</span>
                    </div>
                    <span style="background: #fff3cd; color: #856404; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                        📌 ${cmd.statut}
                    </span>
                </div>
                <div style="display: flex; gap: 15px; margin-bottom: 15px; font-size: 14px;">
                    <span style="background: #e7f1ff; color: #0d6efd; padding: 4px 8px; border-radius: 6px; font-weight: bold;">
                        💰 ${Number(cmd.montantTotal || 0).toFixed(2)} €
                    </span>
                    <span style="background: #f1f3f5; color: #495057; padding: 4px 8px; border-radius: 6px; font-weight: bold;">
                        📦 ${cmd.articles.length} article(s)
                    </span>
                </div>
                <button
                onclick="ouvrirDetailCommandeHDLP('${cmd.id}')"
                style="width: 100%; background: #0d6efd; color: white; border: none; padding: 10px; font-weight: bold; border-radius: 6px; cursor: pointer;">
                    👁️ Ouvrir la commande
                </button>
            </div>
            `;
        });
    }
    html += `</div>`;
    document.getElementById("cards").innerHTML = html;
}

function chargerArticlesCommandeHDLP(){
    const fournisseur = document.getElementById("fournisseurCommandeHDLP")?.value || "";
    const recherche = document.getElementById("rechercheCommandeHDLP")?.value?.toLowerCase() || "";
    let html = "";

    // SÉCURITÉ : Récupération du catalogue (depuis la variable globale ou l'inventaire en localStorage)
    let catArticles = typeof catalogueArticles !== 'undefined' ? catalogueArticles : {};
    if(Object.keys(catArticles).length === 0){
        try {
            const inventaireStock = JSON.parse(localStorage.getItem("inventaireHDLP")) || {};
            Object.keys(inventaireStock).forEach(onglet => {
                inventaireStock[onglet].forEach(p => {
                    catArticles[p.code] = {
                        article: p.article,
                        codeFournisseur: p.codeFournisseur || "",
                        fournisseur: p.fournisseur || "",
                        prix: p.prix || 0,
                        colisage: p.colisage || 1
                    };
                });
            });
        } catch(e) {}
    }

    if(Object.keys(catArticles).length === 0){
        const contenu = document.getElementById("contenuCommandeHDLP");
        if(contenu) contenu.innerHTML = `<div style="text-align: center; padding: 20px; color: #666;">Aucun article disponible. Veuillez d'abord importer votre inventaire.</div>`;
        return;
    }

    Object.keys(catArticles).forEach(code => {
        const article = catArticles[code];
        
        if(fournisseur !== "" && String(article.fournisseur || "") !== fournisseur){
            return;
        }
        const match =
            String(article.article || "").toLowerCase().includes(recherche) ||
            String(code || "").toLowerCase().includes(recherche) ||
            String(article.codeFournisseur || "").toLowerCase().includes(recherche);
        if(recherche !== "" && !match){
            return;
        }
        const caveMemo = (typeof memoCaves !== 'undefined' ? memoCaves[code] : null) || destinationDefautHDLP;
        const dejaAjoute = Boolean(commandeHDLPArticles[code]);
        const cartonsVal = commandeHDLPCourante[code]?.cartons || 0;
        const piecesVal = commandeHDLPCourante[code]?.pieces || 0;
        const colisage = article.colisage || 1;
        const prix = article.prix || 0;
        const totalPcs = (cartonsVal * colisage) + piecesVal;
        const sousTotal = (totalPcs * prix).toFixed(2);
        html += `
        <div
        id="article_${code}"
        class="card"
        style="
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 15px;
            margin-bottom: 15px;
            background: ${dejaAjoute ? '#f4fbf7' : '#fff'};
            border: ${dejaAjoute ? '2px solid #198754' : '1px solid #e9ecef'};
            transition: all 0.2s ease;
        ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
                <div>
                    <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #333;">${article.article}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        <span style="background: #f1f3f5; padding: 3px 8px; border-radius: 5px; font-size: 12px; color: #495057; font-weight: 600;">
                            Code : ${code}
                        </span>
                        <span style="background: #f1f3f5; padding: 3px 8px; border-radius: 5px; font-size: 12px; color: #495057;">
                            Réf. fourn. : ${article.codeFournisseur || "-"}
                        </span>
                    </div>
                </div>
                <span style="background: #e7f1ff; color: #0d6efd; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; white-space: nowrap;">
                    🏢 ${article.fournisseur || "-"}
                </span>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                <span style="background: #e2f0d9; color: #2b542c; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    💶 Prix pièce : ${Number(prix).toFixed(2)} €
                </span>
                <span style="background: #fff3cd; color: #856404; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    📦 Colisage : ${colisage}
                </span>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">
            <div style="margin-bottom: 12px;">
                <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">
                    📍 Stock destination
                </label>
                <select
                id="destination_${code}"
                style="width: 100%; padding: 9px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; background: #fff; box-sizing: border-box;"
                onchange="
                    destinationDefautHDLP=this.value;
                    localStorage.setItem('destinationDefautHDLP', this.value);
                    document.getElementById('cartons_${code}').focus();
                "
                onkeydown="
                    if(event.key==='Enter'){
                        event.preventDefault();
                        document.getElementById('cartons_${code}').focus();
                    }
                ">
                    <option ${caveMemo==="HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                    <option ${caveMemo==="HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                    <option ${caveMemo==="HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                    <option ${caveMemo==="HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
                    <option ${caveMemo==="RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                    <option ${caveMemo==="RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
                    <option ${caveMemo==="RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
                </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">📦 Cartons</label>
                    <input
                    type="number"
                    id="cartons_${code}"
                    style="width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;"
                    onkeydown="
                        if(event.key==='Enter'){
                            event.preventDefault();
                            document.getElementById('pieces_${code}').focus();
                        }
                    "
                    value="${cartonsVal}"
                    oninput="calculCommandeHDLP('${code}', ${colisage}, ${prix})">
                </div>
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">🍾 Pièces</label>
                    <input
                    type="number"
                    id="pieces_${code}"
                    style="width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;"
                    onkeydown="
                        if(event.key==='Enter'){
                            event.preventDefault();
                            validerArticleCommandeHDLP(
                                '${code}',
                                '${article.article.replace(/'/g, "\\'")}',
                                ${colisage},
                                ${prix}
                            );
                        }
                    "
                    value="${piecesVal}"
                    oninput="calculCommandeHDLP('${code}', ${colisage}, ${prix})">
                </div>
            </div>
            <div id="total_${code}" style="background: #f8f9fa; padding: 8px 12px; border-radius: 6px; text-align: right; font-weight: bold; color: #333; font-size: 14px; margin-bottom: 12px;">
                ${totalPcs} pièce(s) - ${sousTotal} €
            </div>
            <button
            onclick="
                validerArticleCommandeHDLP(
                    '${code}',
                    '${article.article.replace(/'/g, "\\'")}',
                    ${colisage},
                    ${prix}
                )
            "
            style="width: 100%; background: #198754; color: white; border: none; padding: 11px; font-weight: bold; font-size: 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                ✅ OK
            </button>
        </div>
        `;
    });
    document.getElementById("contenuCommandeHDLP").innerHTML = html;
}

function calculCommandeHDLP(code, colisage, prix){
    const cartons = Number(document.getElementById("cartons_" + code)?.value || 0);
    const pieces = Number(document.getElementById("pieces_" + code)?.value || 0);
    
    commandeHDLPCourante[code] = {
        cartons: cartons,
        pieces: pieces
    };
    
    const totalPieces = (cartons * colisage) + pieces;
    const montant = totalPieces * prix;
    const zone = document.getElementById("total_" + code);
    
    if(zone){
        zone.innerHTML = totalPieces + " pièce(s) - " + montant.toFixed(2) + " €";
    }
}

function validerArticleCommandeHDLP(code, articleNom, colisage, prix){
    const cartons = Number(document.getElementById("cartons_" + code)?.value || 0);
    const pieces = Number(document.getElementById("pieces_" + code)?.value || 0);
    const destination = document.getElementById("destination_" + code)?.value || "";
    destinationDefautHDLP = destination;
    localStorage.setItem("destinationDefautHDLP", destination);
    
    if(typeof memoCaves !== 'undefined') memoCaves[code] = destination;
    if(cartons <= 0 && pieces <= 0){
        delete commandeHDLPArticles[code];
        delete commandeHDLPCourante[code];
        const totalCommande = Object.values(commandeHDLPArticles).reduce((total, a) => total + Number(a.montant || 0), 0);
        const zoneTotal = document.getElementById("totalCommandeHDLP");
        if(zoneTotal) zoneTotal.innerHTML = totalCommande.toFixed(2) + " €";
        alert("Aucune quantité saisie");
        return;
    }
    const totalPieces = (cartons * colisage) + pieces;
    const montant = totalPieces * prix;
    commandeHDLPArticles[code] = {
        code: code,
        article: articleNom,
        codeFournisseur: (typeof catalogueArticles !== 'undefined' && catalogueArticles[code]?.codeFournisseur) || "",
        cartons: cartons,
        pieces: pieces,
        colisage: colisage,
        totalPieces: totalPieces,
        prix: prix,
        montant: montant,
        destination: destination
    };
    const totalCommande = Object.values(commandeHDLPArticles).reduce((total, a) => total + Number(a.montant || 0), 0);
    const zoneTotal = document.getElementById("totalCommandeHDLP");
    if(zoneTotal){
        zoneTotal.innerHTML = totalCommande.toFixed(2) + " €";
    }
    const carte = document.getElementById("article_" + code);
    if(carte){
        carte.style.background = "#f4fbf7";
        carte.style.border = "2px solid #198754";
    }
    const champCode = document.getElementById("codeCommandeHDLP");
    if(champCode){
        champCode.focus();
        champCode.select();
    }
    alert(articleNom + " ajouté à la commande ✅");
}

function enregistrerCommandeHDLP(){
    const fournisseur = document.getElementById("fournisseurCommandeHDLP")?.value || "";
    if(fournisseur === ""){
        alert("Choisissez un fournisseur");
        return;
    }
    const articlesCommande = Object.values(commandeHDLPArticles);
    if(articlesCommande.length === 0){
        alert("Aucun article validé");
        return;
    }
    const montantTotal = articlesCommande.reduce((total, a) => total + Number(a.montant || 0), 0);
    
    commandesHDLP.push({
        id: crypto.randomUUID(),
        fournisseur: fournisseur,
        date: new Date().toLocaleString(),
        statut: "EN ATTENTE",
        montantTotal: montantTotal,
        articles: articlesCommande
    });
    
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    commandeHDLPArticles = {};
    commandeHDLPCourante = {};
    alert("Commande enregistrée ✅");
    listeCommandesHDLP();
}

function ouvrirDetailCommandeHDLP(id){
    const commande = commandesHDLP.find(c => c.id === id);
    if(!commande) return;
    let html = `
    <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff;">
        <div style="margin-bottom: 15px;">
            <button onclick="${commande.statut === 'EN ATTENTE' ? 'listeCommandesHDLP()' : 'listeCommandesReceptionneesHDLP()'}" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                ⬅ Retour
            </button>
        </div>
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">🚚 ${commande.fournisseur}</h2>
        <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
            📅 ${commande.date}
            ${commande.dateReception ? `<br>🚚 Réception : ${commande.dateReception}` : ""}
            ${commande.dateFacture ? `<br>🧾 Facture : ${commande.dateFacture}` : ""}
            <br>📌 Statut : <b>${commande.statut}</b>
        </div>
        ${commande.statut === "RECEPTIONNEE" ? `
        <div style="background: #f8f9fa; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;">
            <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 14px; cursor: pointer;">
                <input
                type="checkbox"
                id="factureRecueHDLP_${commande.id}"
                ${commande.factureRecue ? "checked" : ""}
                onchange="majFactureRecueHDLP('${commande.id}')"
                style="width: 16px; height: 16px; cursor: pointer;">
                🧾 Facture reçue
            </label>
        </div>
        ` : ""}
    </div>
    `;
    commande.articles.forEach(article => {
        html += `
        <div
        id="article_${article.code}"
        class="card"
        style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 15px; margin-bottom: 15px; background: #fff;">
            <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${article.article}</h4>
            <span style="background: #f1f3f5; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #555; font-weight: 500;">
                Code : ${article.code}
            </span>
            <br><br>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">Code fournisseur</label>
                    <input
                    type="text"
                    id="codeFournisseur_${commande.id}_${article.code}"
                    value="${article.codeFournisseur || ""}"
                    style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
                </div>
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">Destination</label>
                    <select
                    id="destination_${commande.id}_${article.code}"
                    style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; background: white; box-sizing: border-box;">
                        <option ${article.destination==="HDLP SOFT" ? "selected" : ""}>HDLP SOFT</option>
                        <option ${article.destination==="HDLP BAR" ? "selected" : ""}>HDLP BAR</option>
                        <option ${article.destination==="HDLP MINI BAR" ? "selected" : ""}>HDLP MINI BAR</option>
                        <option ${article.destination==="HDLP SEMINAIRE" ? "selected" : ""}>HDLP SEMINAIRE</option>
                        <option ${article.destination==="RCLP SOFT" ? "selected" : ""}>RCLP SOFT</option>
                        <option ${article.destination==="RCLP VIN" ? "selected" : ""}>RCLP VIN</option>
                        <option ${article.destination==="RCLP ALCOOL" ? "selected" : ""}>RCLP ALCOOL</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">Cartons</label>
                        <input
                        type="number"
                        id="cartons_${commande.id}_${article.code}"
                        value="${article.cartons}"
                        oninput="recalculerDetailCommandeHDLP('${commande.id}', '${article.code}', ${article.colisage})"
                        style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;">
                    </div>
                    <div>
                        <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">Pièces</label>
                        <input
                        type="number"
                        id="pieces_${commande.id}_${article.code}"
                        value="${article.pieces}"
                        oninput="recalculerDetailCommandeHDLP('${commande.id}', '${article.code}', ${article.colisage})"
                        style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; text-align: center;">
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 8px 12px; border-radius: 6px; font-size: 14px;">
                    Total : <span id="totalDetail_${article.code}" style="font-weight: bold;">${article.totalPieces}</span> pièce(s)
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">Prix réception (€)</label>
                        <input
                        type="number"
                        step="0.01"
                        id="prixReception_${commande.id}_${article.code}"
                        value="${article.prix}"
                        oninput="majMontantReceptionHDLP('${commande.id}', '${article.code}')"
                        style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 13px; font-weight: 600; color: #495057; display: block; margin-bottom: 4px;">Montant total (€)</label>
                        <input
                        type="number"
                        step="0.01"
                        id="montantReception_${commande.id}_${article.code}"
                        value="${Number(article.montant || 0).toFixed(2)}"
                        oninput="majPrixReceptionHDLP('${commande.id}', '${article.code}', ${article.totalPieces})"
                        style="width: 100%; padding: 8px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
                    </div>
                </div>
            </div>
            <br>
            <button
            style="width: 100%; background: #dc3545; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer;"
            onclick="supprimerLigneCommandeHDLP('${commande.id}', '${article.code}')">
                🗑️ Supprimer la ligne
            </button>
        </div>
        `;
    });
    html += `
    <div class="card" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px; background: #fff;">
        <div style="font-size: 16px; margin-bottom: 15px;">
            Total commande : <b style="color: #198754;">${Number(commande.montantTotal || 0).toFixed(2)} €</b>
        </div>
        <button
        style="width: 100%; background: #0d6efd; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer;"
        onclick="ajouterProduitCommandeHDLP('${commande.id}')">
            ➕ Ajouter un produit
        </button>
    </div>
    `;
    if(commande.statut === "EN ATTENTE"){
        html += `
        <div class="card" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px; background: #fff; display: flex; flex-direction: column; gap: 10px;">
            <button onclick="sauvegarderCommandeHDLP('${commande.id}')" style="width: 100%; background: #6c757d; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                💾 Sauvegarder
            </button>
            <button style="width: 100%; background: #28a745; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer;" onclick="receptionnerCommandeHDLP('${commande.id}')">
                ✅ Réceptionner
            </button>
            <button style="width: 100%; background: #dc3545; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer;" onclick="supprimerCommandeHDLP('${commande.id}')">
                🗑️ Supprimer la commande
            </button>
        </div>
        `;
    } else {
        html += `
        <div class="card" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px; background: #fff; display: flex; flex-direction: column; gap: 10px;">
            <button style="width: 100%; background: #ffc107; color: black; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer;" onclick="mettreAJourFactureHDLP('${commande.id}')">
                💰 Mettre à jour avec la facture
            </button>
            <button style="width: 100%; background: #dc3545; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer;" onclick="supprimerCommandeReceptionneeHDLP('${commande.id}')">
                ↩️ Annuler la réception
            </button>
            <button onclick="sauvegarderCommandeHDLP('${commande.id}')" style="width: 100%; background: #6c757d; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                💾 Sauvegarder les modifications
            </button>
        </div>
        `;
    }
    document.getElementById("cards").innerHTML = html;
}

function ajouterProduitCommandeHDLP(commandeId){
    const commande = commandesHDLP.find(c => c.id === commandeId);
    if(!commande) return;
    const recherche = prompt("Code ou nom de l'article");
    if(!recherche) return;
    
    let catArticles = typeof catalogueArticles !== 'undefined' ? catalogueArticles : {};
    const articleTrouveEntry = Object.entries(catArticles).find(([code, a]) =>
        String(a.article || "").toLowerCase().includes(recherche.toLowerCase()) ||
        String(code).toLowerCase().includes(recherche.toLowerCase()) ||
        String(a.codeFournisseur || "").toLowerCase().includes(recherche.toLowerCase())
    );
    if(!articleTrouveEntry){
        alert("Article introuvable");
        return;
    }
    const codeTrouve = articleTrouveEntry[0];
    const articleTrouve = articleTrouveEntry[1];
    const existe = commande.articles.find(a => String(a.code) === String(codeTrouve));
    if(existe){
        alert("Cet article est déjà présent");
        return;
    }
    commande.articles.push({
        code: codeTrouve,
        article: articleTrouve.article,
        codeFournisseur: articleTrouve.codeFournisseur || "",
        cartons: 0,
        pieces: 0,
        colisage: Number(articleTrouve.colisage || 1),
        totalPieces: 0,
        prix: Number(articleTrouve.prix || 0),
        montant: 0,
        destination: (typeof memoCaves !== 'undefined' ? memoCaves[codeTrouve] : null) || "HDLP BAR"
    });
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    ouvrirDetailCommandeHDLP(commandeId);
    alert("Article ajouté ✅");
}

function sauvegarderCommandeHDLP(id){
    const commande = commandesHDLP.find(c => c.id === id);
    if(!commande) return;
    commande.articles.forEach(article => {
        article.cartons = Number(document.getElementById(`cartons_${id}_${article.code}`)?.value || 0);
        article.pieces = Number(document.getElementById(`pieces_${id}_${article.code}`)?.value || 0);
        article.destination = document.getElementById(`destination_${id}_${article.code}`)?.value || "";
        if(typeof memoCaves !== 'undefined') memoCaves[article.code] = article.destination;
        article.codeFournisseur = document.getElementById(`codeFournisseur_${id}_${article.code}`)?.value || "";
        
        if(typeof catalogueArticles !== 'undefined' && catalogueArticles[article.code]){
            catalogueArticles[article.code].codeFournisseur = article.codeFournisseur;
        }
        article.prix = Number(document.getElementById(`prixReception_${id}_${article.code}`)?.value || 0);
        article.totalPieces = (article.cartons * Number(article.colisage || 1)) + article.pieces;
        article.montant = article.totalPieces * article.prix;
    });
    commande.montantTotal = commande.articles.reduce((total, a) => total + Number(a.montant || 0), 0);
    if(typeof save === 'function') save();
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    alert("Commande mise à jour ✅");
    ouvrirDetailCommandeHDLP(id);
}

function recalculerDetailCommandeHDLP(id, code, colisage){
    const cartons = Number(document.getElementById(`cartons_${id}_${code}`)?.value || 0);
    const pieces = Number(document.getElementById(`pieces_${id}_${code}`)?.value || 0);
    const totalPieces = (cartons * colisage) + pieces;
    const zone = document.getElementById(`totalDetail_${code}`);
    if(zone){
        zone.innerHTML = totalPieces;
    }
}

function receptionnerCommandeHDLP(id){
    const commande = commandesHDLP.find(c => c.id === id);
    if(!commande) return;
    if(commande.statut === "RECEPTIONNEE") return;
    if(!confirm("Confirmer la réception de la commande ?")) return;
    const historiqueGlobal = JSON.parse(localStorage.getItem("mouvements")) || [];
    commande.articles.forEach(article => {
        article.prix = Number(document.getElementById(`prixReception_${id}_${article.code}`)?.value || article.prix || 0);
        const montantReception = Number(document.getElementById(`montantReception_${id}_${article.code}`)?.value || article.montant || 0);
        const prixReception = article.totalPieces > 0 ? montantReception / article.totalPieces : 0;
        article.prix = prixReception;
        
        const destination = article.destination;
        const code = String(article.code);
        if(typeof memoCaves !== 'undefined') memoCaves[code] = destination;
        
        if(typeof stockParCave !== 'undefined') {
            if(!stockParCave[destination]) stockParCave[destination] = {};
            const stockActuel = Number(stockParCave[destination][code] || 0);
            stockParCave[destination][code] = stockActuel + Number(article.totalPieces || 0);
        }
        
        if(typeof catalogueArticles !== 'undefined' && catalogueArticles[code]){
            catalogueArticles[code].prix = Number(prixReception.toFixed(2));
            catalogueArticles[code].codeFournisseur = article.codeFournisseur || "";
        }
        
        historiqueGlobal.push({
            date: new Date().toISOString(),
            code: code,
            article: article.article,
            cave: destination,
            type: "ENTREE",
            quantite: Number(article.totalPieces || 0),
            origine: "COMMANDE HDLP",
            fournisseur: commande.fournisseur || ""
        });
    });
    commande.statut = "RECEPTIONNEE";
    commande.dateReception = new Date().toLocaleString();
    commande.dateReceptionISO = new Date().toISOString().split("T")[0];
    commande.factureRecue = false;
    if(typeof save === 'function') save();
    localStorage.setItem("mouvements", JSON.stringify(historiqueGlobal));
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    alert("✅ Commande réceptionnée");
    ouvrirDetailCommandeHDLP(id);
}

function majPrixReceptionHDLP(commandeId, code, totalPieces){
    const montant = Number(document.getElementById(`montantReception_${commandeId}_${code}`)?.value || 0);
    if(totalPieces <= 0) return;
    const nouveauPrix = montant / totalPieces;
    const champPrix = document.getElementById(`prixReception_${commandeId}_${code}`);
    if(champPrix){
        champPrix.value = nouveauPrix.toFixed(4);
    }
}

function majMontantReceptionHDLP(commandeId, code){
    const commande = commandesHDLP.find(c => c.id === commandeId);
    if(!commande) return;
    const article = commande.articles.find(a => String(a.code) === String(code));
    if(!article) return;
    const prix = Number(document.getElementById(`prixReception_${commandeId}_${code}`)?.value || 0);
    const montant = prix * Number(article.totalPieces || 0);
    const champMontant = document.getElementById(`montantReception_${commandeId}_${code}`);
    if(champMontant){
        champMontant.value = montant.toFixed(2);
    }
}

function supprimerLigneCommandeHDLP(commandeId, code){
    const commande = commandesHDLP.find(c => c.id === commandeId);
    if(!commande) return;
    commande.articles = commande.articles.filter(a => String(a.code) !== String(code));
    commande.montantTotal = commande.articles.reduce((total, a) => total + Number(a.montant || 0), 0);
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    ouvrirDetailCommandeHDLP(commandeId);
}

function listeCommandesReceptionneesHDLP(){
    const champRecherche = document.getElementById("rechercheReceptionHDLP");
    if(champRecherche){ filtreRechercheReceptionHDLP = champRecherche.value.toLowerCase(); }
    const recherche = filtreRechercheReceptionHDLP;
    
    const champDateDebut = document.getElementById("dateDebutReceptionHDLP");
    if(champDateDebut){ filtreDateDebutReceptionHDLP = champDateDebut.value; }
    const dateDebut = filtreDateDebutReceptionHDLP;
    
    const champDateFin = document.getElementById("dateFinReceptionHDLP");
    if(champDateFin){ filtreDateFinReceptionHDLP = champDateFin.value; }
    const dateFin = filtreDateFinReceptionHDLP;
    
    const caseFactureRecue = document.getElementById("factureRecueFiltre");
    if(caseFactureRecue){ filtreFactureReceptionHDLP = caseFactureRecue.checked; }
    const factureRecueSeulement = filtreFactureReceptionHDLP;

    const caseFactureManquante = document.getElementById("factureManquanteFiltre");
    const factureManquanteSeulement = caseFactureManquante ? caseFactureManquante.checked : false;

    let html = `
    <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff;">
        <div style="margin-bottom: 15px;">
            <button onclick="ouvrirCommandeHDLP()" style="padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; background: #f8f9fa;">
                ⬅ Retour
            </button>
        </div>
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">✅ Commandes HDLP réceptionnées</h2>
        <br>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px;">
            <div>
                <label style="font-size: 13px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">🔍 Recherche</label>
                <input
                id="rechercheReceptionHDLP"
                value="${recherche}"
                placeholder="Fournisseur ou article..."
                onkeyup="filtrerReceptionHDLP()"
                style="width: 100%; padding: 9px; font-size: 15px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">📅 Du</label>
                    <input
                    type="date"
                    id="dateDebutReceptionHDLP"
                    value="${dateDebut}"
                    onchange="listeCommandesReceptionneesHDLP()"
                    style="width: 100%; padding: 8px; font-size: 14px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; background: white;">
                </div>
                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #495057; display: block; margin-bottom: 4px;">📅 Au</label>
                    <input
                    type="date"
                    id="dateFinReceptionHDLP"
                    value="${dateFin}"
                    onchange="listeCommandesReceptionneesHDLP()"
                    style="width: 100%; padding: 8px; font-size: 14px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; background: white;">
                </div>
            </div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 14px; cursor: pointer;">
                    <input
                    type="checkbox"
                    id="factureRecueFiltre"
                    ${factureRecueSeulement ? "checked" : ""}
                    onchange="listeCommandesReceptionneesHDLP()"
                    style="width: 16px; height: 16px; cursor: pointer;">
                    Facture reçue uniquement
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 14px; cursor: pointer;">
                    <input
                    type="checkbox"
                    id="factureManquanteFiltre"
                    ${factureManquanteSeulement ? "checked" : ""}
                    onchange="listeCommandesReceptionneesHDLP()"
                    style="width: 16px; height: 16px; cursor: pointer;">
                    Facture manquante uniquement
                </label>
            </div>
        </div>
    `;
    let commandesReceptionnees = commandesHDLP.filter(c => c.statut === "RECEPTIONNEE");
    commandesReceptionnees = commandesReceptionnees.filter(cmd => {
        const matchRecherche = recherche === "" || 
            cmd.fournisseur?.toLowerCase().includes(recherche) || 
            cmd.articles.some(a => a.article?.toLowerCase().includes(recherche));
        
        const dateCommande = cmd.dateReceptionISO || "";
        const matchDateDebut = dateDebut === "" || dateCommande >= dateDebut;
        const matchDateFin = dateFin === "" || dateCommande <= dateFin;
        
        let matchFacture = true;
        if (factureRecueSeulement) {
            matchFacture = cmd.factureRecue === true;
        } else if (factureManquanteSeulement) {
            matchFacture = !cmd.factureRecue;
        }

        return matchRecherche && matchDateDebut && matchDateFin && matchFacture;
    });

    if(commandesReceptionnees.length === 0){
        html += `
        <div style="text-align: center; padding: 30px; color: #666; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; font-size: 15px;">Aucune commande trouvée.</p>
        </div>
        `;
    } else {
        commandesReceptionnees.slice().reverse().forEach(cmd => {
            html += `
            <div
            class="card commandeReceptionHDLP"
            data-fournisseur="${cmd.fournisseur}"
            data-articles="${cmd.articles.map(a => a.article).join(' ')}"
            style="border: 1px solid #e9ecef; border-radius: 10px; padding: 15px; margin-bottom: 15px; background: #fcfcfc; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">🚚 ${cmd.fournisseur}</h4>
                        <span style="font-size: 12px; color: #666;">📅 ${cmd.dateReception || cmd.date}</span>
                    </div>
                    <span style="background: ${cmd.factureRecue ? '#d1e7dd' : '#f8d7da'}; color: ${cmd.factureRecue ? '#0f5132' : '#842029'}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                        ${cmd.factureRecue ? "Facture reçue ✅" : "Facture manquante ❌"}
                    </span>
                </div>
                <div style="display: flex; gap: 15px; margin-bottom: 15px; font-size: 14px;">
                    <span style="background: #e7f1ff; color: #0d6efd; padding: 4px 8px; border-radius: 6px; font-weight: bold;">
                        💰 ${Number(cmd.montantTotal || 0).toFixed(2)} €
                    </span>
                    <span style="background: #f1f3f5; color: #495057; padding: 4px 8px; border-radius: 6px; font-weight: bold;">
                        📦 ${cmd.articles.length} article(s)
                    </span>
                </div>
                <button
                onclick="ouvrirDetailCommandeHDLP('${cmd.id}')"
                style="width: 100%; background: #0d6efd; color: white; border: none; padding: 10px; font-weight: bold; border-radius: 6px; cursor: pointer;">
                    👁️ Ouvrir la commande
                </button>
            </div>
            `;
        });
    }
    html += `</div>`;
    document.getElementById("cards").innerHTML = html;
}
function mettreAJourFactureHDLP(id){
    const commande = commandesHDLP.find(c => c.id === id);
    if(!commande) return;
    commande.articles.forEach(article => {
        article.codeFournisseur = document.getElementById(`codeFournisseur_${id}_${article.code}`)?.value || "";
        const prixFacture = Number(document.getElementById(`prixReception_${id}_${article.code}`)?.value || 0);
        const montantFacture = Number(document.getElementById(`montantReception_${id}_${article.code}`)?.value || 0);
        article.prix = prixFacture;
        article.montant = montantFacture;
        
        const code = String(article.code);
        if(typeof catalogueArticles !== 'undefined' && catalogueArticles[code]){
            catalogueArticles[code].prix = Number(prixFacture.toFixed(2));
            catalogueArticles[code].codeFournisseur = article.codeFournisseur;
        }
    });
    commande.montantTotal = commande.articles.reduce((total, a) => total + Number(a.montant || 0), 0);
    commande.dateFacture = new Date().toLocaleString();
    if(typeof save === 'function') save();
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    alert("✅ Facture enregistrée");
    ouvrirDetailCommandeHDLP(id);
}

function supprimerCommandeHDLP(id){
    if(!confirm("Supprimer cette commande ?")) return;
    commandesHDLP = commandesHDLP.filter(c => c.id !== id);
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    alert("Commande supprimée ✅");
    listeCommandesHDLP();
}

function supprimerCommandeReceptionneeHDLP(id){
    const commande = commandesHDLP.find(c => c.id === id);
    if(!commande) return;
    if(!confirm("La réception va être annulée et les stocks seront retirés. Continuer ?")) return;
    commande.articles.forEach(article => {
        const destination = article.destination;
        const code = String(article.code);
        if(typeof stockParCave !== 'undefined' && stockParCave[destination] && stockParCave[destination][code] !== undefined){
            stockParCave[destination][code] = Number(stockParCave[destination][code] || 0) - Number(article.totalPieces || 0);
            if(stockParCave[destination][code] <= 0){
                delete stockParCave[destination][code];
            }
        }
    });
    commandesHDLP = commandesHDLP.filter(c => c.id !== id);
    if(typeof save === 'function') save();
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
    alert("Réception annulée ✅");
    listeCommandesReceptionneesHDLP();
}

function majFactureRecueHDLP(id){
    const commande = commandesHDLP.find(c => c.id === id);
    if(!commande) return;
    const caseFacture = document.getElementById(`factureRecueHDLP_${id}`);
    commande.factureRecue = caseFacture?.checked || false;
    localStorage.setItem("commandesHDLP", JSON.stringify(commandesHDLP));
}

function filtrerReceptionHDLP(){
    const recherche = document.getElementById("rechercheReceptionHDLP").value.toLowerCase();
    document.querySelectorAll(".commandeReceptionHDLP").forEach(carte => {
        const fournisseur = (carte.dataset.fournisseur || "").toLowerCase();
        const articles = (carte.dataset.articles || "").toLowerCase();
        const visible = fournisseur.includes(recherche) || articles.includes(recherche);
        carte.style.display = visible ? "" : "none";
    });
}
