import db from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const posts = db.prepare(`
        SELECT * FROM posts 
        WHERE published = 1 
        ORDER BY created_at DESC
      `).all();
      return res.status(200).json(posts);
    }

    if (req.method === 'POST') {
      const { title, content, category } = req.body;
      const stmt = db.prepare(`
        INSERT INTO posts (title, content, category, published)
        VALUES (?, ?, ?, 1)
      `);
      const result = stmt.run(title, content, category);
      const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(newPost);
    }

    if (req.method === 'PUT') {
      const { id, title, content, category, published } = req.body;
      db.prepare(`
        UPDATE posts SET title = ?, content = ?, category = ?, published = ?
        WHERE id = ?
      `).run(title, content, category, published ? 1 : 0, id);
      const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      db.prepare('DELETE FROM posts WHERE id = ?').run(id);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
