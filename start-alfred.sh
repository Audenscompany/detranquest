#!/bin/bash

# 🚀 Script para iniciar Alfred OS no Mac/Linux

echo "🦇 Iniciando Alfred OS v9..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo ""
    echo "Instale em: https://nodejs.org"
    echo "Escolha a versão LTS e instale"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
cd backend
npm install

echo ""
echo "🚀 Iniciando servidor..."
echo ""
echo "================================"
echo "Backend rodando em:"
echo "http://localhost:3000/alfred.html"
echo "================================"
echo ""
echo "Abra o link acima no navegador!"
echo ""

npm start
