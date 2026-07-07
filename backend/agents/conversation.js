import LLMProvider from '../llm/provider.js';
import MemoryManager from '../memory/manager.js';
import VectorDB from '../rag/vector-db.js';

class ConversationAgent {
  constructor(config = {}) {
    this.llm = new LLMProvider(config.llm);
    this.memory = new MemoryManager();
    this.vectorDb = new VectorDB();
    this.conversationId = config.conversationId;
  }

  async process(userMessage) {
    // 1. Recuperar contexto de memória
    const memoryContext = this.memory.getFullContext(this.conversationId);

    // 2. Buscar em PDFs (RAG automático)
    const pdfContext = await this.vectorDb.search(userMessage, 3);
    const pdfText = pdfContext
      .map((c, i) => `[Fonte ${i + 1}] ${c.content}`)
      .join('\n\n');

    // 3. Montar contexto completo
    const fullContext = this.buildContext(userMessage, memoryContext, pdfText);

    // 4. Chamar LLM (NUNCA gerar resposta em JS)
    const response = await this.llm.generate(
      fullContext.messages,
      fullContext.systemPrompt
    );

    // 5. Salvar na memória
    this.memory.addShortTerm(this.conversationId, 'user', userMessage);
    this.memory.addShortTerm(this.conversationId, 'assistant', response);

    return {
      message: response,
      sources: pdfContext.map(c => c.docId)
    };
  }

  buildContext(userMessage, memoryContext, pdfText) {
    const systemPrompt = `Você é Alfred, um assistente pessoal inteligente.

CARACTERÍSTICAS:
- Conversa natural e sem clichês
- Nunca diz "tenho conhecimento sobre..." ou "baseado no que absorvi..."
- Responde como uma pessoa inteligente, não como chatbot
- Utiliza automaticamente informações disponíveis
- Conversação fluida e natural

INFORMAÇÕES DO USUÁRIO:
${memoryContext.userProfile ? JSON.stringify(memoryContext.userProfile, null, 2) : 'Nenhuma informação prévia'}

CONTEXTO DE DOCUMENTOS:
${pdfText || 'Nenhum documento relevante encontrado'}

Responda naturalmente. Nunca mencione que está processando contexto.`;

    const messages = [
      ...memoryContext.history.map(h => ({
        role: h.role,
        content: h.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    return { systemPrompt, messages };
  }
}

export default ConversationAgent;
