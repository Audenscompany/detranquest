import axios from 'axios';
import memoryService from './memory.js';

class ToolsAgent {
  constructor() {
    this.tools = new Map();
    this.initializeDefaultTools();
  }

  initializeDefaultTools() {
    // Ferramenta de busca na web (simples)
    this.registerTool('web_search', {
      description: 'Buscar informações na web',
      params: ['query'],
      handler: async (query) => {
        // Por enquanto, simular busca local
        return {
          success: true,
          results: [],
          message: 'Web search não está configurado ainda'
        };
      }
    });

    // Ferramenta de calculadora
    this.registerTool('calculate', {
      description: 'Realizar cálculos matemáticos',
      params: ['expression'],
      handler: async (expression) => {
        try {
          // Segurança básica: apenas números e operadores simples
          if (!/^[\d+\-*/().\s]+$/.test(expression)) {
            throw new Error('Expressão inválida');
          }
          // eslint-disable-next-line no-eval
          const result = eval(expression);
          return { success: true, result };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });

    // Ferramenta de lembretes
    this.registerTool('set_reminder', {
      description: 'Definir um lembrete',
      params: ['title', 'date'],
      handler: async (title, date) => {
        const reminder = {
          title,
          date,
          createdAt: new Date()
        };
        memoryService.saveMemory(`reminder_${Date.now()}`, reminder, 'reminders');
        return { success: true, message: `Lembrete definido: ${title}` };
      }
    });

    // Ferramenta de nota
    this.registerTool('save_note', {
      description: 'Salvar uma nota',
      params: ['title', 'content'],
      handler: async (title, content) => {
        const note = {
          title,
          content,
          createdAt: new Date()
        };
        memoryService.saveMemory(`note_${Date.now()}`, note, 'notes');
        return { success: true, message: `Nota salva: ${title}` };
      }
    });
  }

  registerTool(name, tool) {
    this.tools.set(name, tool);
  }

  async executeTool(toolName, params) {
    const tool = this.tools.get(toolName);

    if (!tool) {
      return { success: false, error: `Ferramenta não encontrada: ${toolName}` };
    }

    try {
      return await tool.handler(...params);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getAvailableTools() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      params: tool.params
    }));
  }

  canUseToolFor(intent) {
    // Lógica para decidir se uma ferramenta é útil para um intent
    const toolSuggestions = {
      calculation: 'calculate',
      planning: 'set_reminder',
      note_taking: 'save_note',
      research: 'web_search'
    };

    return toolSuggestions[intent] || null;
  }
}

export default new ToolsAgent();
