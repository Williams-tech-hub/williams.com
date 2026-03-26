'use strict';

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'change-me';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const DEFAULT_REPLY =
  process.env.DEFAULT_REPLY ||
  'Thanks for your message! This is an automated reply while we are offline.';

app.use(express.json());

const isConfigured = () => Boolean(WHATSAPP_TOKEN && PHONE_NUMBER_ID);

const sendTextMessage = async (to, text) => {
  if (!isConfigured()) {
    console.warn(
      'WHATSAPP_TOKEN or PHONE_NUMBER_ID is missing. Skipping outbound reply.'
    );
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          text: { body: text },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to send message (${response.status}): ${errorText || 'Unknown error'}`
      );
    }
  } catch (error) {
    console.error('Error sending WhatsApp message', error);
  }
};

const buildAutoReply = (incomingText) => {
  if (!incomingText) return DEFAULT_REPLY;
  return `${DEFAULT_REPLY}\n\nYou said: "${incomingText}"`;
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body?.object === 'whatsapp_business_account') {
    body.entry?.forEach((entry) => {
      entry.changes?.forEach((change) => {
        const messages = change.value?.messages;
        if (!messages || messages.length === 0) return;

        messages.forEach((message) => {
          const from = message.from;
          const incomingText = message.text?.body;
          const reply = buildAutoReply(incomingText);
          void sendTextMessage(from, reply);
        });
      });
    });

    return res.sendStatus(200);
  }

  return res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`WhatsApp auto-reply bot listening on port ${PORT}`);
  if (!isConfigured()) {
    console.warn(
      'Outbound replies are disabled until WHATSAPP_TOKEN and PHONE_NUMBER_ID are set.'
    );
  }
});
