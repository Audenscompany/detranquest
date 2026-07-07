import * as pdfjs from 'pdfjs-dist';
import crypto from 'crypto';
import memoryService from './memory.js';

pdfjs.GlobalWorkerOptions.workerSrc = 
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

class DocumentProcessor {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.supportedFormats = ['pdf'];
    this.minContentLength = 100; // caracteres
  }

  validateFile(buffer, filename) {
    // Validar tamanho
    if (buffer.length > this.maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validar formato
    const ext = filename.split('.').pop().toLowerCase();
    if (!this.supportedFormats.includes(ext)) {
      throw new Error(`Formato não suportado. Suportados: ${this.supportedFormats.join(', ')}`);
    }

    // Validar se é PDF válido
    if (!this.isPDFValid(buffer)) {
      throw new Error('Arquivo PDF inválido ou corrompido');
    }

    return true;
  }

  isPDFValid(buffer) {
    const header = buffer.toString('utf8', 0, 5);
    return header === '%PDF-';
  }

  async extractText(buffer) {
    try {
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      let fullText = '';
      const pageTexts = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
            .trim();
          
          pageTexts.push(pageText);
          fullText += pageText + '\n';
        } catch (pageError) {
          console.warn(`Erro ao processar página ${pageNum}:`, pageError.message);
        }
      }

      if (fullText.length < this.minContentLength) {
        throw new Error('PDF não contém texto suficiente');
      }

      return {
        fullText: fullText.trim(),
        pageTexts,
        pages: pdf.numPages,
        length: fullText.length
      };
    } catch (error) {
      throw new Error(`Erro ao extrair texto: ${error.message}`);
    }
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Remover espaços múltiplos
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remover caracteres de controle
      .trim();
  }

  calculateHash(buffer) {
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex');
  }

  async processDocument(buffer, filename) {
    // Validar
    this.validateFile(buffer, filename);

    // Verificar se já foi processado
    const hash = this.calculateHash(buffer);
    const cached = memoryService.getMemory(`doc_hash_${hash}`);
    
    if (cached) {
      return {
        success: true,
        new: false,
        docId: cached,
        message: 'Documento já foi processado anteriormente'
      };
    }

    // Extrair texto
    const extraction = await this.extractText(buffer);
    const cleanedText = this.cleanText(extraction.fullText);

    // Análise de conteúdo
    const analysis = this.analyzeContent(cleanedText, filename);

    return {
      success: true,
      new: true,
      data: {
        hash,
        filename,
        fullText: cleanedText,
        pageTexts: extraction.pageTexts,
        pages: extraction.pages,
        contentLength: cleanedText.length,
        wordCount: cleanedText.split(/\s+/).length,
        analysis
      }
    };
  }

  analyzeContent(text, filename) {
    const lines = text.split('\n');
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));

    return {
      pageCount: lines.length,
      wordCount: words.length,
      uniqueWords: uniqueWords.size,
      averageWordsPerLine: words.length / lines.length,
      language: this.detectLanguage(text),
      contentType: this.detectContentType(filename, text),
      readability: this.calculateReadability(text)
    };
  }

  detectLanguage(text) {
    // Detecção simples baseada em palavras comuns
    const ptWords = ['o', 'a', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é'];
    const enWords = ['the', 'and', 'a', 'of', 'to', 'in', 'is', 'for', 'on', 'with'];

    const textLower = text.toLowerCase();
    const ptCount = ptWords.filter(word => textLower.includes(word)).length;
    const enCount = enWords.filter(word => textLower.includes(word)).length;

    if (ptCount > enCount) return 'pt-BR';
    if (enCount > ptCount) return 'en-US';
    return 'unknown';
  }

  detectContentType(filename, text) {
    const lower = filename.toLowerCase() + ' ' + text.toLowerCase();

    const types = {
      academic: ['research', 'study', 'abstract', 'pesquisa', 'estudo'],
      technical: ['code', 'python', 'javascript', 'database', 'api', 'algoritmo'],
      business: ['company', 'business', 'market', 'empresa', 'mercado', 'negócio'],
      psychology: ['psychology', 'behavior', 'apego', 'relacionamento', 'comportamento'],
      narrative: ['chapter', 'story', 'novel', 'capítulo', 'história', 'romance']
    };

    let bestMatch = 'general';
    let bestScore = 0;

    Object.entries(types).forEach(([type, keywords]) => {
      const score = keywords.filter(kw => lower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = type;
      }
    });

    return bestMatch;
  }

  calculateReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;

    // Score simples de legibilidade (0-100)
    let score = 100;
    if (avgWordsPerSentence > 25) score -= 20;
    if (avgWordsPerSentence > 30) score -= 20;

    return Math.max(0, score);
  }
}

export default new DocumentProcessor();
