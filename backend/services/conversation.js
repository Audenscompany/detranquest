import ragService from './rag.js';
import memoryService from './memory.js';
import claudeIntegration from './claude-integration.js';

class ConversationAgent {
  constructor() {
    this.conversationHistory = [];
    this.maxHistory = 10;
  }

  async processQuery(userMessage, userId = 'default') {
    // Recuperar contexto do RAG
    const ragContext = ragService.buildContext(userMessage, 3);

    // Recuperar histórico
    const history = memoryService.getConversationHistory(5);

    // Recuperar memória pessoal
    const personalMemory = memoryService.getMemoriesByCategory('user_preferences');

    // Análise de intenção
    const intent = this.analyzeIntent(userMessage);

    // Construir contexto completo
    const fullContext = {
      userMessage,
      ragContext,
      history: history.map(h => ({
        user: h.user_message,
        alfred: h.alfred_response
      })),
      personalMemory,
      sources: ragContext.sources,
      intent
    };

    // Gerar resposta usando Claude API (ou fallback)
    let response;
    if (claudeIntegration.isEnabled()) {
      response = await claudeIntegration.generateResponse(userMessage, fullContext);
    } else {
      response = await this.generateFallbackResponse(userMessage, fullContext, intent);
    }

    // Salvar na memória
    memoryService.addConversation(userId, userMessage, response, fullContext);

    return {
      message: response,
      intent,
      sources: ragContext.sources,
      context: fullContext,
      usingClaude: claudeIntegration.isEnabled()
    };
  }

  analyzeIntent(message) {
    const lower = message.toLowerCase();
    const patterns = {
      informational: /qual|o que|como|por que|quando|onde/i,
      conversational: /oi|olá|tudo bem|como|você/i,
      analytical: /analise|compare|diferença|vantagem|desvantagem/i,
      planning: /plano|estratégia|objetivo|meta|próximo/i,
      help: /ajuda|pode|consigo|dúvida|problema/i,
      document: /pdf|documento|arquivo|livro|capítulo/i,
      learning: /aprenda|aprendo|estou aprendendo|ensine|explique/i
    };

    let intent = 'general';
    let score = 0;

    Object.entries(patterns).forEach(([key, pattern]) => {
      const matches = message.match(pattern);
      if (matches && matches.length > score) {
        intent = key;
        score = matches.length;
      }
    });

    return { type: intent, confidence: Math.min(1, score / 3) };
  }

  async generateFallbackResponse(userMessage, context, intent) {
    // Se tem contexto de RAG, usar para construir resposta
    if (context.ragContext.sources.length > 0) {
      return this.buildRAGResponse(userMessage, context.ragContext.sources[0], intent);
    }

    // Se é conversacional, responder naturalmente
    if (intent.type === 'conversational') {
      return this.buildConversationalResponse(context);
    }

    // Se é documento, mencionar que poderia ajudar com PDFs
    if (intent.type === 'document') {
      return 'Posso trabalhar com documentos. Adicione PDFs sobre o tema e farei análises profundas.';
    }

    // Se é learning, ser educador
    if (intent.type === 'learning') {
      return 'Estou pronto para ensinar. Com os documentos certos, posso estruturar aprendizado progressivo.';
    }

    // Default: resposta ajudadora
    return 'Como posso ajudá-lo? Se compartilhar documentos, poderei oferecer respostas mais profundas.';
  }

  buildRAGResponse(query, source, intent) {
    const relevantText = source.text.substring(0, 350);
    return `Baseado em "${source.filename}": ${relevantText}...

Há mais detalhes disponíveis. Gostaria que eu aprofundasse em algum aspecto específico?`;
  }

  buildConversationalResponse(context) {
    if (context.history.length > 0) {
      return `Bom estar aqui novamente. Continuando de onde paramos, como posso ajudar?`;
    }
    return `Olá! Sou Alfred, seu assistente inteligente pessoal. Adicione documentos, faça perguntas ou explore tópicos comigo.`;
  }

  updateMemory(userId, key, value, category = 'general') {
    memoryService.saveMemory(key, value, category);
  }

  getConversationContext(limit = 5) {
    return memoryService.getConversationHistory(limit);
  }

  setClaudeApiKey(apiKey) {
    claudeIntegration.setApiKey(apiKey);
  }
}

export default new ConversationAgent();
