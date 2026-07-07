# 🦇 Alfred OS v9 - GitHub Pages Edition

## ⚡ Quick Start

### URL
```
https://audenscompany.github.io/detranquest/alfred.html
```

**Clique. Abra. Use.**

---

## 3 Passos para Usar

### 1️⃣ Abra a URL
```
https://audenscompany.github.io/detranquest/alfred.html
```

### 2️⃣ Configure
- Cola sua API Key (Claude)
- Selecione modelo (Opus, Sonnet, Haiku)

### 3️⃣ Conversa
- Digita uma mensagem
- Alfred responde
- Pronto!

---

## ✨ Características

✅ **Sem Backend**
- Funciona 100% no navegador
- Nada para instalar
- Nada para configurar

✅ **Chat com Claude**
- Opus: Mais poderoso
- Sonnet: Balanceado (recomendado)
- Haiku: Mais rápido

✅ **Upload de PDFs**
- Botão 📄 para upload
- Absorção automática
- Busca semântica automática

✅ **Memória em 3 Níveis**
- Short term: Histórico
- Medium term: Projetos
- Long term: Perfil

✅ **Privacidade Total**
- Dados no seu navegador (IndexedDB)
- Sua API Key fica local
- Nada é armazenado em servidor

---

## Onde Conseguir API Key?

### Claude (Anthropic)
1. Vá para: https://console.anthropic.com
2. Crie conta
3. Crie uma chave de API
4. Cole em "API Key" no Alfred

---

## Exemplos de Uso

### Chat Simples
```
Você: "opa"
Alfred: "Opa! Como você está?"

Você: "estou com dúvida sobre psicologia"
Alfred: [Conversa profunda]
```

### Com PDFs
```
1. Upload: "psicologia_do_apego.pdf"
2. Você: "como lidar com apego ansioso?"
3. Alfred: [Usa PDF automaticamente]
```

---

## Dados & Segurança

| O Quê | Onde | Visibilidade |
|-------|------|-------------|
| API Key | Browser (IndexedDB) | Só você |
| Histórico | Browser (IndexedDB) | Só você |
| PDFs | Browser (IndexedDB) | Só você |
| Mensagem atual | Claude API | Claude vê |

---

## Troubleshooting

### ❌ "Página não carrega"
→ Espere alguns segundos
→ F5 para recarregar
→ Verifique internet

### ❌ "API key required"
→ Cole sua API Key no campo
→ Verifique se está correta

### ❌ "PDF não funciona"
→ Verifique se é PDF válido
→ Máximo 50MB

### ❌ "Perdi meus dados"
→ Dados ficam em IndexedDB (seu navegador)
→ Trocar de navegador = dados novo
→ Modo anônimo = dados novo

---

## Detalhes Técnicos

**Arquivo:** `alfred.html` (9.5KB)

**Dependências:**
- PDF.js (CDN)
- Nada mais!

**Compatibilidade:**
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Celular

**Storage:**
- IndexedDB (seu navegador)
- Persistente entre sessões

---

## Versão

- **Versão:** 9.0.0
- **Paradigma:** LLM-Only
- **Status:** ✅ Production Ready
- **URL:** https://audenscompany.github.io/detranquest/alfred.html

---

## O que é "LLM-Only"?

O Alfred v9 funciona assim:

```
1. Você digita algo
   ↓
2. Alfred busca contexto:
   - Histórico
   - PDFs
   - Memória
   ↓
3. Monta contexto completo
   ↓
4. Envia para Claude API
   ↓
5. Claude responde
   ↓
6. Alfred exibe resposta
   ↓
7. Tudo é salvo localmente
```

**Importante:** Alfred NUNCA gera respostas em JavaScript. Toda resposta vem do Claude.

---

## Próximas Versões

Planejado:
- Suporte OpenAI
- Gemini support
- Streaming
- Busca de histórico
- Export de chats

---

🦇 **Made with dedication.**
