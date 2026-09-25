
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

const carouselFlare = `
@media(max-width: 480px) {
    .carousel-card-info::before {
        content: "? ENVÍO GRATIS";
        display: inline-block;
        font-size: 0.65rem;
        background: #2ed573;
        color: #000;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-weight: 800;
        letter-spacing: 0.5px;
        margin-bottom: 0.4rem;
    }
}
`;

if (!css.includes("ENVÍO GRATIS")) {
    css += "\n" + carouselFlare;
    fs.writeFileSync("styles.css", css);
}
console.log("Carousel flare added");

