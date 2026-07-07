# Alfred OS v8 - Arquitetura Completa

Uma arquitetura modular, escalável e inteligente para um assistente pessoal IA de classe JARVIS.

## 🏗️ Estrutura Modular

```
backend/
├── server.js                 # Express server + rotas
├── services/
│   ├── memory.js            # Gerenciamento de memória (SQLite)
│   ├── rag.js               # Recuperação aumentada de conhecimento
│   ├── conversation.js      # Orquestração de conversas
│   ├── claude-integration.js # API Claude
│   ├── document-processor.js # Processamento de PDFs
│   ├── planning.js          # Planejamento de tarefas
│   └── tools.js             # Sistema de ferramentas
├── api/ (estrutura)
├── models/ (estrutura)
└── utils/ (estrutura)

frontend/
└── index.html               # Interface HTML5 moderna

rag/                          # (estrutura futura)
memory/                       # (estrutura futura)
storage/
├── alfred.db               # SQLite database
└── documents/              # PDFs originais
```

## 🔄 Pipeline de Processamento

### Fluxo de Uma Pergunta

```
Usuário faz pergunta
    ↓
POST /api/chat/message
    ↓
ConversationAgent.processQuery()
    ↓
┌─────────────────────────────────────┐
│ 1. RAG Service                      │
│    - Busca em documentos            │
│    - Ranking por similaridade       │
│    - Retorna top-3 fontes           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Memory Service                   │
│    - Histórico de conversas         │
│    - Memória pessoal                │
│    - Preferências                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Intent Analysis                  │
│    - Identifica tipo (info, conv,   │
│      análise, planejamento, etc)    │
│    - Calcula confiança              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. Claude API (ou fallback)         │
│    - Envia contexto + histórico     │
│    - Gera resposta inteligente      │
│    - Se não ativado, fallback local │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 5. Memory Save                      │
│    - Salva conversa no SQLite       │
│    - Atualiza contexto              │
└─────────────────────────────────────┘
    ↓
Retorna resposta + fontes
```

### Fluxo de Upload de PDF

```
Usuário faz upload
    ↓
POST /api/documents/upload (base64)
    ↓
DocumentProcessor.processDocument()
    ↓
┌─────────────────────────────────────┐
│ 1. Validação                        │
│    - Tamanho máximo                 │
│    - Formato (PDF)                  │
│    - Integridade                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Extração                         │
│    - Texto de cada página           │
│    - Análise de conteúdo            │
│    - Detecção de idioma             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Processamento                    │
│    - Limpeza de texto               │
│    - Cálculo de estatísticas        │
│    - Hash SHA-256 (dedup)           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. RAG Service                      │
│    - Chunking (1000 palavras)       │
│    - Embeddings simples             │
│    - Indexação no SQLite            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 5. Memory Save                      │
│    - Metadados do documento         │
│    - Análise (tipo, readability)    │
└─────────────────────────────────────┘
    ↓
Retorna sucesso + chunks criados
```

## 🧠 Serviços e Responsabilidades

### MemoryService
- **Curto prazo**: Histórico da conversa atual
- **Longo prazo**: Preferências, objetivos, conhecimentos
- **Documentos**: Metadados e chunks
- **Embeddings**: Vetores para busca semântica
- **Database**: SQLite local com 4 tabelas principais

### RAGService
- Busca semântica em documentos
- Cálculo de similaridade (cosseno)
- Re-ranking de resultados
- Construção de contexto para LLM
- Cache em memória para performance

### ConversationAgent
- Análise de intenção do usuário
- Orquestração de serviços
- Construção de contexto completo
- Decisão sobre qual ferramenta usar
- Fallback inteligente

### ClaudeIntegration
- Chamadas à API Claude Opus 4.6
- System prompt otimizado
- Construção de histórico
- Tratamento de erros
- Fallback local

### DocumentProcessor
- Extração de texto de PDFs
- Validação de arquivo
- Detecção de idioma
- Análise de tipo de conteúdo
- Limpeza de texto
- Cálculo de legibilidade

### PlanningAgent
- Quebra de objetivos em tarefas
- Identificação de tipo de objetivo
- Estimativa de tempo
- Rastreamento de progresso
- Sugestão de próximas ações

### ToolsAgent
- Registro de ferramentas
- Execução segura
- Integração com APIs
- Sugestão de ferramentas úteis

## 📊 Dados e Armazenamento

### SQLite Database (alfred.db)

**Tabela: conversations**
- id (TEXT PRIMARY KEY)
- user_message (TEXT)
- alfred_response (TEXT)
- timestamp (DATETIME)
- context (JSON)

**Tabela: long_term_memory**
- id (TEXT PRIMARY KEY)
- key (TEXT UNIQUE)
- value (JSON)
- category (TEXT)
- created_at, updated_at (DATETIME)

**Tabela: documents**
- id (TEXT PRIMARY KEY)
- filename (TEXT)
- content_hash (TEXT)
- extracted_text (TEXT)
- chunks_count (INTEGER)
- ingested_at (DATETIME)

**Tabela: embeddings**
- id (TEXT PRIMARY KEY)
- document_id (FOREIGN KEY)
- chunk_index (INTEGER)
- text_chunk (TEXT)
- embedding (JSON)
- created_at (DATETIME)

## 🔌 Endpoints da API

### Chat
```
POST /api/chat/message
Body: { message, userId? }
Response: { message, sources, intent, usingClaude }
```

### Documentos
```
POST /api/documents/upload        # Upload de PDF
GET /api/documents                 # Listar documentos
DELETE /api/documents/:docId       # Remover documento
```

### Busca
```
POST /api/search
Body: { query, limit? }
Response: [ { docId, filename, text, similarity } ]
```

### Memória
```
GET /api/memory/:key               # Recuperar valor
POST /api/memory/save              # Salvar valor
GET /api/memory/category/:category # Listar por categoria
```

### Planejamento
```
POST /api/planning/create          # Criar plano
GET /api/planning/:planId          # Obter plano
POST /api/planning/:planId/task/:taskId/complete
GET /api/planning/:planId/next     # Próxima tarefa
```

### Ferramentas
```
GET /api/tools                     # Listar ferramentas
POST /api/tools/:toolName/execute  # Executar ferramenta
```

### Configuração
```
POST /api/config/claude-key        # Configurar API key
GET /api/config/status             # Status do sistema
```

### Status
```
GET /api/status                    # Status geral
GET /health                        # Health check
```

## 🎯 Análise de Intenção

O sistema detecta automaticamente:
- **informational**: Perguntas que exigem conhecimento
- **conversational**: Conversas sociais
- **analytical**: Análises e comparações
- **planning**: Planejamento e objetivos
- **help**: Pedidos de ajuda
- **document**: Queries sobre PDFs
- **learning**: Solicitações de aprendizado

## 🔄 Fluxo de Embeddings

Embeddings atuais usam **frequência de palavras normalizada**.

**Formato**: `{ palavra1: 0.05, palavra2: 0.03, ... }`

**Similaridade**: Cosseno entre vetores

**Upgrade futuro**: Sentence-transformers ou OpenAI Embeddings

## 🛡️ Segurança

- Validação de entrada (tamanho, formato)
- Hash SHA-256 para deduplicação
- Tratamento seguro de PDFs
- Execução segura de ferramentas (sem eval geral)
- CORS habilitado
- Rate limiting preparado (não implementado)

## 📈 Performance

- Cache em memória de documentos
- Índice de embeddings otimizado
- Busca com similaridade mínima (0.01)
- Lazy loading de histórico
- Compressão de contexto para Claude

## 🚀 Próximas Melhorias

### Curto Prazo
- [ ] Embeddings reais (sentence-transformers)
- [ ] Banco vetorial dedicado (FAISS, ChromaDB)
- [ ] Rate limiting e autenticação
- [ ] Streaming de respostas
- [ ] Busca full-text com FTS5

### Médio Prazo
- [ ] Agentes múltiplos com especialidades
- [ ] Integração com APIs externas reais
- [ ] Sistema de feedback e aprendizado
- [ ] Persistência de planos mais robusta
- [ ] Web scraping (com permissão)

### Longo Prazo
- [ ] Modelo custom fine-tuned
- [ ] Multi-idioma completo
- [ ] Agentes especializados por domínio
- [ ] Sistema de notificações
- [ ] Integração com calendários e emails
- [ ] Voice input/output
- [ ] Mobile app nativa

## 📝 Convenções de Código

- Camel case para variáveis/funções
- PascalCase para classes
- Async/await para operações assíncronas
- Try-catch para tratamento de erros
- Comentários explicativos para lógica complexa

## 🔧 Desenvolvimento

```bash
# Instalar
npm install

# Iniciar
npm start

# Modo watch
npm run dev

# Testes (futuro)
npm test
```

---

**Versão**: 8.0.0  
**Última atualização**: Hoje  
**Status**: Ativo, em evolução contínua
