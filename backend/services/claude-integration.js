import axios from 'axios';

class ClaudeIntegration {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-opus-4.6';
    this.enabled = !!apiKey;
  }

  buildSystemPrompt() {
    return `Você é Alfred OS, um assistente inteligente pessoal de classe JARVIS.

DIRETRIZES CRÍTICAS:
1. Conversação natural - Sem clichês ("tenho conhecimento sobre...", "você está explorando...")
2. Raciocínio profundo - Sempre considere contexto, história e intenção
3. Memória ativa - Use histórico e preferências recuperadas
4. Análise inteligente - Cruze informações entre documentos
5. Honestidade - Diga quando não souber algo
6. Personalidade - Curioso, inteligente, calmo, bem-humorado quando apropriado

CONTEXTO DISPONÍVEL:
- Documentos absorvidos (PDFs, livros)
- Histórico de conversas
- Preferências e memória pessoal
- Análise de intenção do usuário

RESPONDA SEMPRE PENSANDO COMO UMA PESSOA INTELIGENTE, NÃO COMO UM CHATBOT.`;
  }

  async generateResponse(userMessage, context = {}) {
    if (!this.enabled) {
      return this.fallbackResponse(userMessage, context);
    }

    try {
      const messages = this.buildMessages(userMessage, context);
      const systemPrompt = this.buildSystemPrompt();

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          max_tokens: 1024,
          system: systemPrompt,
          messages
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.content?.[0]?.text) {
        return response.data.content[0].text;
      }

      return this.fallbackResponse(userMessage, context);
    } catch (error) {
      console.error('Erro ao chamar Claude API:', error.message);
      return this.fallbackResponse(userMessage, context);
    }
  }

  buildMessages(userMessage, context) {
    const messages = [];

    // Adicionar histórico se disponível
    if (context.history && context.history.length > 0) {
      context.history.forEach(entry => {
        messages.push({
          role: 'user',
          content: entry.user
        });
        messages.push({
          role: 'assistant',
          content: entry.alfred
        });
      });
    }

    // Construir contexto de RAG
    let contextStr = '';
    if (context.ragContext?.sources?.length > 0) {
      contextStr = '\n\n📚 CONTEXTO DOS DOCUMENTOS:\n';
      context.ragContext.sources.forEach((source, idx) => {
        contextStr += `\n[Fonte ${idx + 1}: ${source.filename}]\n${source.text}\n`;
      });
    }

    // Adicionar memória pessoal se existir
    if (context.personalMemory && context.personalMemory.length > 0) {
      contextStr += '\n\n💭 MEMÓRIA PESSOAL:\n';
      context.personalMemory.forEach(mem => {
        contextStr += `• ${mem.key}: ${JSON.stringify(mem.value)}\n`;
      });
    }

    // Mensagem final do usuário com contexto
    const finalMessage = contextStr
      ? `${contextStr}\n\nPergunta do usuário:\n${userMessage}`
      : userMessage;

    messages.push({
      role: 'user',
      content: finalMessage
    });

    return messages;
  }

  fallbackResponse(userMessage, context) {
    // Resposta inteligente sem API (offline mode)
    const lower = userMessage.toLowerCase();

    if (context.ragContext?.sources?.length > 0) {
      const topSource = context.ragContext.sources[0];
      return `Baseado em "${topSource.filename}", posso dizer que: ${topSource.text.substring(0, 250)}...

Deseja que eu aprofunde em algum aspecto?`;
    }

    if (lower.includes('apego') || lower.includes('relacionamento')) {
      return 'Explorar dinâmicas de apego é fascinante. Com documentos sobre psicologia relacional, posso oferecer insights mais profundos. Você tem PDFs sobre esse tema?';
    }

    if (context.history?.length > 0) {
      return 'Continuando nossa conversa anterior... como posso ajudá-lo agora?';
    }

    return 'Sou Alfred, seu assistente inteligente. Compartilhe documentos ou faça perguntas e vou ajudar com profundidade.';
  }

  isEnabled() {
    return this.enabled;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.enabled = !!apiKey;
  }
}

export default new ClaudeIntegration();
