# Doorium ↔ PrimeDoor Bridge API

## Обзор

REST API мост для обмена заявками между Doorium и PrimeDoor.
Каждая CRM имеет эндпоинты для приёма/отправки заявок с аутентификацией по API-ключу.

## Настройка Doorium

Добавьте в `.env`:

```
BRIDGE_API_KEY=сгенерируйте_длинный_ключ_мин_32_символа
PRIMEDOOR_API_URL=https://api.primedoor.ru
PRIMEDOOR_API_KEY=ключ_который_primedoor_ожидает
```

## Настройка PrimeDoor

Добавьте в PrimeDoor аналогичные переменные:

```
BRIDGE_API_KEY=ключ_который_doorium_будет_отправлять
DOORIUM_API_URL=https://api.doorium.ru
DOORIUM_API_KEY=ключ_из_doorium_bridge_api_key
```

## Эндпоинты

### `POST /api/bridge/receive` — Приём заявки
**Заголовки:** `X-API-Key: <BRIDGE_API_KEY>`

```json
{
  "source_system": "doorium",
  "source_id": "uuid-заявки-в-doorium",
  "number": "REQ-042",
  "type": "measurement",
  "status": "new",
  "client_name": "Иванов Иван",
  "client_phone": "+79001234567",
  "client_address": "ул. Пушкина, д.1",
  "city": "Москва",
  "work_description": "Замер межкомнатных дверей",
  "photos": [],
  "interior_doors": 3,
  "entrance_doors": 1
}
```

**Ответ:** `{ "id": "uuid-в-primedoor", "number": "REQ-001" }`

### `PUT /api/bridge/status` — Обновление статуса
**Заголовки:** `X-API-Key: <BRIDGE_API_KEY>`

```json
{
  "source_system": "doorium",
  "source_id": "uuid-заявки-в-doorium",
  "status": "closed",
  "amount": 45000,
  "notes": "Готово"
}
```

### `POST /api/bridge/send/:id` — Отправка заявки (auth JWT)
Внутренний эндпоинт Doorium. Отправляет заявку в PrimeDoor.

### `POST /api/bridge/sync/:id` — Синхронизация статуса (auth JWT)
Внутренний эндпоинт Doorium. Синхронизирует текущий статус с PrimeDoor.

## Код для PrimeDoor (server.js)

Добавьте эти эндпоинты в PrimeDoor `server.js`:

```javascript
// === Bridge API ===
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY;
const DOORIUM_API_URL = process.env.DOORIUM_API_URL;
const DOORIUM_API_KEY = process.env.DOORIUM_API_KEY;

const bridgeAuth = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!BRIDGE_API_KEY || key !== BRIDGE_API_KEY) {
    return res.status(401).json({ error: 'Неверный API-ключ' });
  }
  next();
};

// Auto-add columns
(async () => {
  try {
    await pool.query(`
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_id TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_system TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_synced_at TIMESTAMPTZ;
    `);
  } catch (err) { console.error('Bridge columns:', err.message); }
})();

// Receive request from Doorium
app.post('/api/bridge/receive', bridgeAuth, async (req, res) => {
  try {
    const { source_system, source_id, client_name, client_phone, client_address, city, type, status, work_description, notes, photos, interior_doors, entrance_doors, partitions, agreed_date, amount } = req.body;
    if (!source_system || !source_id || !client_name || !client_phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await pool.query('SELECT id FROM requests WHERE external_id = $1 AND external_system = $2', [source_id, source_system]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Already exists', id: existing.rows[0].id });

    // Generate number (adapt to your numbering scheme)
    const countResult = await pool.query("SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)), 0) AS count FROM requests");
    const number = 'REQ-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');

    const { rows } = await pool.query(
      `INSERT INTO requests (number, client_name, client_phone, client_address, city, type, status, work_description, notes, photos, interior_doors, entrance_doors, partitions, agreed_date, amount, source, external_id, external_system, external_synced_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15,'bridge',$16,$17,NOW()) RETURNING id, number`,
      [number, client_name, client_phone, client_address || '', city, type || 'measurement', status || 'new', work_description, notes, photos ? JSON.stringify(photos) : '[]', interior_doors, entrance_doors, partitions, agreed_date, amount, source_id, source_system]
    );
    res.json({ id: rows[0].id, number: rows[0].number });
  } catch (err) {
    console.error('Bridge receive:', err);
    res.status(500).json({ error: 'Error' });
  }
});

// Receive status update from Doorium
app.put('/api/bridge/status', bridgeAuth, async (req, res) => {
  try {
    const { source_system, source_id, status, notes, amount, agreed_date } = req.body;
    const { rows } = await pool.query('SELECT id FROM requests WHERE external_id = $1 AND external_system = $2', [source_id, source_system]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const fields = ['external_synced_at = NOW()'];
    const values = [];
    let idx = 1;
    if (status) { fields.push(`status = $${idx++}`); values.push(status); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }
    if (amount !== undefined) { fields.push(`amount = $${idx++}`); values.push(amount); }
    if (agreed_date !== undefined) { fields.push(`agreed_date = $${idx++}`); values.push(agreed_date); }
    values.push(rows[0].id);

    const updated = await pool.query(`UPDATE requests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Bridge status:', err);
    res.status(500).json({ error: 'Error' });
  }
});

// Send request TO Doorium (admin/manager only, uses JWT auth)
app.post('/api/bridge/send/:id', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  if (!DOORIUM_API_URL || !DOORIUM_API_KEY) return res.status(500).json({ error: 'Doorium not configured' });

  const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const request = rows[0];
  if (request.external_id) return res.status(400).json({ error: 'Already sent' });

  const response = await fetch(`${DOORIUM_API_URL}/api/bridge/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': DOORIUM_API_KEY },
    body: JSON.stringify({
      source_system: 'primedoor',
      source_id: request.id,
      number: request.number,
      type: request.type, status: request.status,
      client_name: request.client_name, client_phone: request.client_phone,
      client_address: request.client_address, city: request.city,
      work_description: request.work_description, notes: request.notes,
      photos: request.photos, interior_doors: request.interior_doors,
      entrance_doors: request.entrance_doors, partitions: request.partitions,
      agreed_date: request.agreed_date, amount: request.amount,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Doorium error');

  await pool.query('UPDATE requests SET external_id = $1, external_system = $2, external_synced_at = NOW() WHERE id = $3', [data.id, 'doorium', request.id]);
  const updated = await pool.query('SELECT * FROM requests WHERE id = $1', [request.id]);
  res.json(updated.rows[0]);
});
```

## Генерация API-ключей

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Используйте один и тот же ключ парно:
- Doorium `BRIDGE_API_KEY` = то, что PrimeDoor отправляет в `X-API-Key`
- PrimeDoor `DOORIUM_API_KEY` = значение Doorium `BRIDGE_API_KEY`
- И наоборот

## Миграция БД

На обоих серверах выполните:
```sql
ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_system TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_synced_at TIMESTAMPTZ;
```
