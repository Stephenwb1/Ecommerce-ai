# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js Version Warning

This project uses **Next.js 16.2.1**, which has breaking changes from what you may expect. **Always read the relevant guide in `node_modules/next/dist/docs/` before writing any code.** Heed deprecation notices.

## Commands

All commands run from the `ecommerce-chatbot/` directory:

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet. When adding tests, the plan does not prescribe a framework.

## Project Plan

The full project plan is at `/home/stephenwb/Projects/E-Commerce_AI_support_chatbot/ecommerce-chatbot-plan.md`. It covers the 4-phase feature roadmap and week-by-week build schedule.

## Project Overview

An e-commerce store with an AI-powered customer support chatbot demonstrating **RAG (Retrieval-Augmented Generation)**, **tool use**, and **streaming** — built without LangChain. The RAG pipeline is hand-written so every line is explainable.

## Architecture

**Tech stack:**
- Frontend: Next.js (App Router) + React 19 + Tailwind CSS 4
- Backend: Next.js API routes
- Embeddings: OpenAI `text-embedding-3-small`
- Vector DB: ChromaDB (local dev), Pinecone (production)
- LLM: Claude Sonnet via Anthropic API
- Deployment: Vercel

**RAG pipeline flow:**
1. User message → embed with OpenAI
2. Query vector DB for top 5 similar chunks
3. Build prompt: system prompt + retrieved context + user message
4. Stream response from Claude Sonnet

**Ingestion pipeline** (run once or when data changes):
1. Load files from `/data` (products.json, faq.md, policies.md)
2. Chunk text (~500 tokens, 50 token overlap)
3. Embed each chunk
4. Store in ChromaDB with metadata (source file, chunk index)

**Planned directory structure:**
- `data/` — product catalog (JSON), FAQ, and policy documents
- `scripts/` — `ingest.ts` (embedding/chunking), `eval.ts` (evaluation)
- `app/api/chat/route.ts` — RAG pipeline + Claude API call
- `components/` — ProductGrid, ChatWidget (floating chat), ChatMessage
- `lib/` — chromadb client, embedding helper, tool definitions (order lookup)

## Key Design Decisions

- **No LangChain** — raw API calls to both OpenAI (embeddings) and Anthropic (LLM) for full control and explainability.
- **Tool use for order lookup** — Claude is given a `lookup_order(order_id)` tool definition. When it decides to call the tool, the app queries `orders.json`, returns the result, and Claude incorporates it into its response.
- **Path alias** — `@/*` maps to the project root (configured in tsconfig.json).
- **Streaming** — responses stream token-by-token via Vercel AI SDK or raw ReadableStream.

## Environment Variables

Required in `.env.local` (not committed):
- Anthropic API key for Claude
- OpenAI API key for embeddings
- Vector DB credentials (Pinecone for production)
