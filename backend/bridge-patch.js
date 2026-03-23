
// === Bridge API (inter-CRM exchange) ===
const BRIDGE_PATCH_API_KEY = process.env.BRIDGE_API_KEY;
const LOCAL_SYSTEM_NAME = process.env.CRM_SYSTEM_NAME || 'doorium';
const REMOTE_SYSTEM_NAME = process.env.BRIDGE_REMOTE_SYSTEM || (LOCAL_SYSTEM_NAME === 'doorium' ? 'primedoor' : 'doorium');
const BRIDGE_REMOTE_API_URL = process.env.BRIDGE_REMOTE_API_URL || process.env.DOORIUM_API_URL || process.env.PRIMEDOOR_API_URL;
const BRIDGE_REMOTE_API_KEY = process.env.BRIDGE_REMOTE_API_KEY || process.env.DOORIUM_API_KEY || process.env.PRIMEDOOR_API_KEY;

const bridgeAuth = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!BRIDGE_PATCH_API_KEY || key !== BRIDGE_PATCH_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

(async () => {
  try {
    await pool.query(`
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_id TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_system TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_synced_at TIMESTAMPTZ;
    `);
    console.log('Bridge columns ensured');
  } catch (err) { console.error('Bridge columns:', err.message); }
})();

// === Auto-sync: push changes to remote CRM after local update ===
async function bridgeAutoSync(requestId) {
  try {
    if (!BRIDGE_REMOTE_API_URL || !BRIDGE_REMOTE_API_KEY) return;
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [requestId]);
    if (!rows.length || !rows[0].external_id || !rows[0].external_system) return;

    const r = rows[0];
    const response = await fetch(BRIDGE_REMOTE_API_URL + '/api/bridge/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': BRIDGE_REMOTE_API_KEY },
      body: JSON.stringify({
        source_system: LOCAL_SYSTEM_NAME,
        source_id: r.id,
        status: r.status,
        notes: r.notes,
        amount: r.amount,
        agreed_date: r.agreed_date,
        work_description: r.work_description,
      }),
    });
    if (response.ok) {
      await pool.query('UPDATE requests SET external_synced_at = NOW() WHERE id = $1', [requestId]);
      console.log('Bridge auto-sync OK for request', r.number);
    } else {
      const d = await response.json().catch(() => ({}));
      console.error('Bridge auto-sync failed:', d.error || response.status);
    }
  } catch (err) {
    console.error('Bridge auto-sync error:', err.message);
  }
}




app.post('/api/bridge/receive', bridgeAuth, async (req, res) => {
  try {
    const { source_system, source_id, client_name, client_phone, client_address, city, type, status, work_description, notes, photos, interior_doors, entrance_doors, partitions, agreed_date, amount } = req.body;
    if (!source_system || !source_id || !client_name || !client_phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await pool.query('SELECT id FROM requests WHERE external_id = $1 AND external_system = $2', [source_id, source_system]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Already exists', id: existing.rows[0].id });

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

app.put('/api/bridge/status', bridgeAuth, async (req, res) => {
  try {
    const { source_system, source_id, status, notes, amount, agreed_date, work_description } = req.body;
    const { rows } = await pool.query('SELECT id FROM requests WHERE external_id = $1 AND external_system = $2', [source_id, source_system]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const fields = ['external_synced_at = NOW()'];
    const values = [];
    let idx = 1;
    if (status !== undefined && status !== null && status !== '') { fields.push('status = $' + idx++); values.push(status); }
    if (notes !== undefined) { fields.push('notes = $' + idx++); values.push(notes); }
    if (amount !== undefined) { fields.push('amount = $' + idx++); values.push(amount); }
    if (agreed_date !== undefined) { fields.push('agreed_date = $' + idx++); values.push(agreed_date); }
    if (work_description !== undefined) { fields.push('work_description = $' + idx++); values.push(work_description); }
    values.push(rows[0].id);

    const updated = await pool.query('UPDATE requests SET ' + fields.join(', ') + ' WHERE id = $' + idx + ' RETURNING *', values);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Bridge status:', err);
    res.status(500).json({ error: 'Error' });
  }
});

// === GET endpoint: return request data by external_id (for manual sync pull) ===
app.get('/api/bridge/fetch', bridgeAuth, async (req, res) => {
  try {
    const { source_system, source_id } = req.query;
    if (!source_system || !source_id) return res.status(400).json({ error: 'Missing source_system or source_id' });

    const { rows } = await pool.query('SELECT * FROM requests WHERE external_id = $1 AND external_system = $2', [source_id, source_system]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const r = rows[0];
    res.json({
      status: r.status,
      notes: r.notes,
      amount: r.amount,
      agreed_date: r.agreed_date,
      work_description: r.work_description,
      client_name: r.client_name,
      client_phone: r.client_phone,
      client_address: r.client_address,
      interior_doors: r.interior_doors,
      entrance_doors: r.entrance_doors,
      partitions: r.partitions,
      photos: r.photos,
      updated_at: r.updated_at,
    });
  } catch (err) {
    console.error('Bridge fetch:', err);
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/bridge/send/:id', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  if (!BRIDGE_REMOTE_API_URL || !BRIDGE_REMOTE_API_KEY) return res.status(500).json({ error: 'Remote CRM not configured' });

  try {
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const request = rows[0];
    if (request.external_id) return res.status(400).json({ error: 'Already sent' });

    const response = await fetch(BRIDGE_REMOTE_API_URL + '/api/bridge/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': BRIDGE_REMOTE_API_KEY },
      body: JSON.stringify({
        source_system: LOCAL_SYSTEM_NAME, source_id: request.id,
        number: request.number, type: request.type, status: request.status,
        client_name: request.client_name, client_phone: request.client_phone,
        client_address: request.client_address, city: request.city,
        work_description: request.work_description, notes: request.notes,
        photos: request.photos, interior_doors: request.interior_doors,
        entrance_doors: request.entrance_doors, partitions: request.partitions,
        agreed_date: request.agreed_date, amount: request.amount,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Remote CRM error');

    await pool.query('UPDATE requests SET external_id = $1, external_system = $2, external_synced_at = NOW() WHERE id = $3', [data.id, REMOTE_SYSTEM_NAME, request.id]);
    const updated = await pool.query('SELECT * FROM requests WHERE id = $1', [request.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Bridge send:', err);
    res.status(500).json({ error: err.message });
  }
});

// === SYNC: PULL changes FROM remote CRM (manual button) ===
app.post('/api/bridge/sync/:id', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  if (!BRIDGE_REMOTE_API_URL || !BRIDGE_REMOTE_API_KEY) return res.status(500).json({ error: 'Remote CRM not configured' });

  try {
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const request = rows[0];
    if (!request.external_id) return res.status(400).json({ error: 'Not linked' });

    // Fetch current state from remote CRM
    const response = await fetch(BRIDGE_REMOTE_API_URL + '/api/bridge/fetch?source_system=' + encodeURIComponent(LOCAL_SYSTEM_NAME) + '&source_id=' + encodeURIComponent(request.id), {
      method: 'GET',
      headers: { 'X-API-Key': BRIDGE_REMOTE_API_KEY },
    });
    if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Fetch error'); }

    const remote = await response.json();

    // Update local request with remote data
    const fields = ['external_synced_at = NOW()'];
    const values = [];
    let idx = 1;
    if (remote.status !== undefined && remote.status !== null && remote.status !== '') { fields.push('status = $' + idx++); values.push(remote.status); }
    if (remote.notes !== undefined && remote.notes !== null) { fields.push('notes = $' + idx++); values.push(remote.notes); }
    if (remote.amount !== undefined && remote.amount !== null) { fields.push('amount = $' + idx++); values.push(remote.amount); }
    if (remote.agreed_date !== undefined && remote.agreed_date !== null) { fields.push('agreed_date = $' + idx++); values.push(remote.agreed_date); }
    if (remote.work_description !== undefined && remote.work_description !== null) { fields.push('work_description = $' + idx++); values.push(remote.work_description); }
    values.push(request.id);

    await pool.query('UPDATE requests SET ' + fields.join(', ') + ' WHERE id = $' + idx, values);
    const updated = await pool.query('SELECT * FROM requests WHERE id = $1', [request.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Bridge sync:', err);
    res.status(500).json({ error: err.message });
  }
});
