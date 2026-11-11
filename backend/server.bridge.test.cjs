const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(`${__dirname}/server.js`, 'utf8');
function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  const end = source.indexOf('\n}', start) + 2;
  return source.slice(start, end);
}

function harness(results = [{ ok: true, data: {} }]) {
  const calls = [], queries = [], errors = [];
  const request = { id: 'local-id', external_id: 'remote-id', external_system: 'primedoor', notes: 'Заметка для монтажа' };
  const context = vm.createContext({
    console: { info() {}, error: (...args) => errors.push(args.join(' ')) },
    LOCAL_SYSTEM_NAME: 'doorium', OWN_PUBLIC_API_URL: 'https://local.invalid',
    encodeURIComponent, normalizePhone: value => value,
    resolveBridgeTarget: () => ({ url: 'https://remote.invalid', key: 'test-placeholder' }),
    absolutizeBridgePhotos: value => value,
    bridgeRequest: async (method, url, key, payload) => {
      calls.push({ method, url, payload });
      return results[Math.min(calls.length - 1, results.length - 1)];
    },
    pool: { query: async (sql) => { queries.push(sql); return { rows: [request] }; } },
  });
  vm.runInContext(`${extractFunction('buildBridgeUpdate')}\nasync ${extractFunction('bridgeAutoSync')}`, context);
  return { context, calls, queries, errors, request };
}

test('saved notes are sent for requests originating in either CRM', async () => {
  for (const system of ['doorium', 'primedoor']) {
    const h = harness();
    h.context.LOCAL_SYSTEM_NAME = system;
    await vm.runInContext("bridgeAutoSync('local-id')", h.context);
    assert.equal(h.calls[0].payload.notes, 'Заметка для монтажа');
    assert.equal(h.calls[0].payload.source_system, system);
    assert.equal(h.calls[0].url, 'https://remote.invalid/api/bridge/update/remote-id');
  }
});

test('incoming notes changes and clearing are applied, absent notes are preserved', () => {
  const h = harness();
  for (const notes of ['Новая заметка', '', null]) {
    h.context.input = { notes };
    const result = vm.runInContext('buildBridgeUpdate(input)', h.context);
    assert.equal(result.fields[1], 'notes = $1');
    assert.equal(result.values[0], notes);
  }
  const result = vm.runInContext('buildBridgeUpdate({ status: "pending" })', h.context);
  assert.equal(result.fields.some(field => field.startsWith('notes =')), false);
});

test('blocked delivery is not recorded as successful synchronization', async () => {
  const h = harness([{ ok: true, data: { blocked: true, reason: 'rejected' } }]);
  await vm.runInContext("bridgeAutoSync('local-id')", h.context);
  assert.equal(h.queries.some(sql => sql.startsWith('UPDATE')), false);
  assert.ok(h.errors.some(message => message.includes('rejected')));
});

test('authorization failure stops delivery without trying to recreate the request', async () => {
  const h = harness([{ ok: false, status: 401, data: { error: 'Invalid bridge key' } }]);
  await vm.runInContext("bridgeAutoSync('local-id')", h.context);
  assert.equal(h.calls.length, 1);
  assert.equal(h.queries.some(sql => sql.startsWith('UPDATE')), false);
});

test('unavailable direct endpoint still allows legacy delivery of notes', async () => {
  const h = harness([{ ok: false, status: 404, data: {} }, { ok: true, data: {} }]);
  await vm.runInContext("bridgeAutoSync('local-id')", h.context);
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].payload.notes, 'Заметка для монтажа');
  assert.equal(h.queries.some(sql => sql.startsWith('UPDATE')), true);
});

test('local save starts bridge delivery before awaiting notifications', async () => {
  const start = source.indexOf("app.put('/api/requests/:id'");
  const end = source.indexOf('\n});', start) + 4;
  const route = source.slice(start, end);
  let handler;
  const events = [];
  const original = { id: 'local-id', external_id: 'remote-id', external_system: 'primedoor', status: 'new' };
  let reads = 0;
  const context = vm.createContext({
    console: { info() {}, error() {} },
    app: { put: (path, ...handlers) => { handler = handlers.at(-1); } }, auth() {},
    hasClosedAtColumn: false,
    pool: { query: async () => ({ rows: [++reads === 1 ? original : { ...original, measurer_id: 'worker', notes: 'Новая заметка' }] }) },
    bridgeAutoSync: async () => { events.push('bridge'); },
    notifyUserById: async () => { events.push('notification'); throw new Error('Notification unavailable'); },
    SITE_URL: 'https://local.invalid',
  });
  vm.runInContext(route, context);
  await handler({ params: { id: 'local-id' }, user: { role: 'manager' }, body: { notes: 'Новая заметка', measurer_id: 'worker' } }, {
    status: () => ({ json() {} }), json() {},
  });
  assert.deepEqual(events, ['bridge', 'notification']);
});