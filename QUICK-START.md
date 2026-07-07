# 🚀 Quick Start - Alfred OS v9

## ⚠️ PROBLEMA: localhost:3000 recusa conexão

**Causa:** Backend não está rodando

## ✅ SOLUÇÃO:

### PASSO 1: Abra um terminal na pasta do projeto

```bash
cd /caminho/para/detranquest
```

### PASSO 2: Instale as dependências (primeira vez)

```bash
npm install
```

Isso vai instalar:
- express
- sqlite3
- pdfjs-dist
- axios
- e outras...

Vai levar ~2 minutos.

### PASSO 3: INICIE O BACKEND

```bash
npm start
```

Você DEVE ver isto no terminal:

```
╔════════════════════════════════════════╗
║  🦇 Alfred OS - LLM-Only Architecture   ║
║  Backend: http://localhost:3000        ║
╚════════════════════════════════════════╝
```

**SE NÃO VIR ISSO, O BACKEND NÃO INICIOU.**

### PASSO 4: Deixe o terminal ABERTO

⚠️ IMPORTANTE: **NÃO feche o terminal!**

O terminal precisa continuar rodando enquanto você usa o Alfred.

### PASSO 5: Abra seu navegador

Vá para: **http://localhost:3000**

Você verá:

```
Configuração:
- Campo: API Key (password)
- Select: Provider (Claude / OpenAI)
- Select: Model
- Button: 📄 Upload PDF
- Chat area
```

### PASSO 6: Configure sua API Key

1. Cole sua API Key (Claude ou OpenAI)
2. Selecione o provider
3. Selecione o modelo
4. Comece a conversar!

---

## ❌ ERROS COMUNS E SOLUÇÕES

### ❌ "npm: command not found"

**Solução:** Node.js não está instalado

```bash
# Baixe em https://nodejs.org/
# Instale
# Verifique:
node --version
npm --version
```

### ❌ "Cannot find module 'express'"

**Solução:** Rode `npm install` novamente

```bash
npm install
```

### ❌ "EADDRINUSE: address already in use :::3000"

**Problema:** Algo já está usando a porta 3000

**Solução 1:** Use outra porta

```bash
PORT=3001 npm start
# Depois acesse: http://localhost:3001
```

**Solução 2:** Mate o processo anterior

```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### ❌ "Não consegue conectar" ao colar API Key

**Solução:** Verifique se:
1. O terminal do backend ainda está rodando
2. Não há erros no terminal
3. Você está em http://localhost:3000 (não https!)

### ❌ "ERR_CONNECTION_REFUSED"

**Problema:** Backend não está rodando

**Solução:**

```bash
# No terminal, rode:
npm start

# Espere aparecer a mensagem de sucesso
# DEPOIS acesse http://localhost:3000
```

---

## 📊 CHECKLIST DE EXECUÇÃO

```
□ npm install rodou com sucesso?
□ npm start mostra a mensagem do backend?
□ Terminal continua aberto?
□ http://localhost:3000 carrega?
□ Interface aparece (API Key, Provider, Model)?
□ Você tem uma API Key válida?
□ Backend está respondendo (sem erros no terminal)?
```

---

## 💾 ESTRUTURA DE ARQUIVOS

```
detranquest/
├── backend/
│   └── server.js          ← npm start inicia aqui
├── frontend/
│   └── index.html         ← Carregado pelo servidor
├── storage/
│   └── alfred.db          ← Criado automaticamente
└── package.json           ← npm install lê isto
```

---

## 🔧 DESARROLLO

Se quiser auto-reload:

```bash
npm run dev
```

(Reinicia automaticamente quando você salva arquivo)

---

## ✅ TUDO CERTO?

Se você vê:

1. Terminal com "Backend: http://localhost:3000"
2. Navegador em http://localhost:3000
3. Interface com campos de API Key, Provider, Model
4. Nenhum erro no terminal

**PARABÉNS!** O Alfred está rodando.

Agora:
1. Cole sua API Key
2. Selecione Claude ou OpenAI
3. Escolha o modelo
4. Digite uma mensagem
5. Alfred responde via LLM

---

**Versão:** 9.0.0
**Status:** ✅ Pronto para usar

🦇
