const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.get('/me', auth(), async (req, res) => {
  const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  res.json(result.rows[0]);
});

router.patch('/me', auth(), async (req, res) => {
  const { name, lang, building_id, entrance, apartment } = req.body;
  await pool.query(
    'UPDATE users SET name=$1, lang=$2, building_id=$3, entrance=$4, apartment=$5 WHERE id=$6',
    [name, lang, building_id, entrance, apartment, req.user.id]
  );
  res.json({ message: 'Updated' });
});

// Admin: get all users
router.get('/', auth(['admin']), async (req, res) => {
  const result = await pool.query('SELECT id, phone, name, role, building_id, entrance, apartment, created_at FROM users ORDER BY created_at DESC');
  res.json(result.rows);
});

// Admin: change user role
router.patch('/:id/role', auth(['admin']), async (req, res) => {
  const { role } = req.body;
  if (!['resident', 'executor', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  await pool.query('UPDATE users SET role=$1 WHERE id=$2', [role, req.params.id]);
  res.json({ message: 'Role updated' });
});

module.exports = router;
