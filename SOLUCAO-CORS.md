# 🛡️ SOLUÇÃO CORS - Alfred OS v9

## Problema
O Alfred HTML estático no GitHub Pages não pode chamar a Claude API diretamente porque:
- CORS bloqueia requisições de `https://audenscompany.github.io` para `https://api.anthropic.com`
- Navegadores impedem isso por segurança
- A Claude API não retorna headers CORS

## Solução
Implementar um backend Node.js simples que:
- Roda localmente (localhost) ou em um servidor
- Recebe requisições do Alfred (sem CORS)
- Repassa para Claude API (seguro no backend)
- Retorna resposta ao Alfred

## Duas Opções

### Opção 1: Backend Local (Desenvolvimento)
```bash
cd /home/claude/detranquest/backend
npm install
npm start
```

Acessa: `http://localhost:3000`

### Opção 2: Deploy em Servidor (Produção)
Fazer deploy do backend em:
- Heroku (grátis com limitações)
- Railway
- Render
- DigitalOcean
- AWS

## Arquitetura

```
Browser (Alfred HTML)
    ↓
GitHub Pages (https://audenscompany.github.io/alfred.html)
    ↓ (requisição sem CORS)
Backend Node.js (seu servidor)
    ↓ (requisição segura)
Claude API (https://api.anthropic.com)
    ↓ (resposta)
Backend Node.js
    ↓ (resposta)
Browser (exibe resultado)
```

## Implementação Rápida

1. Manter Alfred.html no GitHub Pages (interface)
2. Criar backend simples com Express
3. Configurar endpoint `/api/chat`
4. Atualizar Alfred.html para chamar o backend ao invés da API direta

