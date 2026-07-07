import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuid } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../storage/alfred.db');

class MemoryService {
  constructor() {
    this.db = new Database(DB_PATH);
    this.initializeTables();
  }

  initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_message TEXT NOT NULL,
        alfred_response TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        context JSON
      );

      CREATE TABLE IF NOT EXISTS long_term_memory (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSON NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        content_hash TEXT,
        extracted_text TEXT,
        chunks_count INTEGER,
        ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        chunk_index INTEGER,
        text_chunk TEXT,
        embedding JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(document_id) REFERENCES documents(id)
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_timestamp 
        ON conversations(timestamp DESC);
      
      CREATE INDEX IF NOT EXISTS idx_long_term_memory_category 
        ON long_term_memory(category);
    `);
  }

  addConversation(userId, userMsg, alfredResponse, context = null) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (id, user_message, alfred_response, context)
      VALUES (?, ?, ?, ?)
    `);
    const id = uuid();
    stmt.run(id, userMsg, alfredResponse, JSON.stringify(context));
    return id;
  }

  getConversationHistory(limit = 20) {
    const stmt = this.db.prepare(`
      SELECT user_message, alfred_response, timestamp, context
      FROM conversations
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit).reverse();
  }

  saveMemory(key, value, category = 'general') {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO long_term_memory (id, key, value, category)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(uuid(), key, JSON.stringify(value), category);
  }

  getMemory(key) {
    const stmt = this.db.prepare(`
      SELECT value FROM long_term_memory WHERE key = ?
    `);
    const result = stmt.get(key);
    return result ? JSON.parse(result.value) : null;
  }

  getMemoriesByCategory(category) {
    const stmt = this.db.prepare(`
      SELECT key, value FROM long_term_memory WHERE category = ?
    `);
    return stmt.all(category).map(r => ({
      key: r.key,
      value: JSON.parse(r.value)
    }));
  }

  trackDocument(id, filename, contentHash, extractedText, chunksCount) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO documents 
      (id, filename, content_hash, extracted_text, chunks_count)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, filename, contentHash, extractedText, chunksCount);
  }

  getDocuments() {
    const stmt = this.db.prepare(`
      SELECT id, filename, chunks_count, ingested_at
      FROM documents
      ORDER BY ingested_at DESC
    `);
    return stmt.all();
  }

  saveEmbedding(docId, chunkIndex, text, embedding) {
    const stmt = this.db.prepare(`
      INSERT INTO embeddings (id, document_id, chunk_index, text_chunk, embedding)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(uuid(), docId, chunkIndex, text, JSON.stringify(embedding));
  }

  getEmbeddingsForDocument(docId) {
    const stmt = this.db.prepare(`
      SELECT chunk_index, text_chunk, embedding
      FROM embeddings
      WHERE document_id = ?
      ORDER BY chunk_index
    `);
    return stmt.all(docId).map(r => ({
      chunkIndex: r.chunk_index,
      text: r.text_chunk,
      embedding: JSON.parse(r.embedding)
    }));
  }

  close() {
    this.db.close();
  }
}

export default new MemoryService();
