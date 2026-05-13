// Doorium notifications: Telegram + SMS Gateway for Android
// Mirrors the architecture used in the Primedoor project.

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'https://api.sms-gate.app/3rdparty/v1/message';
const SMS_GATEWAY_LOGIN = process.env.SMS_GATEWAY_LOGIN;
const SMS_GATEWAY_PASSWORD = process.env.SMS_GATEWAY_PASSWORD;
const NOTIFY_DRIVER = (process.env.NOTIFY_DRIVER || 'both').toLowerCase();
const SMS_DIAGNOSTIC_DELAY_MS = parseInt(process.env.SMS_DIAGNOSTIC_DELAY_MS || '1500', 10);

const useTg = NOTIFY_DRIVER === 'telegram' || NOTIFY_DRIVER === 'both';
const useSms = NOTIFY_DRIVER === 'sms' || NOTIFY_DRIVER === 'both';

// === HTML → SMS ===
// SMS are billed per segment; we strip emoji (otherwise UCS-2 → 70 chars/segment)
// and we drop URLs that follow words like «войти/открыть/подробнее» — no links in SMS.
function htmlToSms(html) {
  if (!html) return '';
  let s = String(html);

  // <a href="...">текст</a> → текст; если внутри ссылки слова «войти|открыть|подробнее» — выкинуть целиком.
  s = s.replace(/<a\s+[^>]*href=["'][^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, (_, inner) => {
    const plain = inner.replace(/<[^>]+>/g, '').trim();
    if (/войти|открыть|подробнее/i.test(plain)) return '';
    return plain;
  });

  // strip remaining tags
  s = s.replace(/<[^>]+>/g, '');

  // decode common entities
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

  // remove emoji (ranges that switch SMS to UCS-2)
  s = s.replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
       .replace(/[\u{2600}-\u{27BF}]/gu, '')
       .replace(/[\u{2300}-\u{23FF}]/gu, '')
       .replace(/[\u{1F000}-\u{1F2FF}]/gu, '');

  // collapse whitespace
  s = s.replace(/[ \t]+/g, ' ')
       .replace(/ *\n */g, '\n')
       .replace(/\n{2,}/g, '\n\n')
       .trim();

  return s;
}

// === Telegram ===
async function sendTelegram(telegramId, htmlMessage) {
  if (!useTg) return;
  if (!telegramId || !TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramId, text: htmlMessage, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('Telegram notify error:', err.message);
  }
}

// === SMS Gateway hint (Honor / Xiaomi etc.) ===
function smsGatewayHint(errorText) {
  if (!errorText) return null;
  if (/android\.permission\.SEND_SMS/i.test(errorText)) {
    return 'На телефоне-шлюзе: Настройки → Приложения → SMSGate → меню ⋮ в правом верхнем углу карточки приложения → «Разрешить ограниченные настройки» → подтвердить PIN/паролем → затем включить разрешение «SMS». Либо переустановить шлюз из полного app-release.apk (не nosms-вариант).';
  }
  return null;
}

// === SMS ===
async function sendSms(phone, text, options = {}) {
  if (!useSms) return { skipped: true };
  if (!phone || !text) return { skipped: true };
  if (!SMS_GATEWAY_LOGIN || !SMS_GATEWAY_PASSWORD) {
    console.error('SMS: gateway credentials missing');
    return { ok: false, error: 'no credentials' };
  }
  const auth = Buffer.from(`${SMS_GATEWAY_LOGIN}:${SMS_GATEWAY_PASSWORD}`).toString('base64');
  try {
    const res = await fetch(SMS_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text, phoneNumbers: [phone] }),
    });
    const bodyText = await res.text();
    let body;
    try { body = JSON.parse(bodyText); } catch { body = { raw: bodyText }; }

    if (!res.ok) {
      const hint = smsGatewayHint(bodyText);
      console.error('SMS gateway error:', res.status, bodyText, hint ? `\nHINT: ${hint}` : '');
      return { ok: false, status: res.status, body, hint };
    }

    if (options.diagnose && body && body.id) {
      await new Promise((r) => setTimeout(r, SMS_DIAGNOSTIC_DELAY_MS));
      try {
        const statusRes = await fetch(`${SMS_GATEWAY_URL}/${body.id}`, {
          headers: { 'Authorization': `Basic ${auth}` },
        });
        const statusText = await statusRes.text();
        let statusBody;
        try { statusBody = JSON.parse(statusText); } catch { statusBody = { raw: statusText }; }
        const hint = smsGatewayHint(statusText);
        return { ok: true, body, status: statusBody, hint };
      } catch (err) {
        console.error('SMS diagnose error:', err.message);
        return { ok: true, body };
      }
    }

    return { ok: true, body };
  } catch (err) {
    const hint = smsGatewayHint(err.message);
    console.error('SMS send error:', err.message, hint ? `\nHINT: ${hint}` : '');
    return { ok: false, error: err.message, hint };
  }
}

// === High-level helpers ===
async function notifyUser(user, htmlMessage, options = {}) {
  if (!user) return;
  const tasks = [];
  if (useTg && user.telegram_id) tasks.push(sendTelegram(user.telegram_id, htmlMessage));
  if (useSms && user.phone) {
    const text = htmlToSms(htmlMessage);
    if (text) tasks.push(sendSms(user.phone, text, options));
  }
  if (tasks.length) await Promise.all(tasks);
}

async function notifyUserById(pool, userId, htmlMessage, options = {}) {
  if (!userId) return;
  try {
    const { rows } = await pool.query(
      'SELECT telegram_id, phone FROM users WHERE id = $1 AND active = true',
      [userId]
    );
    if (rows[0]) await notifyUser(rows[0], htmlMessage, options);
  } catch (err) {
    console.error('notifyUserById error:', err.message);
  }
}

async function notifyManagersAndAdmins(pool, htmlMessage, options = {}) {
  try {
    const { rows } = await pool.query(
      "SELECT telegram_id, phone FROM users WHERE role IN ('manager', 'admin') AND active = true"
    );
    await Promise.all(rows.map((u) => notifyUser(u, htmlMessage, options)));
  } catch (err) {
    console.error('notifyManagersAndAdmins error:', err.message);
  }
}

async function notifyPartner(pool, partnerId, htmlMessage, options = {}) {
  if (!partnerId) return;
  try {
    const { rows } = await pool.query(
      'SELECT telegram_id, phone FROM users WHERE id = $1 AND active = true',
      [partnerId]
    );
    if (rows[0]) await notifyUser(rows[0], htmlMessage, options);
  } catch (err) {
    console.error('notifyPartner error:', err.message);
  }
}

module.exports = {
  sendTelegram,
  sendSms,
  notifyUser,
  notifyUserById,
  notifyManagersAndAdmins,
  notifyPartner,
  htmlToSms,
  smsGatewayHint,
};
