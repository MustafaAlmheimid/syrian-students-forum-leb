import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

function verifyModeratorOrAdmin(req) {
  const adminKey = req.headers['x-admin-key'];

  if (adminKey !== 'admin123') {
    return {
      error: 'Unauthorized',
      status: 401
    };
  }

  return { ok: true };
}

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const auth = verifyModeratorOrAdmin(req);

  if (auth.error) {
    return res.status(auth.status).json({
      error: auth.error
    });
  }

  try {

    // GET POSTS
    if (req.method === 'GET') {

      const posts = db.prepare(`
        SELECT *
        FROM posts
        ORDER BY created_at DESC
      `).all();

      return res.status(200).json(posts);
    }

    // CREATE POST
    if (req.method === 'POST') {

      const {
        title,
        content,
        category
      } = req.body;

      const result = db.prepare(`
        INSERT INTO posts (
          title,
          content,
          category,
          published,
          created_at
        )
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(
        title,
        content,
        category,
        1
      );

      const post = db.prepare(`
        SELECT *
        FROM posts
        WHERE id = ?
      `).get(result.lastInsertRowid);

      return res.status(201).json(post);
    }

    // UPDATE POST
    if (req.method === 'PUT') {

      const {
        id,
        title,
        content,
        category,
        published
      } = req.body;

      db.prepare(`
        UPDATE posts
        SET
          title = ?,
          content = ?,
          category = ?,
          published = ?
        WHERE id = ?
      `).run(
        title,
        content,
        category,
        published ? 1 : 0,
        id
      );

      const updatedPost = db.prepare(`
        SELECT *
        FROM posts
        WHERE id = ?
      `).get(id);

      return res.status(200).json(updatedPost);
    }

    // DELETE POST
    if (req.method === 'DELETE') {

      const { id } = req.body;

      db.prepare(`
        DELETE FROM posts
        WHERE id = ?
      `).run(id);

      return res.status(200).json({
        ok: true
      });
    }

    return res.status(405).json({
      error: 'Method not allowed'
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });
  }
}