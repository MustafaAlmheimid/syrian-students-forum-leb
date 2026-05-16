import db from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const questions = db.prepare(`
        SELECT * FROM questions ORDER BY created_at DESC
      `).all();
      return res.status(200).json(questions);
    }

    if (req.method === 'POST') {
      const { user_id, user_name, title, content } = req.body;
      const stmt = db.prepare(`
        INSERT INTO questions (user_id, user_name, title, content, answered)
        VALUES (?, ?, ?, ?, 0)
      `);
      const result = stmt.run(user_id, user_name, title, content);
      const newQ = db.prepare('SELECT * FROM questions WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(newQ);
    }

    if (req.method === 'PUT') {
      const { id, answered } = req.body;
      db.prepare('UPDATE questions SET answered = ? WHERE id = ?').run(answered ? 1 : 0, id);
      const updated = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
      return res.status(200).json(updated);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
