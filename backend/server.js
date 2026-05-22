// Doorium API Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const webpush = require('web-push');
const multer = require('multer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// === Нормализация телефона ===
function normalizePhone(phone) {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return phone;
  const d = digits.startsWith('7') ? digits : digits.startsWith('8') ? '7' + digits.slice(1) : '7' + digits;
  return '+7' + d.slice(1, 11);
}

// === Уведомления (Telegram + SMS) ===
const SITE_URL = process.env.SITE_URL || 'https://doorium.ru';
const {
  sendTelegram,
  sendSms,
  notifyUser,
  notifyUserById,
  notifyManagersAndAdmins,
  notifyPartner,
} = require('./notify');

const statusLabels = {
  new: 'Новая',
  pending: 'В ожидании',
  measurer_assigned: 'Замерщик назначен',
  installer_assigned: 'Монтажник назначен',
  date_agreed: 'Дата согласована',
  installation_rescheduled: 'Монтаж перенесён',
  measurement_done: 'Замер выполнен',
  closed: 'Закрыта',
  cancelled: 'Отменена',
  client_refused: 'Отказ клиента',
};

const roleLabels = {
  admin: 'Администратор',
  manager: 'Менеджер',
  measurer: 'Замерщик',
  installer: 'Монтажник',
  partner: 'Партнёр',
};

const typeLabels = {
  measurement: 'Замер',
  installation: 'Монтаж',
  reclamation: 'Рекламация',
};

// === Status flow validation ===
const statusFlows = {
  measurement: ['new', 'pending', 'measurer_assigned', 'date_agreed', 'measurement_done', 'closed', 'cancelled'],
  installation: ['new', 'pending', 'installer_assigned', 'date_agreed', 'installation_rescheduled', 'closed', 'cancelled'],
  reclamation: ['new', 'pending', 'installer_assigned', 'date_agreed', 'installation_rescheduled', 'closed', 'cancelled'],
};

function isValidTransition(type, fromStatus, toStatus, role) {
  // Admin can transition to ANY status
  if (role === 'admin') return true;
  if (['manager'].includes(role) && toStatus === 'pending' && fromStatus !== 'closed') return true;
  if (['manager'].includes(role) && toStatus === 'client_refused') return true;
  // Measurer/Installer can set pending or client_refused
  if (['measurer', 'installer'].includes(role) && ['pending', 'client_refused'].includes(toStatus)) return true;
  const flow = statusFlows[type] || statusFlows.measurement;
  if (toStatus === 'cancelled') return true;
  const fromIdx = flow.indexOf(fromStatus);
  const toIdx = flow.indexOf(toStatus);
  if (fromIdx === -1 || toIdx === -1) return false;
  if (fromStatus === 'installation_rescheduled' && toStatus === 'date_agreed') return true;
  return toIdx >= fromIdx;
}

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, native PWA, etc.)
    if (!origin) return callback(null, true);
    try {
      const host = new URL(origin).hostname;
      // Allow doorium.ru and ALL its subdomains
      if (host === 'doorium.ru' || host.endsWith('.doorium.ru')) {
        return callback(null, true);
      }
      // Allow Lovable preview / sandbox URLs
      if (host.endsWith('.lovable.app') || host.endsWith('.lovableproject.com') || host.endsWith('.lovable.dev')) {
        return callback(null, true);
      }
      // Allow localhost for dev
      if (host === 'localhost' || host === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (_) {}
    console.warn('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
let hasClosedAtColumn = false;

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'ru-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Невалидный токен' });
  }
};

// === Health ===
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', s3: process.env.S3_ENDPOINT });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.post('/api/notify/test-sms', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Только администратор может отправить тестовую SMS' });
  const phone = normalizePhone(req.body.phone) || req.body.phone;
  if (!phone) return res.status(400).json({ error: 'Укажите phone' });
  const message = req.body.message || `Doorium SMS test ${new Date().toLocaleString('ru-RU')}`;
  const result = await sendSms(phone, message, { diagnose: true });
  res.json(result);
});

// === Upload / Delete files ===
app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' });
    const ext = req.file.originalname.split('.').pop();
    const folder = req.body.folder || 'uploads';
    const key = folder + '/' + crypto.randomUUID() + '.' + ext;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    }));
    const url = '/api/files/' + key;
    res.json({ url, key });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

// === File proxy: streams S3 objects through our domain ===
// Public access (matches previous S3 ACL: public-read)
// Supports HTTP Range for video/PDF seeking
// RegExp route is compatible with Express 5/path-to-regexp v8 wildcards
app.get(/^\/api\/files\/(.+)$/, async (req, res) => {
  try {
    const key = req.params[0];
    if (!key) return res.status(400).send('Key required');

    const range = req.headers.range;
    const cmd = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ...(range ? { Range: range } : {}),
    });
    const s3Res = await s3.send(cmd);

    if (s3Res.ContentType) res.setHeader('Content-Type', s3Res.ContentType);
    if (s3Res.ContentLength != null) res.setHeader('Content-Length', s3Res.ContentLength);
    if (s3Res.ETag) res.setHeader('ETag', s3Res.ETag);
    if (s3Res.LastModified) res.setHeader('Last-Modified', s3Res.LastModified.toUTCString());
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (range && s3Res.ContentRange) {
      res.status(206);
      res.setHeader('Content-Range', s3Res.ContentRange);
    }

    s3Res.Body.on('error', (err) => {
      console.error('S3 stream error:', err.message);
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
    s3Res.Body.pipe(res);
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 404 || err.name === 'NoSuchKey') {
      return res.status(404).send('Not found');
    }
    console.error('File proxy error:', err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/files', auth, async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'Key не указан' });
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// === Auth ===

// Admin login (email + password)
app.post('/api/auth/admin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND role = 'admin' AND active = true",
      [email]
    );
    if (rows.length === 0) return res.status(403).json({ error: 'Неверные данные' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(403).json({ error: 'Неверный пароль' });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// === Rate limiting for registration ===
const registerAttempts = new Map();
setInterval(() => registerAttempts.clear(), 15 * 60 * 1000);

// Registration (public)
app.post('/api/auth/register', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = registerAttempts.get(ip) || 0;
  if (attempts >= 5) {
    return res.status(429).json({ error: 'Слишком много попыток. Попробуйте через 15 минут.' });
  }
  registerAttempts.set(ip, attempts + 1);

  const { name, phone: rawPhone, pin, role, telegram_id } = req.body;
  const phone = normalizePhone(rawPhone);
  if (!name || !phone || !pin || !role) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'ПИН-код должен быть 4 цифры' });
  }
  if (telegram_id && !/^\d+$/.test(telegram_id)) {
    return res.status(400).json({ error: 'Telegram ID должен содержать только цифры' });
  }
  if (!['manager', 'measurer', 'installer', 'partner'].includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Аккаунт с таким номером уже существует' });
    }
    const { rows } = await pool.query(
      'INSERT INTO users (name, phone, pin, role, telegram_id, active) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, name, role, active',
      [name, phone, pin, role, telegram_id]
    );
    await notifyManagersAndAdmins(pool,
      `👤 <b>Новая регистрация</b>\n\nИмя: ${name}\nТелефон: ${phone}\nРоль: ${roleLabels[role] || role}\n\nАккаунт ожидает активации.\n\n👉 <a href="${SITE_URL}/admin/accounts">Открыть аккаунты</a>`
    );
    res.json({ success: true, message: 'Регистрация отправлена на одобрение администратору', user: rows[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Login by phone + PIN
app.post('/api/auth/pin', async (req, res) => {
  const { phone: rawPhone, pin, device_token } = req.body;
  const phone = normalizePhone(rawPhone);
  if (!phone) return res.status(400).json({ error: 'Введите телефон' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (rows.length === 0) return res.status(403).json({ error: 'Аккаунт не найден' });
    const user = rows[0];
    if (!user.active) return res.status(403).json({ error: 'Аккаунт ожидает активации администратором' });

    if (device_token) {
      try {
        const decoded = jwt.verify(device_token, process.env.JWT_SECRET);
        if (decoded.phone === phone && decoded.type === 'device') {
          const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
          );
          const newDeviceToken = jwt.sign(
            { phone, type: 'device' },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
          );
          return res.json({ token, user: { id: user.id, name: user.name, role: user.role }, device_token: newDeviceToken });
        }
      } catch {
        // Invalid device token, fall through to PIN
      }
    }

    if (!pin) return res.status(400).json({ error: 'Введите ПИН-код' });
    if (user.pin !== pin) return res.status(403).json({ error: 'Неверный ПИН-код' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const newDeviceToken = jwt.sign(
      { phone, type: 'device' },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role }, device_token: newDeviceToken });
  } catch (err) {
    console.error('PIN auth error:', err);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// Telegram auth sessions
const telegramSessions = new Map();

app.post('/api/auth/telegram/session', (req, res) => {
  const code = crypto.randomUUID().slice(0, 8);
  telegramSessions.set(code, { status: 'pending', createdAt: Date.now() });
  setTimeout(() => telegramSessions.delete(code), 5 * 60 * 1000);
  res.json({ code });
});

app.post('/api/auth/telegram/confirm', async (req, res) => {
  const { code, telegramId } = req.body;
  const session = telegramSessions.get(code);
  if (!session) return res.status(404).json({ error: 'Сессия не найдена' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1 AND active = true',
      [telegramId]
    );
    if (rows.length === 0) return res.status(403).json({ error: 'Пользователь не найден' });
    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    telegramSessions.set(code, {
      status: 'confirmed',
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Confirm error:', err);
    res.status(500).json({ error: 'Ошибка' });
  }
});

app.get('/api/auth/telegram/check/:code', (req, res) => {
  const session = telegramSessions.get(req.params.code);
  if (!session) return res.json({ status: 'expired' });
  if (session.status === 'confirmed') {
    telegramSessions.delete(req.params.code);
    return res.json({ status: 'confirmed', token: session.token, user: session.user });
  }
  res.json({ status: 'pending' });
});

// === Users ===
app.get('/api/users', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const { rows } = await pool.query(
      'SELECT id, name, role, telegram_id, phone, email, notes, pin, active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

app.post('/api/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  const { name, role, telegramId, phone, email, notes, pin } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, role, telegram_id, phone, email, notes, pin, active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *',
      [name, role, telegramId, normalizePhone(phone) || null, email || null, notes || null, pin || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Ошибка создания' });
  }
});

app.put('/api/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const { id } = req.params;
    const { name, phone, email, notes, telegram_id, pin, active, role } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(normalizePhone(phone) || null); }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email || null); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes || null); }
    if (telegram_id !== undefined) { fields.push(`telegram_id = $${idx++}`); values.push(telegram_id || null); }
    if (pin !== undefined) { fields.push(`pin = $${idx++}`); values.push(pin || null); }
    if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }
    if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
    if (fields.length === 0) return res.status(400).json({ error: 'Нет данных' });
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Не найден' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

app.delete('/api/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const check = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (check.rows[0]?.role === 'admin') {
      return res.status(403).json({ error: 'Нельзя удалить администратора' });
    }
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Public upload for reclamation
app.post('/api/upload/reclamation', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' });
    if (req.file.size > 10 * 1024 * 1024) return res.status(400).json({ error: 'Максимум 10 МБ' });
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json({ error: 'Допустимы: JPG, PNG, WEBP, PDF' });
    const ext = req.file.originalname.split('.').pop();
    const key = 'reclamations/' + crypto.randomUUID() + '.' + ext;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    }));
    const url = '/api/files/' + key;
    res.json({ url, key });
  } catch (err) {
    console.error('Public reclamation upload error:', err);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

// === Requests ===
app.get('/api/requests', auth, async (req, res) => {
  try {
    const {
      page = 1, limit = 30,
      search, status, type, city, source,
      measurer_id, installer_id, partner_id,
      date_from, date_to, quick
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conds = [];
    const params = [];
    let idx = 1;

    if (req.user.role === 'partner') {
      conds.push(`partner_id = $${idx++}`); params.push(req.user.id);
    } else if (req.user.role === 'measurer') {
      conds.push(`measurer_id = $${idx++}`); params.push(req.user.id);
    } else if (req.user.role === 'installer') {
      conds.push(`(installer_id = $${idx} OR installer_2_id = $${idx} OR installer_3_id = $${idx} OR installer_4_id = $${idx})`); params.push(req.user.id); idx++;
    }

    const baseConds = [...conds];
    const baseParams = [...params];

    if (search) {
      conds.push(`(client_name ILIKE $${idx} OR number ILIKE $${idx} OR client_address ILIKE $${idx} OR client_phone ILIKE $${idx} OR city ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }
    if (status && status !== 'all') { conds.push(`status = $${idx++}`); params.push(status); }
    if (type && type !== 'all') { conds.push(`type = $${idx++}`); params.push(type); }
    if (measurer_id && measurer_id !== 'all') { conds.push(`measurer_id = $${idx++}`); params.push(measurer_id); }
    if (installer_id && installer_id !== 'all') { conds.push(`installer_id = $${idx++}`); params.push(installer_id); }
    if (city && city !== 'all') { conds.push(`city = $${idx++}`); params.push(city); }
    if (partner_id && partner_id !== 'all') { conds.push(`partner_id = $${idx++}`); params.push(partner_id); }
    if (source && source !== 'all') { conds.push(`source = $${idx++}`); params.push(source); }
    const allowedDateFields = ['created_at', 'closed_at', 'agreed_date'];
    const requestedDateField = allowedDateFields.includes(req.query.date_field) ? req.query.date_field : 'created_at';
    if (requestedDateField === 'closed_at') {
      conds.push(`status = 'closed'`);
    }
    const dateCol = requestedDateField === 'closed_at'
      ? (hasClosedAtColumn ? 'closed_at' : 'updated_at')
      : requestedDateField;
    if (date_from) { conds.push(`${dateCol} >= $${idx++}`); params.push(date_from); }
    if (date_to) { conds.push(`${dateCol} <= $${idx++}::date + interval '1 day'`); params.push(date_to); }

    if (quick === 'new') conds.push(`status = 'new'`);
    else if (quick === 'in_progress') conds.push(`status NOT IN ('new','closed','cancelled')`);
    else if (quick === 'pending') conds.push(`status = 'pending'`);
    else if (quick === 'reclamation') conds.push(`type = 'reclamation'`);

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const baseWhere = baseConds.length ? 'WHERE ' + baseConds.join(' AND ') : '';

    // Sort by the chosen date field (closed_at / agreed_date / created_at) — fallback to created_at
    const sortCol = requestedDateField === 'closed_at'
      ? (hasClosedAtColumn ? 'closed_at' : 'updated_at')
      : requestedDateField;
    const orderBy = `ORDER BY ${sortCol} DESC NULLS LAST, created_at DESC`;
    const [dataRes, countRes, countsRes] = await Promise.all([
      pool.query(`SELECT * FROM requests ${where} ${orderBy} LIMIT $${idx} OFFSET $${idx+1}`, [...params, parseInt(limit), offset]),
      pool.query(`SELECT COUNT(*)::int as total FROM requests ${where}`, params),
      pool.query(`SELECT COUNT(*)::int as "all", COUNT(*) FILTER (WHERE status='new')::int as "new", COUNT(*) FILTER (WHERE status='pending')::int as "pending", COUNT(*) FILTER (WHERE status NOT IN ('new','closed','cancelled'))::int as "in_progress", COUNT(*) FILTER (WHERE type='reclamation')::int as "reclamation" FROM requests ${baseWhere}`, baseParams)
    ]);

    let requestsData = dataRes.rows;
    const partnerIds = [...new Set(requestsData.map((row) => row.partner_id).filter(Boolean))];
    if (partnerIds.length > 0) {
      const partnerRes = await pool.query(
        'SELECT id, name, phone FROM users WHERE id = ANY($1::uuid[])',
        [partnerIds]
      );
      const partnersById = new Map(partnerRes.rows.map((p) => [p.id, p]));
      requestsData = requestsData.map((row) => {
        if (!row.partner_id) return row;
        const partner = partnersById.get(row.partner_id);
        return partner ? { ...row, partner_name: partner.name, partner_phone: partner.phone || null } : row;
      });
    }

    res.json({
      data: requestsData,
      total: countRes.rows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      counts: countsRes.rows[0]
    });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Ошибка загрузки заявок' });
  }
});

// Public request from website
app.post('/api/requests/public', async (req, res) => {
  try {
    const { client_name, client_phone: rawPhone, client_address, city, type, work_description, extra_name, extra_phone: rawExtraPhone, source, photos } = req.body;
    const client_phone = normalizePhone(rawPhone) || rawPhone;
    const extra_phone = rawExtraPhone ? (normalizePhone(rawExtraPhone) || rawExtraPhone) : undefined;
    if (!client_name || !client_phone || !client_address) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }
    const countResult = await pool.query("SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)), 0) AS count FROM requests");
    const number = 'REQ-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');

    const { rows } = await pool.query(
      `INSERT INTO requests (number, client_name, client_phone, client_address, city, type, work_description, extra_name, extra_phone, source, photos, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, 'new') RETURNING *`,
      [number, client_name, client_phone, client_address, city || null, type || 'measurement', work_description || null, extra_name || null, extra_phone || null, source || 'site', photos ? JSON.stringify(photos) : '[]']
    );

    const req_data = rows[0];
    await notifyManagersAndAdmins(pool,
      `📋 <b>Новая заявка ${req_data.number}</b>\n\nКлиент: ${req_data.client_name}\nТелефон: ${req_data.client_phone}\nАдрес: ${req_data.client_address}\nТип: ${typeLabels[req_data.type] || req_data.type}\nИсточник: Сайт\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
    );
    await sendPushToRoles(['admin', 'manager'], {
      title: `Новая заявка ${req_data.number}`,
      body: `${req_data.client_name} — ${req_data.client_address}`,
      url: `/admin/requests?search=${encodeURIComponent(req_data.number)}`,
    });

    res.json(req_data);
  } catch (err) {
    console.error('Public request error:', err);
    res.status(500).json({ error: 'Ошибка создания заявки' });
  }
});

// Create request (from CRM)
app.post('/api/requests', auth, async (req, res) => {
  try {
    const { client_name, client_phone: rawPhone, client_address, city, type, work_description, source, comment, extra_name, extra_phone: rawExtraPhone, photos, interior_doors, entrance_doors, partitions } = req.body;
    const client_phone = normalizePhone(rawPhone) || rawPhone;
    const extra_phone = rawExtraPhone ? (normalizePhone(rawExtraPhone) || rawExtraPhone) : null;
    const countResult = await pool.query("SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)), 0) AS count FROM requests");
    const number = 'REQ-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');

    const partnerId = req.user.role === 'partner' ? req.user.id : (req.body.partner_id || null);

    const { rows } = await pool.query(
      `INSERT INTO requests (number, partner_id, client_name, client_phone, client_address, city, type, work_description, source, notes, extra_name, extra_phone, photos, interior_doors, entrance_doors, partitions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15, $16, 'new') RETURNING *`,
      [number, partnerId, client_name, client_phone, client_address, city || null, type || 'measurement', work_description || null, source || 'site', comment || null, extra_name || null, extra_phone || null, photos ? JSON.stringify(photos) : '[]', interior_doors || null, entrance_doors || null, partitions || null]
    );

    const req_data = rows[0];
    const sourceName = req.user.role === 'partner' ? `Партнёр (${req.user.name})` : req.user.name;
    await notifyManagersAndAdmins(pool,
      `📋 <b>Новая заявка ${req_data.number}</b>\n\nКлиент: ${req_data.client_name}\nТелефон: ${req_data.client_phone}\nАдрес: ${req_data.client_address}\nТип: ${typeLabels[req_data.type] || req_data.type}\nИсточник: ${sourceName}\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
    );
    await sendPushToRoles(['admin', 'manager'], {
      title: `Новая заявка ${req_data.number}`,
      body: `${req_data.client_name} — ${req_data.client_address}`,
      url: `/admin/requests?search=${encodeURIComponent(req_data.number)}`,
    });

    res.json(req_data);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Ошибка создания заявки' });
  }
});

// Update request
app.put('/api/requests/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const role = req.user.role;

    const current = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Заявка не найдена' });
    const request = current.rows[0];
    console.info(`Request update: id=${id}, number=${request.number}, role=${role}, fields=${Object.keys(updates).join(',') || '-'}`);

    // Partners can edit their own open requests
    if (role === 'partner') {
      if (request.partner_id !== req.user.id) {
        return res.status(403).json({ error: 'Нет доступа к этой заявке' });
      }
      if (request.status === 'closed') {
        return res.status(403).json({ error: 'Закрытые заявки нельзя редактировать' });
      }
      const partnerAllowed = ['client_name', 'client_phone', 'client_address', 'city', 'extra_name', 'extra_phone', 'work_description', 'interior_doors', 'entrance_doors', 'partitions', 'notes', 'photos', 'partner_notes'];
      const forbidden = Object.keys(updates).filter(k => !partnerAllowed.includes(k));
      if (forbidden.length > 0) {
        return res.status(403).json({ error: `Партнёрам недоступно изменение: ${forbidden.join(', ')}` });
      }
    }

    // Executors can only change limited fields
    const executorAllowed = ['agreed_date', 'status_comment', 'photos', 'status', 'notes', 'amount', 'accepted_at'];
    if (['measurer', 'installer'].includes(role)) {
      const forbidden = Object.keys(updates).filter(k => !executorAllowed.includes(k));
      if (forbidden.length > 0) {
        return res.status(403).json({ error: `Вам недоступно изменение: ${forbidden.join(', ')}` });
      }
    }

    // Auto-assign status on executor assignment
    if (updates.measurer_id && !request.measurer_id && ['new', 'pending'].includes(request.status)) {
      updates.status = 'measurer_assigned';
    }
    if (updates.installer_id && !request.installer_id && ['new', 'pending'].includes(request.status)) {
      updates.status = 'installer_assigned';
    }

    // Auto: date agreed
    if (updates.agreed_date && ['measurer_assigned', 'new', 'pending'].includes(request.status)) {
      updates.status = 'date_agreed';
    }

    // Auto: installation rescheduled
    const userExplicitlyChangedStatus = updates.status && updates.status !== request.status;
    if (updates.agreed_date && !userExplicitlyChangedStatus && ["date_agreed", "installation_rescheduled"].includes(request.status) && request.type === "installation" && ["installer", "admin", "manager"].includes(role)) {
      updates.status = "installation_rescheduled";
    }

    // Measurer can reschedule measurement date
    if (updates.agreed_date && role === 'measurer' && request.agreed_date && request.type === 'measurement' && request.status === 'date_agreed') {
      updates.status = 'date_agreed';
    }

    // Validate status transition
    if (updates.status && updates.status !== request.status) {
      if (['admin', 'manager', 'measurer', 'installer'].includes(role)) {
        if (!isValidTransition(request.type, request.status, updates.status, role)) {
          return res.status(400).json({
            error: `Невозможен переход из "${statusLabels[request.status]}" в "${statusLabels[updates.status]}" для типа "${typeLabels[request.type]}"`
          });
        }
      }
    }

    // Normalize phones
    if (updates.client_phone) {
      updates.client_phone = normalizePhone(updates.client_phone) || updates.client_phone;
    }
    if (updates.extra_phone) {
      updates.extra_phone = normalizePhone(updates.extra_phone) || updates.extra_phone;
    }

    // Auto: closed_at
    if (hasClosedAtColumn) {
      if (updates.status === 'closed' && request.status !== 'closed') {
        updates.closed_at = new Date().toISOString();
      }
      if (updates.status && updates.status !== 'closed' && request.status === 'closed') {
        updates.closed_at = null;
      }
    } else if (Object.prototype.hasOwnProperty.call(updates, 'closed_at')) {
      delete updates.closed_at;
    }

    // Build UPDATE query
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'photos') {
        fields.push(`${key} = $${idx}::jsonb`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${idx}`);
        values.push(value);
      }
      idx++;
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });

    values.push(id);
    const result = await pool.query(
      `UPDATE requests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    const updated = result.rows[0];

    // === NOTIFICATIONS ===

    // 1. Measurer assigned
    if (updates.measurer_id && updates.measurer_id !== request.measurer_id) {
      await notifyUserById(pool, updates.measurer_id,
        `🔔 <b>Новая заявка на замер</b>\n\nКлиент: ${updated.client_name}\nТелефон: ${updated.client_phone}\nАдрес: ${updated.client_address}\n\nПерейдите в личный кабинет.\n\n👉 <a href="${SITE_URL}/login">Войти в кабинет</a>`
      );
      await sendPushToUser(updates.measurer_id, {
        title: 'Новая заявка на замер',
        body: `${updated.client_name} — ${updated.client_address}`,
        url: `/measurer?highlight=${updated.id}`,
      });
      if (request.measurer_id && request.measurer_id !== updates.measurer_id) {
        await notifyUserById(pool, request.measurer_id,
          `ℹ️ <b>Вы сняты с заявки</b>\n\nЗаявка ${updated.number} передана другому исполнителю.`
        );
        await sendPushToUser(request.measurer_id, {
          title: 'Вы сняты с заявки',
          body: `Заявка ${updated.number} передана другому исполнителю.`,
          url: `/measurer`,
        });
      }
    }

    // 2. Installer assigned
    const installerFields = ['installer_id', 'installer_2_id', 'installer_3_id', 'installer_4_id'];
    const newlyAssignedInstallers = installerFields
      .filter((field) => updates[field] && updates[field] !== request[field])
      .map((field) => ({ field, id: updates[field] }));
    if (newlyAssignedInstallers.length > 0) {
      const dateStr = updated.agreed_date ? new Date(updated.agreed_date).toLocaleDateString('ru-RU') : 'не назначена';
      for (const assigned of newlyAssignedInstallers) {
        console.info(`Installer notify trigger: request=${updated.number}, field=${assigned.field}, old=${request[assigned.field] || '-'}, new=${assigned.id}, date=${dateStr}`);
        await notifyUserById(pool, assigned.id,
          `🔔 <b>Новый монтаж</b>\n\nКлиент: ${updated.client_name}\nТелефон: ${updated.client_phone}\nАдрес: ${updated.client_address}\nДата: ${dateStr}\n\n👉 <a href="${SITE_URL}/login">Войти в кабинет</a>`
        );
        await sendPushToUser(assigned.id, {
          title: 'Новый монтаж',
          body: `${updated.client_name} — ${updated.client_address}, дата: ${dateStr}`,
          url: `/installer?highlight=${updated.id}`,
        });
      }
      if (request.installer_id && request.installer_id !== updates.installer_id) {
        await notifyUserById(pool, request.installer_id,
          `ℹ️ <b>Вы сняты с заявки</b>\n\nЗаявка ${updated.number} передана другому исполнителю.`
        );
        await sendPushToUser(request.installer_id, {
          title: 'Вы сняты с заявки',
          body: `Заявка ${updated.number} передана другому исполнителю.`,
          url: `/installer`,
        });
      }
    }

    // 3. Date agreed/rescheduled → managers
    if (updates.agreed_date && updates.agreed_date !== request.agreed_date) {
      const action = request.agreed_date ? 'перенесена' : 'согласована';
      const comment = updates.status_comment ? `\nКомментарий: ${updates.status_comment}` : '';
      await notifyManagersAndAdmins(pool,
        `📅 <b>Дата ${action}</b>\n\nЗаявка: ${updated.number}\nНовая дата: ${new Date(updates.agreed_date).toLocaleDateString('ru-RU')}${comment}\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
      );
      await sendPushToRoles(['admin', 'manager'], {
        title: `Дата ${action}`,
        body: `Заявка ${updated.number} — ${new Date(updates.agreed_date).toLocaleDateString('ru-RU')}`,
        url: `/admin/requests?search=${encodeURIComponent(updated.number)}`,
      });
    }

    // 4. Work completed → managers
    if (updates.status && ['measurement_done', 'closed'].includes(updates.status) && request.status !== updates.status) {
      await notifyManagersAndAdmins(pool,
        `✅ <b>Работа завершена</b>\n\nЗаявка: ${updated.number}\nТип: ${typeLabels[updated.type] || updated.type}\nСтатус: ${statusLabels[updates.status]}\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
      );
      await sendPushToRoles(['admin', 'manager'], {
        title: 'Работа завершена',
        body: `Заявка ${updated.number} — ${statusLabels[updates.status]}`,
        url: `/admin/requests?search=${encodeURIComponent(updated.number)}`,
      });
    }

    // 5. Cancelled → notify executors
    if (updates.status === 'cancelled' && request.status !== 'cancelled') {
      const executorIds = [updated.measurer_id, updated.installer_id].filter(Boolean);
      for (const execId of executorIds) {
        await notifyUserById(pool, execId,
          `❌ <b>Заявка отменена</b>\n\nЗаявка ${updated.number} была отменена.`
        );
        await sendPushToUser(execId, {
          title: 'Заявка отменена',
          body: `Заявка ${updated.number} была отменена.`,
        });
      }
    }

    // 6. Status change → partner
    if (updates.status && updates.status !== request.status && updated.partner_id) {
      await notifyPartner(pool, updated.partner_id,
        `📌 <b>Статус заявки ${updated.number} изменён</b>\n\nНовый статус: ${statusLabels[updates.status] || updates.status}\n\n👉 <a href="${SITE_URL}/login">Подробнее в кабинете</a>`
      );
      await sendPushToUser(updated.partner_id, {
        title: `Статус заявки ${updated.number}`,
        body: `Новый статус: ${statusLabels[updates.status] || updates.status}`,
        url: `/partner?search=${encodeURIComponent(updated.number)}`,
      });
    }

    // Bridge auto-sync: push changes to remote CRM if linked
    if (updated.external_id && updated.external_system && typeof bridgeAutoSync === 'function') {
      bridgeAutoSync(updated.id).catch(err => console.error('Bridge auto-sync bg error:', err.message));
    }

    res.json(updated);
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: `Ошибка обновления заявки: ${err.message}` });
  }
});

// Delete request (admin only)
app.delete("/api/requests/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Только администратор может удалять заявки" });
    }
    const { id } = req.params;
    // Check if request has bridge link — add to blacklist before deleting
    const reqData = await pool.query("SELECT external_id, external_system FROM requests WHERE id = $1", [id]);
    if (reqData.rows.length === 0) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }
    if (reqData.rows[0].external_id && reqData.rows[0].external_system) {
      await pool.query(
        'INSERT INTO bridge_rejected (external_id, external_system) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [reqData.rows[0].external_id, reqData.rows[0].external_system]
      );
    }
    await pool.query("DELETE FROM requests WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete request error:", err);
    res.status(500).json({ error: "Ошибка удаления заявки" });
  }
});

// === Articles ===
app.get('/api/articles', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Get articles error:', err);
    res.status(500).json({ error: 'Ошибка загрузки статей' });
  }
});

app.post('/api/articles', auth, async (req, res) => {
  try {
    const { title, slug, excerpt, image, content, read_time } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO articles (title, slug, excerpt, image, content, read_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, slug, excerpt || '', image || '', content || '', read_time || '5 мин']
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ error: 'Ошибка создания статьи' });
  }
});

app.put('/api/articles/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE articles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Статья не найдена' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

app.delete('/api/articles/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// === Estimates ===
app.get('/api/estimates', auth, async (req, res) => {
  try {
    let query = 'SELECT * FROM estimates';
    const params = [];
    if (req.user.role === 'measurer' || req.user.role === 'installer') {
      query += ' WHERE created_by = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get estimates error:', err);
    res.status(500).json({ error: 'Ошибка загрузки смет' });
  }
});

app.post('/api/estimates', auth, async (req, res) => {
  try {
    const { client_name, client_address, city, items, discount, total, request_id } = req.body;
    const countResult = await pool.query('SELECT COUNT(*) FROM estimates');
    const number = 'EST-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');
    const { rows } = await pool.query(
      `INSERT INTO estimates (number, client_name, client_address, city, items, discount, total, created_by, request_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [number, client_name, client_address || null, city || null, JSON.stringify(items || []), discount || 0, total || 0, req.user.id, request_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Create estimate error:', err);
    res.status(500).json({ error: 'Ошибка сохранения сметы' });
  }
});

app.delete('/api/estimates/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM estimates WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete estimate error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// === Startup: check closed_at column ===
(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'requests'
          AND column_name = 'closed_at'
      ) AS exists
    `);
    hasClosedAtColumn = !!rows[0]?.exists;
    if (hasClosedAtColumn) {
      await pool.query(`UPDATE requests SET closed_at = COALESCE(agreed_date, updated_at, created_at) WHERE status = 'closed' AND closed_at IS NULL`);
      console.log('Startup: closed_at column ready');
    } else {
      console.warn('Startup: closed_at column missing. Using updated_at for closed requests.');
    }
  } catch (err) {
    console.error('Startup closed_at check error:', err.message);
  }
})();

// === Startup: ensure optional request columns ===
(async () => {
  try {
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS partner_notes TEXT`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS installer_2_id UUID REFERENCES users(id) ON DELETE SET NULL`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS installer_3_id UUID REFERENCES users(id) ON DELETE SET NULL`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS installer_4_id UUID REFERENCES users(id) ON DELETE SET NULL`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS interior_doors INTEGER`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS entrance_doors INTEGER`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS partitions INTEGER`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS city TEXT`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS amount NUMERIC`);
    console.log('Optional request columns ensured');
  } catch (err) {
    console.error('Optional request columns error:', err.message);
  }
})();

// === Bridge Rejected (blacklist for deleted bridged requests) ===
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bridge_rejected (
        external_id TEXT NOT NULL,
        external_system TEXT NOT NULL DEFAULT 'primedoor',
        rejected_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (external_id, external_system)
      )
    `);
    console.log('bridge_rejected table ensured');
  } catch (err) {
    console.error('bridge_rejected table creation error:', err.message);
  }
})();

// === Employee Absences (выходные / отпуск / больничный) ===
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_absences (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('dayoff','vacation','sick')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_absences_user_date ON employee_absences(user_id, date)`);
    console.log('employee_absences table ensured');
  } catch (err) {
    console.error('employee_absences table creation error:', err.message);
  }
})();

// === Partner Forms ===
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partner_forms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        store_name TEXT NOT NULL,
        store_address TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.error('partner_forms table creation error:', err.message);
  }
})();

const partnerFormAttempts = new Map();
setInterval(() => partnerFormAttempts.clear(), 15 * 60 * 1000);

app.post('/api/partner-form', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = partnerFormAttempts.get(ip) || 0;
  if (attempts >= 5) {
    return res.status(429).json({ error: 'Слишком много попыток. Попробуйте через 15 минут.' });
  }
  partnerFormAttempts.set(ip, attempts + 1);

  const { name, store_name, store_address, phone, email } = req.body;
  if (!name || !store_name || !store_address || !phone || !email) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  try {
    await pool.query(
      'INSERT INTO partner_forms (name, store_name, store_address, phone, email) VALUES ($1, $2, $3, $4, $5)',
      [name, store_name, store_address, phone, email]
    );

    await notifyManagersAndAdmins(pool,
      `🤝 <b>Заявка на партнёрство</b>\n\nФИО: ${name}\nМагазин: ${store_name}\nАдрес: ${store_address}\nТелефон: ${phone}\nПочта: ${email}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Partner form error:', err);
    res.status(500).json({ error: 'Ошибка отправки. Попробуйте позже.' });
  }
});

app.get('/api/partner-forms', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const { rows } = await pool.query('SELECT * FROM partner_forms ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Get partner forms error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.patch('/api/partner-forms/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  const { status, notes } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE partner_forms SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3 RETURNING *',
      [status, notes, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update partner form error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/partner-forms/:id/approve', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const formResult = await pool.query('SELECT * FROM partner_forms WHERE id = $1', [req.params.id]);
    if (!formResult.rows.length) return res.status(404).json({ error: 'Заявка не найдена' });
    const form = formResult.rows[0];

    const normalizedPhone = normalizePhone(form.phone);
    const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [normalizedPhone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Аккаунт с таким номером уже существует' });
    }

    const pin = generatePin();

    const { rows } = await pool.query(
      'INSERT INTO users (name, phone, email, role, pin, active, notes) VALUES ($1, $2, $3, $4, $5, true, $6) RETURNING *',
      [form.name, normalizedPhone, form.email || null, 'partner', pin, `Магазин: ${form.store_name}, Адрес: ${form.store_address}`]
    );

    await pool.query(
      "UPDATE partner_forms SET status = $1, notes = COALESCE(notes, '') || $2 WHERE id = $3",
      ['done', `\nАккаунт создан. ПИН: ${pin}`, req.params.id]
    );

    res.json({
      success: true,
      user: rows[0],
      pin,
      message: `Аккаунт партнёра создан. ПИН-код: ${pin}`
    });
  } catch (err) {
    console.error('Approve partner error:', err);
    res.status(500).json({ error: 'Ошибка создания аккаунта' });
  }
});

app.delete('/api/partner-forms/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    await pool.query('DELETE FROM partner_forms WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete partner form error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// === Web Push Notifications ===
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:info@doorium.ru',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        endpoint TEXT UNIQUE NOT NULL,
        keys_p256dh TEXT NOT NULL,
        keys_auth TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('push_subscriptions table ready');
  } catch (err) {
    console.error('Failed to create push_subscriptions table:', err.message);
  }
})();

app.post('/api/push/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, keys_p256dh = $3, keys_auth = $4`,
      [req.user.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    res.status(500).json({ error: 'Ошибка сохранения подписки' });
  }
});

app.post('/api/push/unsubscribe', auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ success: true });
  } catch (err) {
    console.error('Push unsubscribe error:', err);
    res.status(500).json({ error: 'Ошибка удаления подписки' });
  }
});

async function sendPushToRoles(roles, payload) {
  if (!process.env.VAPID_PUBLIC_KEY) return;
  try {
    const placeholders = roles.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `SELECT ps.endpoint, ps.keys_p256dh, ps.keys_auth
       FROM push_subscriptions ps
       JOIN users u ON u.id = ps.user_id
       WHERE u.role IN (${placeholders}) AND u.active = true`,
      roles
    );
    for (const row of rows) {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.keys_p256dh, auth: row.keys_auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
        }
      }
    }
  } catch (err) {
    console.error('sendPushToRoles error:', err.message);
  }
}

async function sendPushToUser(userId, payload) {
  if (!process.env.VAPID_PUBLIC_KEY) return;
  try {
    const { rows } = await pool.query(
      'SELECT endpoint, keys_p256dh, keys_auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );
    for (const row of rows) {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.keys_p256dh, auth: row.keys_auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
        }
      }
    }
  } catch (err) {
    console.error('sendPushToUser error:', err.message);
  }
}

// === Bridge API (inter-CRM exchange) ===
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY;
const LOCAL_SYSTEM_NAME = process.env.CRM_SYSTEM_NAME || 'doorium';
const REMOTE_SYSTEM_NAME = process.env.BRIDGE_REMOTE_SYSTEM || (LOCAL_SYSTEM_NAME === 'doorium' ? 'primedoor' : 'doorium');
const BRIDGE_REMOTE_API_URL = process.env.BRIDGE_REMOTE_API_URL || process.env.PRIMEDOOR_API_URL || process.env.DOORIUM_API_URL;
const BRIDGE_REMOTE_API_KEY = process.env.BRIDGE_REMOTE_API_KEY || process.env.PRIMEDOOR_API_KEY || process.env.DOORIUM_API_KEY;
const OWN_PUBLIC_API_URL = (process.env.PUBLIC_API_URL || process.env.OWN_API_URL || (LOCAL_SYSTEM_NAME === 'doorium' ? 'https://api.doorium.ru' : 'https://api.primedoor.ru')).replace(/\/$/, '');

function absolutizeBridgePhotos(photos, baseUrl) {
  if (!photos || !Array.isArray(photos) || !baseUrl) return photos;
  const base = String(baseUrl).replace(/\/$/, '');
  return photos.map((photo) => {
    const normalizeUrl = (url) => {
      if (!url || typeof url !== 'string') return url;
      if (/^https?:\/\//i.test(url)) return url;
      return url.startsWith('/') ? `${base}${url}` : url;
    };

    if (typeof photo === 'string') return normalizeUrl(photo);
    if (!photo || typeof photo !== 'object') return photo;
    return { ...photo, url: normalizeUrl(photo.url) };
  });
}

function bridgeSystemLabel(system) {
  if (system === 'doorium') return 'Doorium';
  if (system === 'primedoor') return 'PrimeDoor';
  return system;
}

function resolveBridgeTarget(externalSystem) {
  if (!externalSystem || externalSystem !== REMOTE_SYSTEM_NAME) return null;
  if (!BRIDGE_REMOTE_API_URL || !BRIDGE_REMOTE_API_KEY) return null;
  return {
    url: BRIDGE_REMOTE_API_URL,
    key: BRIDGE_REMOTE_API_KEY,
    system: REMOTE_SYSTEM_NAME,
  };
}

// Middleware for bridge auth (API key)
const bridgeAuth = (req, res, next) => {
  const key = req.headers['x-api-key'] || req.headers['x-bridge-key'];
  if (!BRIDGE_API_KEY || key !== BRIDGE_API_KEY) {
    return res.status(401).json({ error: 'Неверный API-ключ' });
  }
  next();
};

function bridgeHeaders(apiKey, includeJson = true) {
  const headers = {
    'X-API-Key': apiKey,
    'X-Bridge-Key': apiKey,
  };
  if (includeJson) headers['Content-Type'] = 'application/json';
  return headers;
}

async function bridgeRequest(method, url, apiKey, payload) {
  const response = await fetch(url, {
    method,
    headers: bridgeHeaders(apiKey, payload !== undefined),
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function buildBridgeUpdate(fieldsPayload = {}, includeUpdatedAt = false) {
  const fields = ['external_synced_at = NOW()'];
  const values = [];
  let idx = 1;

  const setField = (column, value) => {
    fields.push(`${column} = $${idx++}`);
    values.push(value);
  };

  if (fieldsPayload.status !== undefined && fieldsPayload.status !== null && fieldsPayload.status !== '') setField('status', fieldsPayload.status);
  if (fieldsPayload.notes !== undefined) setField('notes', fieldsPayload.notes);
  if (fieldsPayload.amount !== undefined) setField('amount', fieldsPayload.amount);
  if (fieldsPayload.agreed_date !== undefined) setField('agreed_date', fieldsPayload.agreed_date);
  if (fieldsPayload.work_description !== undefined) setField('work_description', fieldsPayload.work_description);
  if (fieldsPayload.status_comment !== undefined) setField('status_comment', fieldsPayload.status_comment);
  if (fieldsPayload.client_name !== undefined) setField('client_name', fieldsPayload.client_name);
  if (fieldsPayload.client_phone !== undefined) setField('client_phone', normalizePhone(fieldsPayload.client_phone) || fieldsPayload.client_phone);
  if (fieldsPayload.client_address !== undefined) setField('client_address', fieldsPayload.client_address);
  if (fieldsPayload.city !== undefined) setField('city', fieldsPayload.city);
  if (fieldsPayload.type !== undefined) setField('type', fieldsPayload.type);
  if (fieldsPayload.interior_doors !== undefined) setField('interior_doors', fieldsPayload.interior_doors);
  if (fieldsPayload.entrance_doors !== undefined) setField('entrance_doors', fieldsPayload.entrance_doors);
  if (fieldsPayload.partitions !== undefined) setField('partitions', fieldsPayload.partitions);
  if (fieldsPayload.photos !== undefined) {
    fields.push(`photos = $${idx++}::jsonb`);
    values.push(JSON.stringify(fieldsPayload.photos ?? []));
  }
  if (includeUpdatedAt) fields.push('updated_at = NOW()');

  return { fields, values, nextIndex: idx };
}

async function applyBridgeUpdateToRequest(requestId, payload, includeUpdatedAt = false) {
  const { fields, values, nextIndex } = buildBridgeUpdate(payload, includeUpdatedAt);
  values.push(requestId);
  const { rows } = await pool.query(
    `UPDATE requests SET ${fields.join(', ')} WHERE id = $${nextIndex} RETURNING *`,
    values
  );
  return rows[0] || null;
}

// Auto-add external columns if missing
(async () => {
  try {
    await pool.query(`
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_id TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_system TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_synced_at TIMESTAMPTZ;
    `);
    console.log('Bridge columns ensured');
  } catch (err) {
    console.error('Bridge columns error:', err.message);
  }
})();

// Auto-sync local updates to remote CRM
async function bridgeAutoSync(requestId) {
  try {
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [requestId]);
    if (!rows.length) return;

    const request = rows[0];
    const target = resolveBridgeTarget(request.external_system);
    if (!target) return;

    const payload = {
      source_system: LOCAL_SYSTEM_NAME,
      source_id: request.id,
      status: request.status,
      notes: request.notes,
      amount: request.amount,
      agreed_date: request.agreed_date,
      work_description: request.work_description,
      status_comment: request.status_comment,
      client_name: request.client_name,
      client_phone: request.client_phone,
      client_address: request.client_address,
      city: request.city,
      type: request.type,
      extra_name: request.extra_name,
      extra_phone: request.extra_phone,
      interior_doors: request.interior_doors,
      entrance_doors: request.entrance_doors,
      partitions: request.partitions,
      photos: absolutizeBridgePhotos(request.photos, OWN_PUBLIC_API_URL),
    };

    const attempts = [];
    if (request.external_id) {
      attempts.push({
        method: 'PUT',
        url: `${target.url}/api/bridge/update/${encodeURIComponent(request.external_id)}`,
        payload,
      });
    }
    attempts.push({
      method: 'PUT',
      url: `${target.url}/api/bridge/status`,
      payload,
    });
    attempts.push({
      method: 'POST',
      url: `${target.url}/api/bridge/receive`,
      payload,
    });

    let synced = false;
    let lastError = null;
    for (const attempt of attempts) {
      const result = await bridgeRequest(attempt.method, attempt.url, target.key, attempt.payload);
      if (result.ok) {
        synced = true;
        break;
      }
      if (![404, 405].includes(result.status)) {
        lastError = result.data?.error || `HTTP ${result.status}`;
      }
    }

    if (!synced) {
      throw new Error(lastError || 'Не удалось отправить обновление во внешнюю CRM');
    }

    await pool.query('UPDATE requests SET external_synced_at = NOW() WHERE id = $1', [request.id]);
  } catch (err) {
    console.error('Bridge auto-sync error:', err.message);
  }
}

// Send request to external CRM
app.post('/api/bridge/send/:id', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  if (!BRIDGE_REMOTE_API_URL || !BRIDGE_REMOTE_API_KEY) {
    return res.status(500).json({ error: 'Внешняя CRM не настроена (BRIDGE_REMOTE_API_URL / BRIDGE_REMOTE_API_KEY)' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Заявка не найдена' });
    const request = rows[0];

    if (request.external_id && request.external_system === REMOTE_SYSTEM_NAME) {
      return res.status(400).json({ error: `Заявка уже передана в ${bridgeSystemLabel(REMOTE_SYSTEM_NAME)}` });
    }

    const payload = {
      source_system: LOCAL_SYSTEM_NAME,
      source_id: request.id,
      number: request.number,
      type: request.type,
      status: request.status,
      client_name: request.client_name,
      client_phone: request.client_phone,
      client_address: request.client_address,
      city: request.city,
      extra_name: request.extra_name,
      extra_phone: request.extra_phone,
      work_description: request.work_description,
      notes: request.notes,
      photos: absolutizeBridgePhotos(request.photos, OWN_PUBLIC_API_URL),
      interior_doors: request.interior_doors,
      entrance_doors: request.entrance_doors,
      partitions: request.partitions,
      agreed_date: request.agreed_date,
      amount: request.amount,
    };

    const response = await fetch(`${BRIDGE_REMOTE_API_URL}/api/bridge/receive`, {
      method: 'POST',
      headers: bridgeHeaders(BRIDGE_REMOTE_API_KEY),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка внешней CRM');

    await pool.query(
      'UPDATE requests SET external_id = $1, external_system = $2, external_synced_at = NOW() WHERE id = $3',
      [data.id, REMOTE_SYSTEM_NAME, request.id]
    );

    const updated = await pool.query('SELECT * FROM requests WHERE id = $1', [request.id]);

    await notifyManagersAndAdmins(pool,
      `🔗 <b>Заявка передана в ${bridgeSystemLabel(REMOTE_SYSTEM_NAME)}</b>\n\nЗаявка: ${request.number}\nКлиент: ${request.client_name}\n\nДанные синхронизированы.`
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Bridge send error:', err);
    res.status(500).json({ error: err.message || 'Ошибка отправки во внешнюю CRM' });
  }
});

// Receive request from external system
app.post('/api/bridge/receive', bridgeAuth, async (req, res) => {
  try {
    const { source_system, source_id, number: extNumber, type, status: extStatus, client_name, client_phone, client_address, city, extra_name, extra_phone, work_description, notes, photos: rawPhotos, interior_doors, entrance_doors, partitions, agreed_date, amount, status_comment } = req.body;

    if (!source_system || !source_id || !client_name || !client_phone) {
      return res.status(400).json({ error: 'Обязательные поля: source_system, source_id, client_name, client_phone' });
    }

    const remoteBase = (source_system === 'primedoor'
      ? (process.env.PRIMEDOOR_API_URL || 'https://api.primedoor.ru')
      : (process.env.DOORIUM_API_URL || 'https://api.doorium.ru')).replace(/\/$/, '');
    const photos = absolutizeBridgePhotos(rawPhotos, remoteBase);

    // Check blacklist — don't recreate deleted bridged requests
    const rejected = await pool.query(
      'SELECT 1 FROM bridge_rejected WHERE external_id = $1 AND external_system = $2',
      [source_id, source_system]
    );
    if (rejected.rows.length > 0) {
      return res.json({ blocked: true, reason: 'rejected', source_id });
    }

    const existing = await pool.query(
      'SELECT id, number FROM requests WHERE external_id = $1 AND external_system = $2',
      [source_id, source_system]
    );

    if (existing.rows.length > 0) {
      const updated = await applyBridgeUpdateToRequest(existing.rows[0].id, {
        status: extStatus,
        notes,
        amount,
        agreed_date,
        work_description,
        status_comment,
        client_name,
        client_phone,
        client_address,
        city,
        type,
        interior_doors,
        entrance_doors,
        partitions,
        photos,
      }, true);
      return res.json({ id: existing.rows[0].id, number: updated?.number || existing.rows[0].number, updated: true });
    }

    const countResult = await pool.query("SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)), 0) AS count FROM requests");
    const newNumber = 'REQ-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');
    const normalizedPhone = normalizePhone(client_phone) || client_phone;

    const { rows } = await pool.query(
      `INSERT INTO requests (number, client_name, client_phone, client_address, city, type, status, work_description, notes, extra_name, extra_phone, photos, interior_doors, entrance_doors, partitions, agreed_date, amount, status_comment, source, external_id, external_system, external_synced_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14, $15, $16, $17, $18, 'bridge', $19, $20, NOW()) RETURNING *`,
      [newNumber, client_name, normalizedPhone, client_address || '', city || null, type || 'measurement', extStatus || 'new', work_description || null, notes || null, extra_name || null, extra_phone ? (normalizePhone(extra_phone) || extra_phone) : null, photos ? JSON.stringify(photos) : '[]', interior_doors || null, entrance_doors || null, partitions || null, agreed_date || null, amount || null, status_comment || null, source_id, source_system]
    );

    await notifyManagersAndAdmins(pool,
      `🔗 <b>Заявка из ${bridgeSystemLabel(source_system)}</b>\n\n№ ${newNumber}\nКлиент: ${client_name}\nТелефон: ${normalizedPhone}\nАдрес: ${client_address || '—'}\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
    );
    await sendPushToRoles(['admin', 'manager'], {
      title: `Заявка из ${bridgeSystemLabel(source_system)}`,
      body: `${client_name} — ${client_address || ''}`,
      url: `/admin/requests?search=${encodeURIComponent(newNumber)}`,
    });

    res.json({ id: rows[0].id, number: newNumber });
  } catch (err) {
    console.error('Bridge receive error:', err);
    res.status(500).json({ error: 'Ошибка приёма заявки' });
  }
});

// Receive direct update by request id/external id (PrimeDoor compatibility)
app.put('/api/bridge/update/:id', bridgeAuth, async (req, res) => {
  try {
    const requestedId = req.params.id;
    // Check blacklist
    const rejected = await pool.query('SELECT 1 FROM bridge_rejected WHERE external_id = $1', [requestedId]);
    if (rejected.rows.length > 0) {
      return res.json({ blocked: true, reason: 'rejected', external_id: requestedId });
    }

    let lookup = await pool.query('SELECT id FROM requests WHERE id = $1', [requestedId]);
    if (!lookup.rows.length) {
      lookup = await pool.query('SELECT id FROM requests WHERE external_id = $1', [requestedId]);
    }
    if (!lookup.rows.length) return res.status(404).json({ error: 'Заявка не найдена' });

    const updated = await applyBridgeUpdateToRequest(lookup.rows[0].id, req.body, true);
    return res.json(updated);
  } catch (err) {
    console.error('Bridge update error:', err);
    return res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Return status by local id or external id
app.get('/api/bridge/status/:externalId', bridgeAuth, async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.externalId]);
    if (!result.rows.length) {
      result = await pool.query('SELECT * FROM requests WHERE external_id = $1', [req.params.externalId]);
    }
    if (!result.rows.length) return res.status(404).json({ error: 'Заявка не найдена' });

    const request = result.rows[0];
    return res.json({
      status: request.status,
      agreed_date: request.agreed_date,
      amount: request.amount,
      status_comment: request.status_comment,
      notes: request.notes,
      work_description: request.work_description,
      updated_at: request.updated_at,
    });
  } catch (err) {
    console.error('Bridge status GET error:', err);
    return res.status(500).json({ error: 'Ошибка получения статуса' });
  }
});

// Return bridged request by source pair (for manual pull sync)
app.get('/api/bridge/fetch', bridgeAuth, async (req, res) => {
  try {
    const sourceSystem = String(req.query.source_system || '');
    const sourceId = String(req.query.source_id || '');
    if (!sourceSystem || !sourceId) {
      return res.status(400).json({ error: 'source_system и source_id обязательны' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM requests WHERE external_id = $1 AND external_system = $2',
      [sourceId, sourceSystem]
    );
    if (!rows.length) return res.status(404).json({ error: 'Заявка не найдена' });

    const request = rows[0];
    res.json({
      status: request.status,
      notes: request.notes,
      amount: request.amount,
      agreed_date: request.agreed_date,
      work_description: request.work_description,
      status_comment: request.status_comment,
      client_name: request.client_name,
      client_phone: request.client_phone,
      client_address: request.client_address,
      interior_doors: request.interior_doors,
      entrance_doors: request.entrance_doors,
      partitions: request.partitions,
      photos: absolutizeBridgePhotos(request.photos, OWN_PUBLIC_API_URL),
      updated_at: request.updated_at,
    });
  } catch (err) {
    console.error('Bridge fetch error:', err);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// Receive status update from external system
app.put('/api/bridge/status', bridgeAuth, async (req, res) => {
  try {
    const { source_system, source_id, status, notes, amount, agreed_date, work_description, status_comment } = req.body;
    if (!source_system || !source_id) {
      return res.status(400).json({ error: 'source_system и source_id обязательны' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM requests WHERE external_id = $1 AND external_system = $2',
      [source_id, source_system]
    );
    if (!rows.length) return res.status(404).json({ error: 'Заявка не найдена' });

    const updated = await applyBridgeUpdateToRequest(rows[0].id, {
      status,
      notes,
      amount,
      agreed_date,
      work_description,
      status_comment,
    }, true);

    res.json(updated);
  } catch (err) {
    console.error('Bridge status error:', err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Pull current data from external system to local request (manual sync)
app.post('/api/bridge/sync/:id', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Заявка не найдена' });
    const request = rows[0];

    if (!request.external_id || !request.external_system) {
      return res.status(400).json({ error: 'Заявка не связана с внешней системой' });
    }

    const target = resolveBridgeTarget(request.external_system);
    if (!target) {
      return res.status(500).json({ error: 'Внешняя система не настроена' });
    }

    let statusResult = null;
    if (request.external_id) {
      statusResult = await bridgeRequest(
        'GET',
        `${target.url}/api/bridge/status/${encodeURIComponent(request.external_id)}`,
        target.key
      );
    }

    let remote = null;
    if (statusResult?.ok) {
      remote = statusResult.data;
    } else {
      const fallback = await bridgeRequest(
        'GET',
        `${target.url}/api/bridge/fetch?source_system=${encodeURIComponent(LOCAL_SYSTEM_NAME)}&source_id=${encodeURIComponent(request.id)}`,
        target.key
      );

      if (!fallback.ok) {
        throw new Error(fallback.data?.error || statusResult?.data?.error || 'Ошибка получения данных из внешней CRM');
      }
      remote = fallback.data;
    }

    const updated = await applyBridgeUpdateToRequest(request.id, remote, true);
    res.json(updated);
  } catch (err) {
    console.error('Bridge sync error:', err);
    res.status(500).json({ error: err.message || 'Ошибка синхронизации' });
  }
});

// === Availability (employee schedule grid) ===
app.get('/api/availability', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const month = String(req.query.month || ''); // YYYY-MM
    const city = req.query.city ? String(req.query.city) : null;
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Неверный формат month (YYYY-MM)' });
    }
    const [y, m] = month.split('-').map(Number);
    const monthStart = `${month}-01`;
    const nextMonth = new Date(Date.UTC(y, m, 1));
    const monthEnd = nextMonth.toISOString().slice(0, 10);

    // Сотрудники: все активные installer/measurer
    const usersRes = await pool.query(
      `SELECT id, name, role FROM users
       WHERE active = true AND role IN ('installer','measurer')
       ORDER BY role, name`
    );
    const users = usersRes.rows;
    const userIds = users.map(u => u.id);

    const requestsByUserDay = {};
    const absences = {};
    for (const id of userIds) {
      requestsByUserDay[id] = {};
      absences[id] = {};
    }

    if (userIds.length > 0) {
      // Заявки в этом месяце с назначенным сотрудником
      const params = [monthStart, monthEnd];
      let cityFilter = '';
      if (city) {
        params.push(city);
        cityFilter = ` AND city = $${params.length}`;
      }
      const reqRes = await pool.query(
        `SELECT id, number, type, status, client_name, client_address, city,
                agreed_date, measurer_id, installer_id, installer_2_id, installer_3_id, installer_4_id
         FROM requests
         WHERE agreed_date IS NOT NULL
           AND agreed_date >= $1 AND agreed_date < $2
           ${cityFilter}`,
        params
      );
      for (const r of reqRes.rows) {
        const day = r.agreed_date instanceof Date
          ? r.agreed_date.toISOString().slice(0, 10)
          : String(r.agreed_date).slice(0, 10);
        const dayReq = {
          id: r.id, number: r.number, type: r.type, status: r.status,
          client_name: r.client_name, client_address: r.client_address, city: r.city,
        };
        const assigned = [];
        if (r.type === 'measurement' && r.measurer_id) assigned.push(r.measurer_id);
        if (r.type !== 'measurement') {
          [r.installer_id, r.installer_2_id, r.installer_3_id, r.installer_4_id]
            .filter(Boolean).forEach(id => assigned.push(id));
        }
        for (const uid of assigned) {
          if (!requestsByUserDay[uid]) continue;
          if (!requestsByUserDay[uid][day]) requestsByUserDay[uid][day] = [];
          requestsByUserDay[uid][day].push(dayReq);
        }
      }

      // Отсутствия
      const absRes = await pool.query(
        `SELECT user_id, date, kind FROM employee_absences
         WHERE user_id = ANY($1::uuid[]) AND date >= $2 AND date < $3`,
        [userIds, monthStart, monthEnd]
      );
      for (const a of absRes.rows) {
        const day = a.date instanceof Date ? a.date.toISOString().slice(0, 10) : String(a.date).slice(0, 10);
        if (!absences[a.user_id]) absences[a.user_id] = {};
        absences[a.user_id][day] = a.kind;
      }
    }

    res.json({ users, requestsByUserDay, absences });
  } catch (err) {
    console.error('GET /api/availability error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/availability/absence', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const { user_id, date, kind } = req.body || {};
    if (!user_id || !date) return res.status(400).json({ error: 'user_id и date обязательны' });
    if (kind === null || kind === undefined || kind === '') {
      await pool.query('DELETE FROM employee_absences WHERE user_id = $1 AND date = $2', [user_id, date]);
      return res.json({ ok: true, removed: true });
    }
    if (!['dayoff', 'vacation', 'sick'].includes(kind)) {
      return res.status(400).json({ error: 'Неверный kind' });
    }
    const { rows } = await pool.query(
      `INSERT INTO employee_absences (user_id, date, kind)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET kind = EXCLUDED.kind
       RETURNING *`,
      [user_id, date, kind]
    );
    res.json({ ok: true, absence: rows[0] });
  } catch (err) {
    console.error('POST /api/availability/absence error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('Doorium API running on port ' + PORT);
});
