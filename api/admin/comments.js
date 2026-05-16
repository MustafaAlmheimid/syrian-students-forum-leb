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
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
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

    // GET COMMENTS
    if (req.method === 'GET') {

      const comments = db.prepare(`
        SELECT *
        FROM comments
        ORDER BY created_at DESC
      `).all();

      return res.status(200).json(comments);
    }

    // DELETE COMMENT
    if (req.method === 'DELETE') {

      const { id } = req.body;

      db.prepare(`
        DELETE FROM comments
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