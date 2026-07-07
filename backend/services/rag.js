import { v4 as uuid } from 'uuid';
import memoryService from './memory.js';
import documentProcessor from './document-processor.js';

class RAGService {
  constructor() {
    this.CHUNK_SIZE = 1000;
    this.CHUNK_OVERLAP = 200;
    this.knowledgeBase = [];
    this.loadInMemoryCache();
  }

  loadInMemoryCache() {
    // Recuperar documentos do banco
    const docs = memoryService.getDocuments();
    docs.forEach(doc => {
      const embeddings = memoryService.getEmbeddingsForDocument(doc.id);
      if (embeddings.length > 0) {
        this.knowledgeBase.push({
          docId: doc.id,
          filename: doc.filename,
          chunks: embeddings.map(e => e.text),
          embeddings: embeddings.map(e => e.embedding),
          chunksCount: embeddings.length
        });
      }
    });
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

  // Ingerir documento processado
  async ingestDocument(buffer, filename) {
    try {
      // Processar documento
      const processing = await documentProcessor.processDocument(buffer, filename);

      if (!processing.success) {
        throw new Error(processing.error || 'Erro ao processar documento');
      }

      // Se já foi processado, retornar
      if (!processing.new) {
        return {
          docId: processing.docId,
          new: false,
          message: processing.message
        };
      }

      const { data } = processing;
      const docId = uuid();

      // Dividir em chunks
      const chunks = this.chunkText(data.fullText);

      // Gerar embeddings
      const embeddings = chunks.map(chunk => this.simpleEmbedding(chunk));

      // Salvar no banco
      memoryService.trackDocument(
        docId,
        data.filename,
        data.hash,
        data.fullText,
        chunks.length
      );

      chunks.forEach((chunk, idx) => {
        memoryService.saveEmbedding(docId, idx, chunk, embeddings[idx]);
      });

      // Atualizar cache em memória
      this.knowledgeBase.push({
        docId,
        filename: data.filename,
        chunks,
        embeddings,
        chunksCount: chunks.length
      });

      // Salvar análise
      memoryService.saveMemory(`doc_analysis_${docId}`, data.analysis, 'document_analysis');

      return {
        docId,
        new: true,
        chunksCount: chunks.length,
        analysis: data.analysis,
        message: `✅ ${data.filename} absorvido com sucesso (${chunks.length} chunks)`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Embedding simples baseado em frequência de palavras
  simpleEmbedding(text) {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = {};

    words.forEach(word => {
      // Remover pontuação
      const clean = word.replace(/[^\w]/g, '');
      if (clean.length > 2) {
        embedding[clean] = (embedding[clean] || 0) + 1;
      }
    });

    // Normalizar
    const total = Object.values(embedding).reduce((a, b) => a + b, 0);
    Object.keys(embedding).forEach(key => {
      embedding[key] = embedding[key] / total;
    });

    return embedding;
  }

  // Busca semântica
  search(query, limit = 5) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const queryEmbedding = this.simpleEmbedding(query);
    const results = [];

    this.knowledgeBase.forEach(doc => {
      doc.chunks.forEach((chunk, idx) => {
        const similarity = this.cosineSimilarity(
          queryEmbedding,
          doc.embeddings[idx]
        );
        
        if (similarity > 0.01) { // Filtro mínimo
          results.push({
            docId: doc.docId,
            filename: doc.filename,
            chunkIndex: idx,
            text: chunk.substring(0, 500),
            similarity,
            fullText: chunk
          });
        }
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
        .join('\n\n'),
      count: reranked.length
    };
  }
}

export default new RAGService();
