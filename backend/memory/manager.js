import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

class MemoryManager {
  constructor(dbPath = './storage/alfred.db') {
    this.db = new Database(dbPath);
    this.initDB();
  }

  initDB() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS short_term (
        id TEXT PRIMARY KEY,
        conversation_id TEXT,
        role TEXT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS medium_term (
        id TEXT PRIMARY KEY,
        project_name TEXT,
        content JSON,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS long_term (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE,
        value JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_short_term_conversation 
        ON short_term(conversation_id DESC);
      CREATE INDEX IF NOT EXISTS idx_long_term_key 
        ON long_term(key);
    `);
  }

  // SHORT TERM: Histórico da conversa atual
  addShortTerm(conversationId, role, content) {
    const stmt = this.db.prepare(`
      INSERT INTO short_term (id, conversation_id, role, content)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(uuid(), conversationId, role, content);
  }

  getShortTerm(conversationId, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT role, content, timestamp
      FROM short_term
      WHERE conversation_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(conversationId, limit).reverse();
  }

  // MEDIUM TERM: Projetos em andamento
  setMediumTerm(projectName, content) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO medium_term (id, project_name, content)
      VALUES (?, ?, ?)
    `);
    stmt.run(uuid(), projectName, JSON.stringify(content));
  }

  getMediumTerm(projectName) {
    const stmt = this.db.prepare(`
      SELECT content FROM medium_term WHERE project_name = ?
    `);
    const result = stmt.get(projectName);
    return result ? JSON.parse(result.content) : null;
  }

  // LONG TERM: Informações permanentes
  setLongTerm(key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO long_term (id, key, value)
      VALUES (?, ?, ?)
    `);
    stmt.run(uuid(), key, JSON.stringify(value));
  }

  getLongTerm(key) {
    const stmt = this.db.prepare(`
      SELECT value FROM long_term WHERE key = ?
    `);
    const result = stmt.get(key);
    return result ? JSON.parse(result.value) : null;
  }

  // Recuperar contexto completo antes de chamar LLM
  getFullContext(conversationId) {
    const shortTerm = this.getShortTerm(conversationId, 20);
    const longTerm = this.getLongTerm('user_profile');
    
    return {
      history: shortTerm,
      userProfile: longTerm,
      timestamp: new Date()
    };
  }

  close() {
    this.db.close();
  }
}

export default MemoryManager;
