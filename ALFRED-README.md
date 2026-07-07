# Alfred OS v8 - Intelligent Personal System

Uma arquitetura modular completa para um assistente IA com RAG, memória persistente, indexação de documentos e conversação natural.

## 🏗️ Arquitetura

```
alfred-os/
├── backend/
│   ├── server.js                 # Express server principal
│   ├── services/
│   │   ├── memory.js             # Gerenciamento de memória (SQLite)
│   │   └── rag.js                # Recuperação aumentada (RAG)
│   ├── api/                      # Endpoints
│   ├── models/                   # Data models
│   └── config/                   # Configuração
├── frontend/
│   └── index.html                # Interface HTML5
├── rag/
│   ├── embeddings/               # Geração de embeddings
│   ├── ingestion/                # Pipeline de ingestão
│   └── search/                   # Busca semântica
├── memory/
│   ├── short_term/               # Memória de conversa
│   └── long_term/                # Memória permanente
└── storage/
    ├── vector_db/                # Banco vetorial
    ├── documents/                # PDFs originais
    └── alfred.db                 # SQLite database
```

## 🚀 Como Usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar backend
```bash
npm start
# ou com watch
npm run dev
```

Backend rodará em `http://localhost:3000`

### 3. Abrir frontend
```
http://localhost:3000
```

## 📚 Funcionalidades

### Chat Inteligente
- Conversação natural com contexto
- Recuperação automática de informações relevantes
- Histórico persistente

### Ingestão de PDFs
- Upload automático de documentos
- Extração de texto inteligente
- Divisão automática em chunks
- Geração de embeddings
- Indexação para busca rápida

### RAG (Retrieval Augmented Generation)
- Busca semântica
- Re-ranking de resultados
- Contexto automático para respostas

### Memória
- **Curta duração**: Histórico da conversa atual
- **Longa duração**: Preferências e conhecimentos
- **Documentos**: Metadados e embeddings

## 📡 API Endpoints

### Chat
```
POST /api/chat/message
Body: { message: "...", userId: "default" }
```

### Upload de PDFs
```
POST /api/documents/upload
Body: { pdf: "base64...", filename: "..." }
```

### Busca
```
POST /api/search
Body: { query: "...", limit: 5 }
```

### Memória
```
GET /api/memory/:key
POST /api/memory/save
GET /api/memory/category/:category
```

### Status
```
GET /api/status
```

## 🔍 Como Funciona o RAG

1. **Ingestão**: PDF é convertido em texto
2. **Chunking**: Texto dividido em pedaços de 1000 palavras
3. **Embeddings**: Cada chunk recebe um embedding (frequência de palavras)
4. **Indexação**: Embeddings armazenados no SQLite
5. **Busca**: Query gera embedding e busca similares
6. **Re-ranking**: Resultados ordenados por relevância
7. **Contexto**: Top-3 resultados inclusos na resposta

## 💾 Banco de Dados

Usa SQLite com 4 tabelas principais:

- `conversations`: Histórico de chat
- `long_term_memory`: Memória persistente
- `documents`: Metadados dos PDFs
- `embeddings`: Vetores de embedding

## 🔄 Fluxo de Uma Pergunta

```
Usuário digita pergunta
    ↓
Backend recebe POST /api/chat/message
    ↓
RAG busca documentos relevantes
    ↓
Memória recupera histórico
    ↓
Generate response usando contexto
    ↓
Salva na memória
    ↓
Retorna ao frontend
```

## 📦 Dependências

- **express**: Framework web
- **sqlite3** / **sqlite**: Banco de dados
- **pdfjs-dist**: Extração de PDFs
- **uuid**: Geração de IDs
- **natural**: Processamento de linguagem

## 🛠️ Próximas Melhorias

- [ ] Embeddings reais (ex: sentence-transformers)
- [ ] Banco vetorial dedicado (ex: Chromadb, FAISS)
- [ ] Integração com Claude API
- [ ] Agentes inteligentes
- [ ] Ferramentas externas
- [ ] Planejamento automático
- [ ] Suporte a múltiplos idiomas

## 📝 Notas

- PDFs são decompostos em chunks de 1000 palavras com overlap de 200
- Embeddings atuais usam frequência de palavras (upgrade para transformers em breve)
- Contexto de RAG é recuperado automaticamente a cada pergunta
- Memória é persistente entre sessões (SQLite local)

---

**Versão**: 8.0.0  
**Status**: EM DESENVOLVIMENTO
