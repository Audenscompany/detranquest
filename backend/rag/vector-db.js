import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import Embedder from './embedder.js';

class VectorDB {
  constructor(dbPath = './storage/alfred.db') {
    this.db = new Database(dbPath);
    this.embedder = new Embedder();
    this.initDB();
  }

  initDB() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT,
        content_hash TEXT UNIQUE,
        ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT,
        chunk_index INTEGER,
        content TEXT,
        embedding BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(document_id) REFERENCES documents(id)
      );

      CREATE INDEX IF NOT EXISTS idx_chunks_document 
        ON chunks(document_id);
    `);
  }

  async addDocument(filename, contentHash, chunks) {
    const docId = uuid();
    
    const docStmt = this.db.prepare(`
      INSERT INTO documents (id, filename, content_hash)
      VALUES (?, ?, ?)
    `);
    docStmt.run(docId, filename, contentHash);

    const chunkStmt = this.db.prepare(`
      INSERT INTO chunks (id, document_id, chunk_index, content, embedding)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.embedder.embed(chunks[i]);
      chunkStmt.run(
        uuid(),
        docId,
        i,
        chunks[i],
        JSON.stringify(embedding)
      );
    }

    return docId;
  }

  async search(query, limit = 5) {
    const queryEmbedding = await this.embedder.embed(query);
    const stmt = this.db.prepare(`
      SELECT id, document_id, chunk_index, content, embedding
      FROM chunks
      LIMIT 100
    `);
    
    const chunks = stmt.all();
    const results = [];

    for (const chunk of chunks) {
      const chunkEmbedding = JSON.parse(chunk.embedding);
      const similarity = this.embedder.cosineSimilarity(queryEmbedding, chunkEmbedding);
      
      if (similarity > 0.3) {
        results.push({
          docId: chunk.document_id,
          chunkIndex: chunk.chunk_index,
          content: chunk.content,
          similarity
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  getDocument(docId) {
    const stmt = this.db.prepare(`
      SELECT filename FROM documents WHERE id = ?
    `);
    return stmt.get(docId);
  }

  close() {
    this.db.close();
  }
}

export default VectorDB;
