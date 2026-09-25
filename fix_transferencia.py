with open("transferencia.html", "r", encoding="utf-8") as f:
    html = f.read()

html = html.replace('\ufffdPedido', '¡Pedido')
html = html.replace('env\ufffdanos', 'envíanos')
html = html.replace('\ufffdHola!', '¡Hola!')
html = html.replace('Aqu\ufffd te', 'Aquí te')

with open("transferencia.html", "w", encoding="utf-8") as f:
    f.write(html)
print("transferencia.html fixed")
