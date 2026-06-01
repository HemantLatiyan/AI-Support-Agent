# AI Support Agent

A simple live chat widget where an AI agent answers customer support questions. Built as a take-home assignment for Spur.

---

## Stack

- **Backend:** Node.js + TypeScript, Express, Drizzle ORM, SQLite
- **Frontend:** SvelteKit (Svelte 5)
- **LLM:** Google Gemini
- **Cache:** Redis (optional, app works without it)

---

## Deployment
Frontend - Vercel
Backend - Railway

## Running locally

### Prerequisites

- Node.js 18+
- A Google Gemini API key (get one at [aistudio.google.com](https://aistudio.google.com))
- Redis running locally on port 6379 (optional)

### Backend

```bash
cd backend
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm install
npm run db:migrate
npm run dev
```

The server starts on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

### Environment variables

Create `backend/.env` with the following:

```
PORT=8000
DATABASE_URL=./local.db
GEMINI_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379   # optional
```

---

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat/message` | Send a message, get an AI reply |
| GET | `/chat/:conversationId/messages` | Fetch history for a conversation |

`POST /chat/message` body:
```json
{ "message": "What is your return policy?", "conversationId": "optional-uuid" }
```

Response:
```json
{ "reply": "...", "conversationId": "uuid" }
```

---

## Architecture

```
backend/src/
  routes/       HTTP layer -- validates input, calls service, returns response
  services/     Business logic -- orchestrates DB + LLM calls
  repositories/ Database access -- conversations and messages
  lib/          External clients (Gemini, Redis)
  middleware/   Input validation, rate limiting
  db/           Drizzle schema and migrations
```

The frontend keeps all reactive state in `src/lib/chat.svelte.ts` (a Svelte 5 rune class) and API calls live in `src/lib/api.ts`.

Conversations are persisted in SQLite via Drizzle ORM. The `conversationId` is saved in `localStorage` so the chat history survives a page reload. Redis caches message lists per conversation for 30 minutes to avoid repeated DB reads.

---

## LLM notes

Provider: Google Gemini.

The prompt is built in `backend/src/services/llm.service.ts`. It includes a system prompt along with guardrail and fictional store's policies (shipping, returns, support hours) hardcoded as text, followed by the last 20 messages of conversation history, then the user's message. Keeping history in a single string prompt was the simplest approach that works reliably with Gemini's API.

LLM errors are caught and mapped to user-friendly messages before reaching the frontend. API key issues, rate limits, and timeouts each get a distinct message.

---

## Trade-offs and what I'd do with more time

**Kept simple on purpose:**
- No auth. The `conversationId` in localStorage is the only session mechanism. Fine for a demo, not for production.
- System prompt is hardcoded. A real product would pull store policies from the database so they can be edited without a deploy.
- Currently using SQLite instead of PostgreSQL. Easy to run locally with no setup. Would switch to Postgres for anything beyond a prototype.

**If I had more time:**
- Streaming responses. The backend already has a `/chat/stream` SSE endpoint, the frontend just does not use it yet. Hooking it up would make replies feel much faster.
- Better prompt structure. Using Gemini's native `contents` array with proper `user`/`model` roles instead of a flattened string gives the model better context.
- Conversation list. Let users switch between past conversations instead of only restoring the most recent one.
- Input auto-resize. The textarea currently has a fixed max height; making it grow with the content would feel nicer.
- Would like to add Markdown rendering for agent responses.
