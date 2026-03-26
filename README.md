# WhatsApp Auto-Reply Bot

This project hosts a minimal WhatsApp Cloud API webhook that automatically replies to incoming messages even when you are offline. It uses a simple Express server to verify the webhook, receive messages, and send an automated response.

## Prerequisites

- A Meta app with WhatsApp Cloud API enabled.
- A WhatsApp Business phone number ID and permanent token from the Meta developer dashboard.
- A public HTTPS URL for the webhook (e.g., via your hosting provider or an HTTPS tunnel like ngrok while testing).
- A verification token of your choice to complete webhook setup.

> The Cloud API only works with WhatsApp Business numbers; personal accounts are not supported by Meta for automation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Expose the server over HTTPS and configure the webhook in the Meta developer console:
   - Callback URL: `https://your-domain.com/webhook`
   - Verify token: the same value you set in `VERIFY_TOKEN`
   - Subscribe to **messages** events.

## Environment variables

- `PORT`: Port to run the server (defaults to 3000).
- `VERIFY_TOKEN`: Token used by Meta to verify the webhook.
- `WHATSAPP_TOKEN`: WhatsApp Cloud API access token.
- `PHONE_NUMBER_ID`: WhatsApp Business phone number ID.
- `DEFAULT_REPLY`: Message used for the automated reply (default provided).

## Endpoints

- `GET /webhook`: Verification endpoint used by Meta during webhook setup.
- `POST /webhook`: Receives incoming messages and sends an automated reply.
- `GET /health`: Simple health check returning `{ status: "ok" }`.

## How auto-replies work

When a message is received, the bot builds a reply using `DEFAULT_REPLY` and echoes the sender's message. If `WHATSAPP_TOKEN` or `PHONE_NUMBER_ID` are missing, inbound webhooks are still accepted but outbound replies are skipped (logged as a warning).

## Running tests

Run the small integration tests with:
```bash
npm test
```
These tests cover webhook verification and accepting inbound message payloads.
