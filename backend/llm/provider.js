import axios from 'axios';

class LLMProvider {
  constructor(config = {}) {
    this.provider = config.provider || 'claude';
    this.model = config.model || 'claude-opus-4.6';
    this.apiKey = config.apiKey;
    this.maxTokens = config.maxTokens || 2048;
  }

  async generate(messages, systemPrompt) {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    if (this.provider === 'claude') {
      return this.callClaude(messages, systemPrompt);
    }
    if (this.provider === 'openai') {
      return this.callOpenAI(messages, systemPrompt);
    }
    throw new Error(`Provider not supported: ${this.provider}`);
  }

  async callClaude(messages, systemPrompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: this.maxTokens,
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

      return response.data.content[0].text;
    } catch (error) {
      throw new Error(`Claude API: ${error.message}`);
    }
  }

  async callOpenAI(messages, systemPrompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          max_tokens: this.maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API: ${error.message}`);
    }
  }

  setModel(model) {
    this.model = model;
  }

  setProvider(provider) {
    this.provider = provider;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
}

export default LLMProvider;
