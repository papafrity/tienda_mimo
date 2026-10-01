# Estrategia de Cuotas y Costos

## [Análisis del Problema]
El problema tiene dos partes:
1. **El interés de las cuotas:** Quieres absorber el 6.49% si el cliente paga en 1 pago, pero quieres que si elige cuotas, el costo de financiación (interés) lo pague el cliente, ya que si no, te quedas sin ganancia.
2. **Visualización en la tienda:** Quieres mostrar en las tarjetas de producto el valor de la cuota (Ej: "3 cuotas de $X") para que los productos caros (como los de 1 millón) parezcan más accesibles.

### 1. La solución para quién paga el interés (No requiere código)
En Argentina, Mercado Pago cobra dos cosas distintas:
- **La comisión por procesamiento (6.49%):** Se cobra siempre, incluso en 1 pago. (Esta es la que decidimos dejar absorbida en el precio de tu web).
- **El costo de financiación (Interés por cuotas):** Este costo se lo cobra al comprador **automáticamente**, a menos que vos actives la opción "Ofrecer Cuotas Sin Interés" en tu panel de Mercado Pago. 
**Solución:** No tenés que hacer nada en el código. Solo asegurate de entrar a tu cuenta de Mercado Pago > Tu Negocio > Costos y configurar para **NO** ofrecer cuotas sin interés. De esa forma, vos recibís la plata completa (menos el 6.49%) y el cliente paga el interés de las cuotas.

### 2. El problema de mostrar el precio de la cuota en la web
Si el cliente va a pagar el interés, **la cuota NO es simplemente el precio dividido la cantidad de cuotas**. 
Por ejemplo: Si el producto vale $100.000, y el cliente elige 3 cuotas, Mercado Pago le va a aplicar un interés (ej: 25% extra). El total será $125.000, y la cuota será de $41.666.
Si en tu tienda mostrás "3 cuotas de $33.333" (dividiendo por 3 sin interés), cuando el cliente vaya a pagar y vea que Mercado Pago le cobra $41.666, se va a sentir engañado y va a abandonar la compra.

## Proposed Changes (Solución Técnica)

Para solucionar esto de forma profesional y transparente, propongo lo siguiente:

### 1. Configuración de Coeficientes de MP
Crearemos una pequeña tabla de configuración en tu base de datos donde puedas ingresar el "recargo" que cobra Mercado Pago por las cuotas. 
Ejemplo: Si MP cobra 20% por 3 cuotas, el coeficiente será `1.20`.

### 2. Actualizar las Tarjetas de Producto
Modificaremos `index.html` y `script.js` para que debajo del precio del producto aparezca un texto atractivo y dinámico:
`💳 3 cuotas fijas de $X`
Donde `$X` será calculado matemáticamente en tiempo real usando tu precio y el coeficiente de interés.

#### [MODIFY] script.js
Agregaremos la lógica para calcular y renderizar las cuotas.
```javascript
// Ejemplo del código propuesto para calcular la cuota
const cuotas = 3;
const coeficienteMP = 1.20; // Esto vendrá de la configuración
const precioConInteres = p.price * coeficienteMP;
const valorCuota = precioConInteres / cuotas;

const cuotasHtml = `<div class="installment-info">
    💳 ${cuotas} cuotas fijas de $${fmt(valorCuota)}
</div>`;
```

#### [MODIFY] styles.css
Agregaremos estilos elegantes para resaltar la opción de cuotas en verde o violeta en las tarjetas y en el modal del producto.

## User Review Required
**Por favor, decime si estás de acuerdo con este plan:**
1. Mantenemos el 6.49% absorbido en el precio base.
2. Desactivás las "Cuotas sin interés" en tu cuenta de MP.
3. Yo modifico la tienda para que muestre el cálculo matemático de las "Cuotas Fijas" con el interés real incluido, así mostramos una cuota más baja y realista sin mentirle al cliente.
