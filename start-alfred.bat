@echo off
REM 🚀 Script para iniciar Alfred OS no Windows

echo.
echo 🦇 Iniciando Alfred OS v9...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js não está instalado!
    echo.
    echo Instale em: https://nodejs.org
    echo Escolha a versão LTS e instale
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Instalar dependências
echo 📦 Instalando dependências...
cd backend
call npm install

echo.
echo 🚀 Iniciando servidor...
echo.
echo ================================
echo Backend rodando em:
echo http://localhost:3000/alfred.html
echo ================================
echo.
echo Abra o link acima no navegador!
echo.

call npm start
pause
