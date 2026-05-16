import db from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { post_id } = req.query;
      let sql = 'SELECT * FROM comments ORDER BY created_at ASC';
      let params = [];
      
      if (post_id) {
        sql = 'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC';
        params = [post_id];
      }
      
      const comments = db.prepare(sql).all(...params);
      return res.status(200).json(comments);
    }

    if (req.method === 'POST') {
      const { post_id, user_id, user_name, content } = req.body;
      const stmt = db.prepare(`
        INSERT INTO comments (post_id, user_id, user_name, content)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(post_id, user_id, user_name, content);
      const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(newComment);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      db.prepare('DELETE FROM comments WHERE id = ?').run(id);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
