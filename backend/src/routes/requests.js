const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all requests (admin) or own (resident/executor)
router.get('/', auth(), async (req, res) => {
  const { status, category_id, building_id } = req.query;
  const { id, role } = req.user;

  let query = `
    SELECT r.*,
      c.name_ru as category_ru, c.name_kz as category_kz,
      u.name as author_name, u.phone as author_phone,
      e.name as executor_name
    FROM requests r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN users u ON r.author_id = u.id
    LEFT JOIN users e ON r.executor_id = e.id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (role === 'resident') {
    query += ` AND r.author_id = $${idx++}`;
    params.push(id);
  } else if (role === 'executor') {
    query += ` AND r.executor_id = $${idx++}`;
    params.push(id);
  }

  if (status) { query += ` AND r.status = $${idx++}`; params.push(status); }
  if (category_id) { query += ` AND r.category_id = $${idx++}`; params.push(category_id); }
  if (building_id && role === 'admin') { query += ` AND r.building_id = $${idx++}`; params.push(building_id); }

  query += ' ORDER BY r.created_at DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get single request
router.get('/:id', auth(), async (req, res) => {
  const result = await pool.query(`
    SELECT r.*,
      c.name_ru as category_ru, c.name_kz as category_kz,
      u.name as author_name, u.phone as author_phone,
      e.name as executor_name
    FROM requests r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN users u ON r.author_id = u.id
    LEFT JOIN users e ON r.executor_id = e.id
    WHERE r.id = $1
  `, [req.params.id]);

  if (!result.rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(result.rows[0]);
});

// Create request
router.post('/', auth(['resident']), async (req, res) => {
  const { category_id, description, photos, building_id } = req.body;

  const result = await pool.query(
    `INSERT INTO requests (id, category_id, author_id, building_id, description, photos)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [uuidv4(), category_id, req.user.id, building_id, description, photos || []]
  );

  // Create notification for admin
  await pool.query(
    `INSERT INTO notifications (id, user_id, title_ru, title_kz, body_ru, body_kz, request_id)
     SELECT $1, u.id, 'Новая заявка', 'Жаңа өтінім', $2, $2, $3
     FROM users u WHERE u.role = 'admin'`,
    [uuidv4(), `Создана новая заявка: ${description.substring(0, 50)}`, result.rows[0].id]
  );

  res.status(201).json(result.rows[0]);
});

// Update status
router.patch('/:id/status', auth(['executor', 'admin']), async (req, res) => {
  const { status, comment } = req.body;
  const validStatuses = ['accepted', 'assigned', 'in_progress', 'done', 'closed'];

  if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const current = await pool.query('SELECT * FROM requests WHERE id=$1', [req.params.id]);
  if (!current.rows.length) return res.status(404).json({ message: 'Not found' });

  const old = current.rows[0];

  await pool.query(
    'UPDATE requests SET status=$1, updated_at=NOW() WHERE id=$2',
    [status, req.params.id]
  );

  await pool.query(
    `INSERT INTO status_history (id, request_id, changed_by, old_status, new_status, comment)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [uuidv4(), req.params.id, req.user.id, old.status, status, comment || null]
  );

  // Notify author
  await pool.query(
    `INSERT INTO notifications (id, user_id, title_ru, title_kz, body_ru, body_kz, request_id)
     VALUES ($1,$2,'Статус изменён','Мәртебе өзгерді',$3,$3,$4)`,
    [uuidv4(), old.author_id, `Статус заявки изменён на: ${status}`, req.params.id]
  );

  res.json({ message: 'Status updated' });
});

// Assign executor (admin only)
router.patch('/:id/assign', auth(['admin']), async (req, res) => {
  const { executor_id } = req.body;

  await pool.query(
    'UPDATE requests SET executor_id=$1, status=$2, updated_at=NOW() WHERE id=$3',
    [executor_id, 'assigned', req.params.id]
  );

  // Notify executor
  await pool.query(
    `INSERT INTO notifications (id, user_id, title_ru, title_kz, body_ru, body_kz, request_id)
     VALUES ($1,$2,'Вам назначена заявка','Сізге өтінім тағайындалды','Вам назначена новая заявка','Сізге жаңа өтінім тағайындалды',$3)`,
    [uuidv4(), executor_id, req.params.id]
  );

  res.json({ message: 'Executor assigned' });
});

// Get history
router.get('/:id/history', auth(), async (req, res) => {
  const result = await pool.query(
    `SELECT sh.*, u.name as changed_by_name
     FROM status_history sh
     LEFT JOIN users u ON sh.changed_by = u.id
     WHERE sh.request_id = $1 ORDER BY sh.created_at ASC`,
    [req.params.id]
  );
  res.json(result.rows);
});

module.exports = router;
