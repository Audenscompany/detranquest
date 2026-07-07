# 🚀 Como Rodar Alfred OS v9 Localmente (Com Backend)

## ⚠️ O Problema

O Alfred no GitHub Pages não consegue chamar a Claude API diretamente porque:
- Navegadores bloqueiam requisições CORS
- A Claude API não permite chamadas diretas de websites estáticos

## ✅ A Solução

Rodar o Alfred **localmente** com um backend Node.js simples que:
- Contorna o bloqueio CORS
- Faz as requisições de forma segura
- Funciona 100%

---

## 📋 Pré-requisitos

Você precisa de:
- **Node.js 18+** instalado (baixe em nodejs.org)
- **npm** (vem com Node.js)
- **Uma API Key do Claude** válida (pegue em console.anthropic.com)

---

## 🚀 Passo a Passo

### Passo 1: Preparar a pasta
```bash
cd /home/claude/detranquest
```

### Passo 2: Instalar dependências do backend
```bash
cd backend
npm install
```

Isso vai instalar:
- Express (servidor web)
- CORS (contorna bloqueio)
- Axios (faz requisições)
- Dotenv (variáveis de ambiente)

### Passo 3: Iniciar o backend
```bash
npm start
```

Você verá:
```
🚀 Backend rodando em http://localhost:3000
📁 Frontend em http://localhost:3000/alfred.html
🔌 Endpoint de chat em http://localhost:3000/api/chat
```

### Passo 4: Abrir o Alfred
Abra seu navegador e vá para:
```
http://localhost:3000/alfred.html
```

**NÃO use GitHub Pages!** Use `localhost:3000`

### Passo 5: Testar
```
1. Cole sua API Key do Claude
2. Vé a bolinha ficar verde?
3. Digite "opa"
4. Clique Enviar
5. Funciona agora? ✅
```

---

## 🛠️ Troubleshooting

### "Erro: npm not found"
- Node.js não está instalado
- Baixe em: https://nodejs.org
- Reinicie o terminal após instalar

### "Port 3000 is already in use"
```bash
# Use outra porta
PORT=3001 npm start

# Depois acesse: http://localhost:3001/alfred.html
```

### "Failed to fetch"
- Backend não está rodando
- Verifique se o terminal mostra "🚀 Backend rodando"
- A URL está certa? `http://localhost:3000` (não HTTPS!)

### "Cannot find module 'express'"
```bash
# Instale as dependências novamente
npm install
```

---

## 📊 Arquitetura

```
Seu Navegador
    ↓
http://localhost:3000/alfred.html (Frontend)
    ↓ (requisição sem CORS)
http://localhost:3000/api/chat (Backend)
    ↓ (requisição segura)
Claude API (https://api.anthropic.com)
    ↓
Resposta
    ↓
Seu Navegador (exibe resultado)
```

---

## ✨ Fluxo Completo

```bash
# Terminal 1: Iniciar backend
cd /home/claude/detranquest/backend
npm start

# Resultado:
# 🚀 Backend rodando em http://localhost:3000
# 📁 Frontend em http://localhost:3000/alfred.html
# 🔌 Endpoint de chat em http://localhost:3000/api/chat

# Terminal 2 (ou nova aba do navegador):
# Abra: http://localhost:3000/alfred.html

# No navegador:
# 1. Cole API Key
# 2. Digite mensagem
# 3. Clique Enviar
# 4. Funciona! ✅
```

---

## 🔐 Segurança

**IMPORTANTE:** A API Key é enviada para o backend, que a usa para chamar Claude.

**Boas práticas:**
1. Use HTTPS em produção
2. Não compartilhe sua API Key
3. Use variáveis de ambiente (`.env`) para guardar secrets
4. Em produção, faça deploy em um servidor seguro

---

## 📝 Variáveis de Ambiente

Você pode criar um arquivo `.env` para configurações:

```bash
# backend/.env
PORT=3000
NODE_ENV=development
```

---

## 🚀 Deploy em Produção

Para usar em produção (não localmente):

### Opção 1: Heroku (Grátis)
```bash
# 1. Criar conta em heroku.com
# 2. Instalar Heroku CLI
# 3. No terminal:
heroku create seu-app-nome
git push heroku main
```

### Opção 2: Railway (Fácil)
```bash
# 1. Conectar GitHub
# 2. Selecionar repositório
# 3. Deploy automático
```

### Opção 3: Render (Grátis)
```bash
# 1. Conectar GitHub
# 2. Selecionar repositório
# 3. Deploy automático
```

---

## 📞 Suporte

Se não funcionar:

1. Verifique se Node.js está instalado
   ```bash
   node --version
   npm --version
   ```

2. Verifique se as dependências foram instaladas
   ```bash
   ls node_modules
   ```

3. Verifique a porta 3000
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```

4. Leia os erros no terminal
   Eles te dizem exatamente o que está errado

---

## ✅ Checklist Final

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Backend rodando (`npm start`)
- [ ] URL correta (`http://localhost:3000/alfred.html`)
- [ ] API Key válida (pegue em console.anthropic.com)
- [ ] Bolinha indicador verde
- [ ] Teste enviando uma mensagem

---

## 🎉 Pronto!

Agora o Alfred funciona 100% **sem CORS**!

Qualquer dúvida, abra o terminal e leia os logs. Eles te dirão o que está acontecendo.

🦇 **Made with dedication.**
