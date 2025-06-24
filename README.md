# 🤖 Discord Bot (Raw API – TypeScript)

A minimal Discord bot built **from scratch** in TypeScript, using only native REST and WebSocket calls — **no `discord.js` or external bot libraries**. Designed for learning, experimentation, and full control over the Discord API.

---

## 📦 Tech Stack

- **TypeScript** – Type-safe JavaScript
- **Axios** – For REST API requests
- **WS** – For WebSocket Gateway connection
- **Node.js** – Runtime environment

---

## 🧠 Features

- Connects to the Discord Gateway (WebSocket)
- Handles `HELLO`, `IDENTIFY`, and `HEARTBEAT` opcodes
- Sends messages to channels via the REST API
- Fully modular and extendable structure
- No magic, no abstraction — 100% transparent logic
