# Alfred OS v9 - LLM-Only Architecture

**Mudança fundamental: JavaScript NUNCA mais gera respostas.**

## 🎯 Princípio Central

```
Usuário digita
    ↓
Frontend coleta input
    ↓
Backend orquestra
    ↓
Busca em memória (3 níveis)
    ↓
Busca em PDFs (RAG automático)
    ↓
Monta contexto
    ↓
Chama Claude/OpenAI/Gemini
    ↓
LLM gera resposta
    ↓
Salva na memória
    ↓
Exibe resposta
```

## 🏗️ Arquitetura

```
backend/
├── server.js              # Apenas orquestração
├── llm/
│   └── provider.js        # Abstração para Claude, OpenAI, Gemini
├── rag/
│   ├── embedder.js        # Embeddings com fallback
│   └── vector-db.js       # Vector DB com SQLite
├── memory/
│   └── manager.js         # 3 níveis: curto/médio/longo
└── agents/
    └── conversation.js    # Orquestrador principal

frontend/
└── index.html             # UI pura, sem lógica
```

## 🧠 Sistema de Memória (3 Níveis)

### Curto Prazo (Short Term)
- Histórico da conversa atual
- Recuperado automaticamente
- Limite: últimas 20 mensagens

### Médio Prazo (Medium Term)
- Projetos em andamento
- Contexto de tarefas
- Atualizado a cada ação

### Longo Prazo (Long Term)
- Perfil do usuário
- Preferências
- Informações importantes
- Permanente

Fluxo:
```
Query chega
↓
Recupera Short Term (história)
↓
Recupera Long Term (perfil)
↓
Recupera Medium Term (projetos)
↓
Tudo vai pro LLM como contexto
↓
LLM responde naturalmente
```

## 🔍 RAG (Retrieval Augmented Generation)

**Pipeline automático:**

1. **Upload de PDF**
   - Extração de texto automática
   - Divisão em chunks (1000 palavras, overlap 200)

2. **Embeddings**
   - Cada chunk recebe embedding (384 dimensões)
   - Fallback local se serviço não disponível

3. **Vector DB**
   - Armazenamento em SQLite + BLOB
   - Índices otimizados

4. **Busca Automática**
   - Cada pergunta busca PDFs automaticamente
   - Top-3 resultados recuperados
   - Inclusos no contexto pro LLM

**Resultado: O usuário NUNCA precisa dizer "analise o PDF".**

## 🤖 LLM Provider (Abstração)

Suportados:
- ✅ Claude (Opus, Sonnet, Haiku)
- ✅ OpenAI (GPT-4, GPT-3.5)
- 🔜 Gemini
- 🔜 DeepSeek
- 🔜 Llama

**Trocar modelo é trivial:**
```javascript
agent.llm.setProvider('openai');
agent.llm.setModel('gpt-4');
```

## 📡 API Endpoints

```
POST /api/chat
Body: { message, conversationId, apiKey, provider, model }
Response: { message, conversationId, sources }

POST /api/upload
Body: { pdf (base64), filename }
Response: { success, docId, chunksCount, filename }

POST /api/config
Body: { apiKey, provider, model }
Response: { success }

POST /api/memory
Body: { key, value }
Response: { success }

GET /api/memory/:key
Response: value
```

## 🚀 Como Usar

```bash
# Instalar
npm install

# Iniciar
npm start

# Abrir
http://localhost:3000

# Usar
1. Cole sua API Key (Claude ou OpenAI)
2. Selecione provider e model
3. Faça upload de PDFs (opcional)
4. Digite mensagens
5. Alfred responde via LLM
```

## ❌ O Que NÃO Existe Mais

```javascript
// PROIBIDO:
if (message.includes('apego')) return 'Tenho conhecimento sobre...';
if (intent === 'analytical') return 'Vou analisar...';
return templates[random()];
switch(keywords) { case: ... }

// ELIMINADO:
generateResponse()
getResponse()
handleChat()
chatLogic()
regexResponse()
intentResponse()
keywords[]
templates[]
responses[]
```

## ✅ Exemplo de Conversa

```
Usuário: opa

Alfred: Opa! Como você está hoje?

ou

Alfred: Fala! O que vamos resolver?

ou

Alfred: Bom te ver. O que passa na sua cabeça?
```

Sempre naturalmente. NUNCA: "Baseado no que absorvi..." ou "Tenho conhecimento sobre..."

## 🔐 Segurança

- API Key NUNCA vai para o frontend
- Config endpoint salva chave no backend
- LLM Provider em camada segura
- PDF processing local

## 📈 Performance

- Embeddings com fallback local
- Cache de chunks
- Índices otimizados no SQLite
- Busca semântica rápida

## 🎓 Evolução Contínua

O sistema foi desconstruído para ser puro.

- JavaScript: Interface + Orquestração
- Backend: Segurança + Contexto
- LLM: Inteligência + Naturalidade

Toda resposta vem do modelo. Nunca de código.

---

**Versão**: 9.0.0
**Paradigma**: LLM-First
**Status**: ✅ Implementado
