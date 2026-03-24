const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', auth(), async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  res.json(result.rows);
});

router.patch('/:id/read', auth(), async (req, res) => {
  await pool.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ message: 'Marked as read' });
});

router.patch('/read-all', auth(), async (req, res) => {
  await pool.query('UPDATE notifications SET is_read=true WHERE user_id=$1', [req.user.id]);
  res.json({ message: 'All read' });
});

module.exports = router;
