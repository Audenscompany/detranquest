import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import memoryService from './services/memory.js';
import ragService from './services/rag.js';
import conversationAgent from './services/conversation.js';
import claudeIntegration from './services/claude-integration.js';

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

  try {
    const result = await conversationAgent.processQuery(message, userId);

    res.json({
      message: result.message,
      sources: result.sources,
      intent: result.intent,
      usingClaude: result.usingClaude,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    res.status(500).json({
      error: 'Erro ao processar mensagem',
      details: error.message
    });
  }
});

app.get('/api/chat/history', (req, res) => {
  try {
    const history = memoryService.getConversationHistory(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PDF UPLOAD ============

app.post('/api/documents/upload', async (req, res) => {
  const { pdf, filename } = req.body;

  if (!pdf || !filename) {
    return res.status(400).json({ error: 'PDF ou filename ausente' });
  }

  try {
    const buffer = Buffer.from(pdf, 'base64');
    const result = await ragService.ingestDocument(buffer, filename);

    res.json({
      success: true,
      docId: result.docId,
      new: result.new,
      chunksCount: result.chunksCount,
      filename
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
  try {
    const docs = memoryService.getDocuments();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/documents/:docId', (req, res) => {
  const { docId } = req.params;
  res.json({ success: true, docId, message: 'Funcionalidade em desenvolvimento' });
});

// ============ SEARCH API ============

app.post('/api/search', (req, res) => {
  const { query, limit = 5 } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query vazia' });
  }

  try {
    const results = ragService.search(query, limit);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MEMORY API ============

app.post('/api/memory/save', (req, res) => {
  const { key, value, category = 'general' } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Key ausente' });
  }

  try {
    memoryService.saveMemory(key, value, category);
    res.json({ success: true, key, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  try {
    const memories = memoryService.getMemoriesByCategory(category);
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CONFIG API ============

app.post('/api/config/claude-key', (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key ausente' });
  }

  try {
    claudeIntegration.setApiKey(apiKey);
    conversationAgent.setClaudeApiKey(apiKey);
    res.json({
      success: true,
      message: 'Claude API key configurada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/config/status', (req, res) => {
  res.json({
    claudeEnabled: claudeIntegration.isEnabled(),
    version: '8.0.0',
    documentsCount: memoryService.getDocuments().length
  });
});

// ============ STATUS ============

app.get('/api/status', (req, res) => {
  try {
    const docs = memoryService.getDocuments();
    const conversations = memoryService.getConversationHistory(1);

    res.json({
      status: 'online',
      documents: docs.length,
      conversations: conversations.length,
      claudeEnabled: claudeIntegration.isEnabled(),
      version: '8.0.0',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HEALTH ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal error'
  });
});

// ============ START ============

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🦇 Alfred OS v8 Backend                ║
║  Status: Online                        ║
╚════════════════════════════════════════╝

🌐 Frontend: http://localhost:${PORT}

📡 API Endpoints:
   • Chat:       POST /api/chat/message
   • Upload:     POST /api/documents/upload
   • Documents:  GET  /api/documents
   • Search:     POST /api/search
   • Memory:     GET/POST /api/memory/*
   • Config:     POST /api/config/claude-key
   • Status:     GET  /api/status
   • Health:     GET  /health

💾 Database: ./storage/alfred.db
📚 Documents: ./storage/documents/
🤖 Claude: ${claudeIntegration.isEnabled() ? 'ATIVADO' : 'Desativado (configure API key)'}

🔧 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

process.on('exit', () => {
  console.log('🔌 Closing database connection...');
  memoryService.close();
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  memoryService.close();
  process.exit(0);
});
