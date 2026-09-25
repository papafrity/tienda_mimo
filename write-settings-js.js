
const fs = require("fs");
let js = fs.readFileSync("admin.js", "utf8");

const settingsJs = `
// --- SETTINGS TAB LOGIC ---
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
if (saveSettingsBtn) {
    // Load existing settings
    db.collection("settings").doc("transfer").get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if(document.getElementById("adminTransferDiscount")) document.getElementById("adminTransferDiscount").value = data.discount || 0;
            if(document.getElementById("adminTransferCbu")) document.getElementById("adminTransferCbu").value = data.cbu || "";
            if(document.getElementById("adminTransferAlias")) document.getElementById("adminTransferAlias").value = data.alias || "";
            if(document.getElementById("adminTransferName")) document.getElementById("adminTransferName").value = data.name || "";
        }
    });

    saveSettingsBtn.addEventListener("click", async () => {
        saveSettingsBtn.textContent = "Guardando...";
        saveSettingsBtn.disabled = true;
        try {
            await db.collection("settings").doc("transfer").set({
                discount: parseFloat(document.getElementById("adminTransferDiscount").value) || 0,
                cbu: document.getElementById("adminTransferCbu").value,
                alias: document.getElementById("adminTransferAlias").value,
                name: document.getElementById("adminTransferName").value
            });
            alert("Configuración guardada correctamente");
        } catch (e) {
            console.error(e);
            alert("Error guardando configuración");
        }
        saveSettingsBtn.textContent = "Guardar Configuración";
        saveSettingsBtn.disabled = false;
    });
}
`;

if (!js.includes("SETTINGS TAB LOGIC")) {
    fs.writeFileSync("admin.js", js + "\n" + settingsJs);
    console.log("Settings JS added");
}

