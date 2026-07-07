import axios from 'axios';

class Embedder {
  constructor(model = 'all-minilm-l6-v2') {
    this.model = model;
    this.serviceUrl = process.env.EMBEDDING_SERVICE || 'http://localhost:8000';
  }

  async embed(text) {
    try {
      const response = await axios.post(`${this.serviceUrl}/embed`, {
        text,
        model: this.model
      });
      return response.data.embedding;
    } catch (error) {
      console.warn('Embedding service unavailable, using fallback');
      return this.fallbackEmbedding(text);
    }
  }

  async embedBatch(texts) {
    return Promise.all(texts.map(text => this.embed(text)));
  }

  fallbackEmbedding(text) {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);
    
    words.forEach((word, idx) => {
      const hash = this.simpleHash(word);
      const pos = hash % embedding.length;
      embedding[pos] += 1 / (idx + 1);
    });

    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    return embedding.map(v => v / (norm || 1));
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

export default Embedder;
