with open("admin.js", "r", encoding="utf-8") as f:
    js = f.read()

js = js.replace('An\ufffdnimo', 'Anónimo')
js = js.replace('Rese\ufffda', 'Reseña')
js = js.replace('rese\ufffda', 'reseña')
js = js.replace('a\ufffdadida', 'añadida')
js = js.replace('Configuraci\ufffdn', 'Configuración')
js = js.replace('configuraci\ufffdn', 'configuración')

with open("admin.js", "w", encoding="utf-8") as f:
    f.write(js)
print("admin.js user-introduced encoding fixed!")
