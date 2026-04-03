# E-Commerce AI Support Chatbot — Project Plan

## What You're Building

A fake e-commerce store with a fully functional AI-powered customer support chatbot. Users can browse products and ask the chatbot questions like:

- "What's your return policy?"
- "Do you have this jacket in size large?"
- "What's the difference between these two laptops?"
- "Where is my order #1234?"

This is the same pattern used by Amazon, Shopify stores, and virtually every customer-facing AI product being built today. It demonstrates RAG (Retrieval-Augmented Generation), tool use, and streaming — the core AI engineering skill set.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Backend | Next.js API routes |
| Embeddings | OpenAI `text-embedding-3-small` |
| Vector DB | ChromaDB (local), Pinecone (production) |
| LLM | Claude Sonnet via Anthropic API |
| Deployment | Vercel |

**No LangChain.** You are writing the RAG pipeline yourself so you can explain every line in an interview.

---

## Project Structure

```
ecommerce-chatbot/
├── data/
│   ├── products.json        # 20-30 fake products
│   ├── faq.md               # shipping, returns, contact info
│   └── policies.md          # warranty, privacy, terms
├── scripts/
│   └── ingest.ts            # embeds data and loads into ChromaDB
├── src/
│   ├── app/
│   │   ├── page.tsx         # store homepage with product listings
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts # RAG pipeline + Claude call
│   ├── components/
│   │   ├── ProductGrid.tsx
│   │   ├── ChatWidget.tsx   # floating chat button + window
│   │   └── ChatMessage.tsx
│   └── lib/
│       ├── chromadb.ts      # vector DB client
│       ├── embeddings.ts    # embedding helper
│       └── tools.ts         # order lookup tool definition
├── .env.local
└── README.md
```

---

## Features

### Phase 1 — Core RAG Chatbot
- User sends a message
- Message is embedded and used to search the vector DB
- Top 5 relevant chunks are retrieved
- Claude answers using only those chunks as context
- If the answer isn't in the knowledge base, it says so and offers to connect to support

### Phase 2 — Streaming + Chat UI
- Responses stream token by token (like Claude.ai)
- Floating chat widget that opens/closes
- Chat history displayed in the session
- Loading indicator while waiting for first token

### Phase 3 — Tool Use (Order Lookup)
- Claude is given a `lookup_order(order_id)` tool
- User can ask "where is my order #1234?"
- Claude decides to call the tool, gets the fake order data, and responds naturally
- This is the most impressive feature — demonstrates agentic behavior

### Phase 4 — Polish
- Source citations: "Based on our return policy..." with a reference
- Fallback message when answer is not found
- Conversation memory within a session
- Basic eval script: 10 hardcoded questions with expected answers, scored automatically

---

## The RAG Pipeline (Core Logic)

```
User message
    → embed with OpenAI text-embedding-3-small
    → query ChromaDB for top 5 most similar chunks
    → build prompt: system prompt + retrieved context + user message
    → stream response from Claude Sonnet
    → display in chat UI
```

The ingestion pipeline (run once, or when data changes):

```
Load files from /data
    → split into chunks (~500 tokens each, 50 token overlap)
    → embed each chunk
    → store in ChromaDB with metadata (source file, chunk index)
```

---

## Week-by-Week Plan

### Week 1 — Foundation
**Day 1–2**
- `npx create-next-app@latest ecommerce-chatbot`
- Create `/data` folder with `products.json` (5 products to start), `faq.md`, `policies.md`
- Get Anthropic API key from console.anthropic.com — set $10 spending limit
- Make a single raw API call to Claude from a test script and print the response

**Day 3–4**
- Write `scripts/ingest.ts` — load files, chunk text, embed with OpenAI, store in ChromaDB
- Run it and confirm data is stored
- Write a test query: embed a question, retrieve chunks, print them to console

**Day 5–7**
- Build `/api/chat/route.ts` — take user message, run retrieval, call Claude, return response
- Test with curl before touching the UI
- Write your system prompt (this matters a lot — iterate on it)

### Week 2 — UI + Streaming
- Build basic store homepage with product grid (keep it simple, doesn't need to be beautiful)
- Build `ChatWidget.tsx` — floating button, opens a chat panel
- Wire chat UI to `/api/chat`
- Add streaming using the Vercel AI SDK or raw ReadableStream
- Make sure the UX feels smooth

### Week 3 — Tool Use
- Create `orders.json` with 10 fake orders (id, status, estimated delivery, items)
- Define the `lookup_order` tool in your Claude API call
- Handle the tool call response — when Claude calls the tool, query your JSON, return the result
- Continue the conversation with the tool result injected
- Test: "where is order #1042?" should trigger the tool and return real data

### Week 4 — Polish + Deploy
- Add source citations to responses
- Add fallback handling ("I don't have that info, contact support at support@fakestore.com")
- Write `scripts/eval.ts` — 10 questions, expected answers, score the chatbot
- Deploy to Vercel
- Record a 2-minute demo video showing the chatbot in action
- Write a strong README (see below)

---

## README Must-Haves

Your README is part of your portfolio. It should include:

- What the project does (1 paragraph)
- Architecture diagram or description
- How to run it locally (exact commands)
- How the RAG pipeline works (explain it in plain English)
- What you'd do to scale it to production (swap ChromaDB for Pinecone, add caching, add auth)
- A link to the live demo

---

## Interview Talking Points

Be ready to explain:

1. **Why RAG instead of just prompting Claude with everything?**
   Context windows have limits, and you want answers grounded in your specific data, not general knowledge.

2. **How do you chunk your documents and why does it matter?**
   Too small = not enough context. Too large = noise drowns out the relevant part. ~500 tokens with overlap is a good starting point.

3. **How does tool use work?**
   You define tools with a name, description, and parameters. Claude decides when to call them. You handle the call, return the result, Claude uses it in its response.

4. **How would you measure if this chatbot is good?**
   Evals — a set of questions with expected answers. You can score by exact match, semantic similarity, or LLM-as-judge.

5. **How would you scale this?**
   Replace ChromaDB with Pinecone, add prompt caching for repeated context, add a feedback loop (thumbs up/down), monitor with LangSmith or a custom logging layer.

---

## Key Concepts to Understand Before You Start

- **Tokens** — roughly 1 token per 0.75 words. Everything in AI is measured in tokens.
- **Embeddings** — a way to convert text into numbers that capture semantic meaning. Similar meaning = similar numbers = close in vector space.
- **Vector search** — finding the most similar embeddings to your query. This is how retrieval works.
- **Chunking** — splitting large documents into smaller pieces before embedding, so retrieval is precise.
- **System prompt** — the instruction you give Claude before the conversation starts. This defines how the chatbot behaves.
- **Streaming** — sending the response token by token as it's generated, instead of waiting for the full response.
- **Tool use** — giving Claude the ability to call functions you define, so it can take actions or look up real data.
