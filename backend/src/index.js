require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

const app = express();

// Run DB schema on startup
async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'config/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('DB schema initialized');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}
initDB();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.options('*', cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Socket.io — real-time notifications
io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
  socket.on('disconnect', () => {});
});

app.set('io', io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
