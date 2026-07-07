import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as pdfjs from 'pdfjs-dist';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import ConversationAgent from './agents/conversation.js';
import VectorDB from './rag/vector-db.js';
import MemoryManager from './memory/manager.js';

const app = express();
const PORT = process.env.PORT || 3000;

pdfjs.GlobalWorkerOptions.workerSrc = 
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('frontend'));

const memory = new MemoryManager();
const vectorDb = new VectorDB();

// ========== CHAT ENDPOINT ==========
// Única responsabilidade: orquestrar, NUNCA gerar resposta
app.post('/api/chat', async (req, res) => {
  const { message, conversationId, apiKey, provider = 'claude', model = 'claude-opus-4.6' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  try {
    const agent = new ConversationAgent({
      conversationId: conversationId || uuid(),
      llm: { apiKey, provider, model }
    });

    const result = await agent.process(message);

    res.json({
      message: result.message,
      conversationId: conversationId || uuid(),
      sources: result.sources
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== PDF UPLOAD ENDPOINT ==========
app.post('/api/upload', async (req, res) => {
  const { pdf, filename } = req.body;

  if (!pdf || !filename) {
    return res.status(400).json({ error: 'PDF and filename required' });
  }

  try {
    const buffer = Buffer.from(pdf, 'base64');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Extrair texto
    const pdfDoc = await pdfjs.getDocument({ data: buffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const text = await page.getTextContent();
      fullText += text.items.map(t => t.str).join(' ') + '\n';
    }

    // Dividir em chunks (1000 palavras, overlap 200)
    const words = fullText.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += 800) {
      chunks.push(words.slice(i, i + 1000).join(' '));
    }

    // Ingerir no vector DB
    const docId = await vectorDb.addDocument(filename, hash, chunks);

    res.json({
      success: true,
      docId,
      chunksCount: chunks.length,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== CONFIG ENDPOINT ==========
app.post('/api/config', (req, res) => {
  const { apiKey, provider, model } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  memory.setLongTerm('llm_config', { apiKey, provider, model });
  res.json({ success: true });
});

// ========== MEMORY ENDPOINT ==========
app.post('/api/memory', (req, res) => {
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Key required' });
  }

  memory.setLongTerm(key, value);
  res.json({ success: true });
});

app.get('/api/memory/:key', (req, res) => {
  const value = memory.getLongTerm(req.params.key);

  if (!value) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(value);
});

// ========== HEALTH ==========
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ========== START ==========
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🦇 Alfred OS - LLM-Only Architecture   ║
║  Backend: http://localhost:${PORT}              ║
╚════════════════════════════════════════╝

⚡ ARQUITETURA CRÍTICA:
   • JavaScript NUNCA gera respostas
   • Tudo passa pelo LLM Provider
   • RAG automático em PDFs
   • Memória de 3 níveis
   • Contexto inteligente

📡 Endpoints:
   POST /api/chat      - Chat (passa por LLM)
   POST /api/upload    - Upload PDF (ingestão automática)
   POST /api/config    - Configurar LLM
   POST /api/memory    - Salvar memória
   GET  /api/memory/:key - Recuperar memória
  `);
});

process.on('SIGINT', () => {
  memory.close();
  vectorDb.close();
  process.exit(0);
});
