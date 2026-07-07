import * as pdfjs from 'pdfjs-dist';
import { v4 as uuid } from 'uuid';
import memoryService from './memory.js';
import crypto from 'crypto';

pdfjs.GlobalWorkerOptions.workerSrc = 
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

class RAGService {
  constructor() {
    this.CHUNK_SIZE = 1000;
    this.CHUNK_OVERLAP = 200;
    this.knowledgeBase = [];
  }

  // Extrair texto de PDF
  async extractTextFromPDF(buffer) {
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      fullText += textContent.items
        .map(item => item.str)
        .join(' ') + '\n';
    }
    
    return fullText;
  }

  // Dividir texto em chunks
  chunkText(text) {
    const chunks = [];
    const tokens = text.split(/\s+/);
    
    for (let i = 0; i < tokens.length; i += this.CHUNK_SIZE - this.CHUNK_OVERLAP) {
      const chunk = tokens
        .slice(i, i + this.CHUNK_SIZE)
        .join(' ');
      if (chunk.trim().length > 50) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  // Ingerir PDF
  async ingestPDF(buffer, filename) {
    const docId = uuid();
    const contentHash = crypto
      .createHash('md5')
      .update(buffer)
      .digest('hex');

    // Verificar se já foi ingerido
    const existing = memoryService.getMemory(`doc_hash_${contentHash}`);
    if (existing) {
      return { docId: existing, new: false };
    }

    // Extrair texto
    const fullText = await this.extractTextFromPDF(buffer);

    // Dividir em chunks
    const chunks = this.chunkText(fullText);

    // Gerar embeddings simples (por agora, usamos frequência de palavras)
    const embeddings = chunks.map((chunk, idx) => 
      this.simpleEmbedding(chunk)
    );

    // Salvar no banco
    memoryService.trackDocument(
      docId,
      filename,
      contentHash,
      fullText,
      chunks.length
    );

    chunks.forEach((chunk, idx) => {
      memoryService.saveEmbedding(
        docId,
        idx,
        chunk,
        embeddings[idx]
      );
    });

    // Salvar hash no cache
    memoryService.saveMemory(
      `doc_hash_${contentHash}`,
      docId,
      'document_cache'
    );

    // Atualizar knowledge base em memória
    this.knowledgeBase.push({
      docId,
      filename,
      chunks,
      embeddings
    });

    return { docId, new: true, chunksCount: chunks.length };
  }

  // Embedding simples baseado em frequência de palavras
  simpleEmbedding(text) {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = {};

    words.forEach(word => {
      embedding[word] = (embedding[word] || 0) + 1;
    });

    // Normalizar
    const total = Object.values(embedding).reduce((a, b) => a + b, 0);
    Object.keys(embedding).forEach(key => {
      embedding[key] = embedding[key] / total;
    });

    return embedding;
  }

  // Busca semântica simples
  search(query, limit = 5) {
    const queryEmbedding = this.simpleEmbedding(query);
    const results = [];

    this.knowledgeBase.forEach(doc => {
      doc.chunks.forEach((chunk, idx) => {
        const similarity = this.cosineSimilarity(
          queryEmbedding,
          doc.embeddings[idx]
        );
        
        results.push({
          docId: doc.docId,
          filename: doc.filename,
          chunkIndex: idx,
          text: chunk,
          similarity
        });
      });
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Cosseno de similaridade
  cosineSimilarity(vec1, vec2) {
    const keys = new Set([
      ...Object.keys(vec1),
      ...Object.keys(vec2)
    ]);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    keys.forEach(key => {
      const v1 = vec1[key] || 0;
      const v2 = vec2[key] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  // Re-ranking com contexto
  rerank(results, userContext = {}) {
    return results.map(result => ({
      ...result,
      score: result.similarity * 
        (userContext.preference === result.filename ? 1.5 : 1)
    }))
    .sort((a, b) => b.score - a.score);
  }

  // Construir contexto para LLM
  buildContext(query, limit = 3) {
    const results = this.search(query, limit * 2);
    const reranked = this.rerank(results);
    
    return {
      query,
      sources: reranked.slice(0, limit),
      context: reranked
        .slice(0, limit)
        .map((r, idx) => `[Fonte ${idx + 1}: ${r.filename}]\n${r.text}`)
        .join('\n\n')
    };
  }
}

export default new RAGService();
