@echo off
color 0b
echo ====================================================
echo      PANEL ADMIN - MIMO! TIENDA                     
echo ====================================================
echo.
echo Iniciando servidor local...
echo.

:: Intentar con Python 3
where python >nul 2>nul
if %errorlevel%==0 (
    echo Usando Python para el servidor local...
    echo.
    echo ====================================================
    echo  Panel Admin disponible en:
    echo  http://localhost:8080/admin.html
    echo.
    echo  NO CIERRES esta ventana mientras uses el panel.
    echo  Para cerrar, presiona CTRL+C o cierra la ventana.
    echo ====================================================
    echo.
    start http://localhost:8080/admin.html
    python -m http.server 8080
    goto end
)

:: Intentar con Python (py launcher)
where py >nul 2>nul
if %errorlevel%==0 (
    echo Usando Python para el servidor local...
    echo.
    echo ====================================================
    echo  Panel Admin disponible en:
    echo  http://localhost:8080/admin.html
    echo.
    echo  NO CIERRES esta ventana mientras uses el panel.
    echo  Para cerrar, presiona CTRL+C o cierra la ventana.
    echo ====================================================
    echo.
    start http://localhost:8080/admin.html
    py -m http.server 8080
    goto end
)

:: Intentar con npx serve (Node.js)
where npx >nul 2>nul
if %errorlevel%==0 (
    echo Usando Node.js para el servidor local...
    echo.
    echo ====================================================
    echo  Panel Admin disponible en:
    echo  http://localhost:8080/admin.html
    echo.
    echo  NO CIERRES esta ventana mientras uses el panel.
    echo  Para cerrar, presiona CTRL+C o cierra la ventana.
    echo ====================================================
    echo.
    start http://localhost:8080/admin.html
    npx -y serve -l 8080 .
    goto end
)

:: Si no hay ninguno disponible
echo ====================================================
echo  ERROR: No se encontro Python ni Node.js instalado.
echo.
echo  Instala uno de estos para usar el panel admin:
echo  - Python: https://www.python.org/downloads/
echo  - Node.js: https://nodejs.org/
echo ====================================================
echo.
pause

:end
