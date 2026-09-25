
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

// I will globally move the back-to-top button to bottom 6.5rem so it does not overlap the chatbot.
const override = `
/* GLOBAL OVERRIDE FOR BACK TO TOP */
.back-to-top {
    bottom: 6.5rem !important;
}
`;

if (!css.includes("GLOBAL OVERRIDE FOR BACK TO TOP")) {
    fs.writeFileSync("styles.css", css + "\n" + override);
    console.log("BTT fixed globally");
}

