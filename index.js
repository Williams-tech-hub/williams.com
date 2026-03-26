'use strict';

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_REPLY =
  process.env.DEFAULT_REPLY ||
  'Thanks for your message! This is an automated reply while we are offline.';

app.use(express.json());

const getVerifyToken = () => process.env.VERIFY_TOKEN;
const getWhatsappToken = () => process.env.WHATSAPP_TOKEN;
const getPhoneNumberId = () => process.env.PHONE_NUMBER_ID;

const isConfigured = () =>
  Boolean(getWhatsappToken() && getPhoneNumberId());

const sendTextMessage = async (to, text) => {
  const whatsappToken = getWhatsappToken();
  const phoneNumberId = getPhoneNumberId();

  if (!whatsappToken || !phoneNumberId) {
    console.warn(
      'WHATSAPP_TOKEN or PHONE_NUMBER_ID is missing. Skipping outbound reply.'
    );
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${whatsappToken}`,
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
  const verifyToken = getVerifyToken();
  if (!verifyToken) {
    console.warn('VERIFY_TOKEN is not set. Rejecting verification request.');
    return res.status(500).send('VERIFY_TOKEN not configured');
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body?.object === 'whatsapp_business_account') {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const messages = change.value?.messages;
        if (!messages || messages.length === 0) continue;

        for (const message of messages) {
          const from = message.from;
          const incomingText = message.text?.body;
          const reply = buildAutoReply(incomingText);
          await sendTextMessage(from, reply);
        }
      }
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(404);
});

const start = () =>
  app.listen(PORT, () => {
    console.log(`WhatsApp auto-reply bot listening on port ${PORT}`);
    if (!isConfigured()) {
      console.warn(
        'Outbound replies are disabled until WHATSAPP_TOKEN and PHONE_NUMBER_ID are set.'
      );
    }
    if (!getVerifyToken()) {
      console.warn('VERIFY_TOKEN is not set; webhook verification will fail.');
    }
  });

if (require.main === module) {
  start();
}

module.exports = { app, start };
