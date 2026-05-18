@echo off
color 0b
echo ====================================================
echo      ACTUALIZANDO TIENDA MIMO EN GITHUB PAGES       
echo ====================================================
echo.

echo [1/3] Guardando archivos...
git add .
echo.

echo [2/3] Creando version...
git commit -m "Actualizacion rapida de Tienda Mimo"
echo.

echo [3/3] Subiendo a la web...
git push origin main
echo.

echo ====================================================
echo  ¡LISTO! Los cambios han sido subidos a GitHub.
echo  Tu pagina se actualizara en un par de minutos.
echo ====================================================
pause
