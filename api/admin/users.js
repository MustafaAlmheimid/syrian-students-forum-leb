import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

function verifyAdmin(req) {
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

  const auth = verifyAdmin(req);

  if (auth.error) {
    return res.status(auth.status).json({
      error: auth.error
    });
  }

  try {

    // GET USERS
    if (req.method === 'GET') {

      const users = db.prepare(`
        SELECT
          id,
          email,
          full_name,
          role,
          created_at
        FROM users
        ORDER BY created_at DESC
      `).all();

      return res.status(200).json(users);
    }

    // DELETE USER
    if (req.method === 'DELETE') {

      const { id } = req.body;

      db.prepare(`
        DELETE FROM users
        WHERE id = ?
      `).run(id);

      return res.status(200).json({
        ok: true
      });
    }

    // UPDATE ROLE
    if (req.method === 'PUT') {

      const { id, role } = req.body;

      db.prepare(`
        UPDATE users
        SET role = ?
        WHERE id = ?
      `).run(role, id);

      return res.status(200).json({
        ok: true
      });
    }

    return res.status(405).json({
      error: 'Method not allowed'
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
}