const assert = require('node:assert/strict');
const { test } = require('node:test');

const { app } = require('../index');

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });

test('verifies webhook when token matches', async (t) => {
  process.env.VERIFY_TOKEN = 'verify-me';
  const { server, url } = await startServer();
  t.after(() => server.close());

  const response = await fetch(
    `${url}/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=123`
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), '123');
});

test('rejects webhook verification when token is wrong', async (t) => {
  process.env.VERIFY_TOKEN = 'verify-me';
  const { server, url } = await startServer();
  t.after(() => server.close());

  const response = await fetch(
    `${url}/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=123`
  );

  assert.equal(response.status, 403);
});

test('accepts inbound WhatsApp webhook payloads', async (t) => {
  process.env.VERIFY_TOKEN = 'verify-me';
  delete process.env.WHATSAPP_TOKEN;
  delete process.env.PHONE_NUMBER_ID;

  const { server, url } = await startServer();
  t.after(() => server.close());

  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                { from: '15550001111', text: { body: 'Hi there' } },
              ],
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(`${url}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(response.status, 200);
});
