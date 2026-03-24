const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories WHERE is_active=true ORDER BY name_ru');
  res.json(result.rows);
});

router.post('/', auth(['admin']), async (req, res) => {
  const { name_ru, name_kz, icon } = req.body;
  const result = await pool.query(
    'INSERT INTO categories (id, name_ru, name_kz, icon) VALUES ($1,$2,$3,$4) RETURNING *',
    [uuidv4(), name_ru, name_kz, icon]
  );
  res.status(201).json(result.rows[0]);
});

router.patch('/:id', auth(['admin']), async (req, res) => {
  const { name_ru, name_kz, icon, is_active } = req.body;
  await pool.query(
    'UPDATE categories SET name_ru=$1, name_kz=$2, icon=$3, is_active=$4 WHERE id=$5',
    [name_ru, name_kz, icon, is_active, req.params.id]
  );
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth(['admin']), async (req, res) => {
  await pool.query('UPDATE categories SET is_active=false WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deactivated' });
});

module.exports = router;
