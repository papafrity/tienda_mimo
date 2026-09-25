# Project Rules & Custom Behaviors

## Modo Pantalla / Browser Agent Activation
- **Palabra clave de activación:** `!pantalla`
- **Regla estricta:** NO ejecutar herramientas de automatización de navegador, interacción con pantalla ni Puppeteer/MCP a menos que el usuario incluya explícitamente la palabra clave `!pantalla` en su mensaje.
- **Comportamiento con `!pantalla`:** Cuando el usuario escriba `!pantalla` en su petición (por ejemplo: `!pantalla prueba agregar un producto y ver el carrito`), activa el modo agente de navegador para navegar la web, hacer clics, probar flujos o tomar capturas según lo solicitado.
- **Comportamiento sin `!pantalla`:** Trabaja exclusivamente en modo código (editando archivos HTML/CSS/JS y ejecutando comandos locales de terminal) para ahorrar tokens y créditos al máximo.
