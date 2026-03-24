const router = require('express').Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone required' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await pool.query(
    'INSERT INTO otp_codes (id, phone, code, expires_at) VALUES ($1, $2, $3, $4)',
    [uuidv4(), phone, code, expiresAt]
  );

  // TODO: integrate SMS provider (Twilio/etc)
  console.log(`OTP for ${phone}: ${code}`);

  // TODO: remove code from response after SMS integration
  res.json({ message: 'OTP sent', code });
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'Phone and code required' });

    const result = await pool.query(
      'SELECT * FROM otp_codes WHERE phone=$1 AND code=$2 AND used=false AND expires_at > NOW() ORDER BY expires_at DESC LIMIT 1',
      [phone, code]
    );

    if (!result.rows.length) return res.status(400).json({ message: 'Invalid or expired code' });

    await pool.query('UPDATE otp_codes SET used=true WHERE id=$1', [result.rows[0].id]);

    // Get or create user
    let userResult = await pool.query('SELECT * FROM users WHERE phone=$1', [phone]);
    if (!userResult.rows.length) {
      userResult = await pool.query(
        'INSERT INTO users (id, phone) VALUES ($1, $2) RETURNING *',
        [uuidv4(), phone]
      );
    }

    const user = userResult.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, phone },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('verify-otp error:', err.message);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

module.exports = router;
