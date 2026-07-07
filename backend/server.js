// 🚀 Backend simples para contornar CORS
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (frontend)
app.use(express.static('../'));

// Endpoint para chat (contorna CORS)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model, systemPrompt, messages, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }

    console.log(`📤 Enviando para Claude API (${model})...`);

    // Chamar Claude API do backend (sem CORS)
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model || 'claude-opus-4.6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta recebida com sucesso');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({ 
      error: message,
      status: status
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📁 Frontend em http://localhost:${PORT}/alfred.html`);
  console.log(`🔌 Endpoint de chat em http://localhost:${PORT}/api/chat`);
});
