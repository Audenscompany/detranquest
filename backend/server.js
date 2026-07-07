import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import memoryService from './services/memory.js';
import ragService from './services/rag.js';
import { v4 as uuid } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(join(__dirname, '../frontend')));

// ============ CHAT API ============

app.post('/api/chat/message', async (req, res) => {
  const { message, userId = 'default' } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Mensagem vazia' });
  }

  // Recuperar contexto
  const history = memoryService.getConversationHistory(5);
  const context = ragService.buildContext(message);

  // Construir resposta (simulada por agora)
  const response = generateResponse(message, context, history);

  // Salvar na memória
  try {
    await memoryService.addConversation(
      userId,
      message,
      response,
      { sources: context.sources }
    );
  } catch (e) {
    console.error('Erro ao salvar conversa:', e);
  }

  res.json({
    message: response,
    sources: context.sources,
    timestamp: new Date()
  });
});

app.get('/api/chat/history', (req, res) => {
  const history = memoryService.getConversationHistory(50);
  res.json(history);
});

// ============ PDF UPLOAD ============

app.post('/api/documents/upload', async (req, res) => {
  const { pdf, filename } = req.body;

  if (!pdf || !filename) {
    return res.status(400).json({ error: 'PDF ou filename ausente' });
  }

  try {
    // Converter base64 para buffer
    const buffer = Buffer.from(pdf, 'base64');

    // Ingerir PDF
    const result = await ragService.ingestPDF(buffer, filename);

    res.json({
      success: true,
      docId: result.docId,
      new: result.new,
      chunksCount: result.chunksCount
    });
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    res.status(500).json({
      error: 'Erro ao processar PDF',
      details: error.message
    });
  }
});

app.get('/api/documents', (req, res) => {
  const docs = memoryService.getDocuments();
  res.json(docs);
});

app.delete('/api/documents/:docId', (req, res) => {
  const { docId } = req.params;
  // TODO: Implementar deleção de documentos
  res.json({ success: true, docId });
});

// ============ SEARCH API ============

app.post('/api/search', (req, res) => {
  const { query, limit = 5 } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query vazia' });
  }

  const results = ragService.search(query, limit);
  res.json(results);
});

// ============ MEMORY API ============

app.post('/api/memory/save', (req, res) => {
  const { key, value, category = 'general' } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Key ausente' });
  }

  memoryService.saveMemory(key, value, category);
  res.json({ success: true, key });
});

app.get('/api/memory/:key', (req, res) => {
  const { key } = req.params;
  const value = memoryService.getMemory(key);

  if (!value) {
    return res.status(404).json({ error: 'Key não encontrada' });
  }

  res.json(value);
});

app.get('/api/memory/category/:category', (req, res) => {
  const { category } = req.params;
  const memories = memoryService.getMemoriesByCategory(category);
  res.json(memories);
});

// ============ STATUS ============

app.get('/api/status', (req, res) => {
  const docs = memoryService.getDocuments();
  const conversations = memoryService.getConversationHistory(1);

  res.json({
    status: 'online',
    documents: docs.length,
    conversations: conversations.length,
    version: '8.0.0'
  });
});

// ============ Helper ============

function generateResponse(message, context, history) {
  const lower = message.toLowerCase();

  // Resposta baseada em contexto recuperado
  if (context.sources && context.sources.length > 0) {
    return `Baseado nos documentos analisados: ${context.sources[0].text.substring(0, 200)}... Posso ajudar com mais detalhes sobre isso.`;
  }

  // Resposta baseada em padrões
  if (lower.includes('apego') || lower.includes('relacionamento')) {
    return 'Entendo que você está explorando dinâmicas de apego e relacionamento. Adicione PDFs sobre esses temas em "Documentos" para que eu possa oferecer respostas mais profundas e baseadas em conhecimento real.';
  }

  if (lower.includes('pdf') || lower.includes('documento')) {
    return `Você tem ${memoryService.getDocuments().length} documento(s) carregado(s). Faça perguntas e vou recuperar automaticamente as informações relevantes.`;
  }

  // Resposta padrão
  return 'Sou Alfred, seu assistente inteligente. Estou aprendendo com os documentos que você compartilha. Como posso ajudar?';
}

// ============ START ============

app.listen(PORT, () => {
  console.log(`\n🦇 Alfred OS Backend rodando em http://localhost:${PORT}\n`);
  console.log(`   • Chat: POST /api/chat/message`);
  console.log(`   • Upload: POST /api/documents/upload`);
  console.log(`   • Search: POST /api/search`);
  console.log(`   • Memory: GET/POST /api/memory/*`);
});

process.on('exit', () => {
  memoryService.close();
});
