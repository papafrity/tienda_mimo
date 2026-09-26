
with open("admin.js", "a", encoding="utf-8") as f:
    f.write("\n\n// Toggle Left Menu\nconst toggleMenuBtn = document.getElementById(\"toggleMenuBtn\");\nif (toggleMenuBtn) {\n    toggleMenuBtn.addEventListener(\"click\", () => {\n        document.getElementById(\"dashboard\").classList.toggle(\"menu-collapsed\");\n    });\n}\n")

