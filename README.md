# Looped

> A real-time, AI-powered B2B team messaging SaaS — think Slack, re-imagined with modern edge infrastructure and built-in AI.

Looped is a multi-tenant team chat platform where organizations can create workspaces, invite teammates, chat across channels and direct messages in real-time, and use AI to summarize conversations or compose better messages. It is built on Next.js 15 with the App Router, powered by Cloudflare Durable Objects for real-time fan-out, protected by Arcjet, and monetized through Stripe subscriptions.

---

## Features

- **Next.js 15** - App Router, Server Components, Server Actions, and Route Handlers
- **Tailwind CSS & Shadcn UI** - accessible, themeable, fully typed component system
- **Authentication with Kinde** - OAuth (Google, GitHub, etc.) & passwordless Magic Links
- **Arcjet Security** - protection against XSS, SQL injection, bot abuse, and common attacks
- **Organizations** - multi-tenant workspaces with roles, invites, and isolated data
- **Billing with Monthly Tiers** - Stripe Checkout, Customer Portal, and webhook-driven entitlements
- **Rate Limiting** - per-user and per-IP throttling via Arcjet
- **Bot Detection** - block automated traffic at the edge
- **Channels & Direct Messages** - public/private channels, 1:1 and group DMs
- **Real-time Everything** - presence, typing indicators, messages, reactions, and read receipts, all powered by **Cloudflare Durable Objects**
- **Emoji Reactions** - react to any message, live-synced across clients
- **Threads** - keep side-conversations organized
- **AI Thread Summarization** - one-click summaries of long threads
- **AI Composer** - rewrite, fix grammar, or improve tone with a single click
- **File Uploads** - attachments stored in Cloudflare R2
- **Notifications & Unread Counts** - accurate across devices
- **Dark / Light Mode** - system-aware theming
- **Fully Responsive** - desktop, tablet, and mobile

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router, React Server Components)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**
- **Shadcn UI** + **Radix UI** primitives
- **Lucide Icons**
- **TanStack Query** - client-side data caching
- **oRPC** - end-to-end type-safe client/server contracts
- **React Hook Form** + **Zod** - forms & validation

### Backend
- **Next.js Route Handlers & Server Actions**
- **oRPC** - typed procedures
- **Prisma ORM** - type-safe database access
- **PostgreSQL** (Neon serverless recommended)
- **Kinde Auth** - OAuth & Magic Links
- **Arcjet** - security, rate limiting, bot detection

### Real-time & Edge
- **Cloudflare Workers**
- **Cloudflare Durable Objects** - stateful, real-time per-channel coordination
- **Cloudflare R2** - S3-compatible object storage for file uploads

### AI
- **AI SDK** (Vercel AI SDK) — streamed completions
- Thread summarization & message composer powered by an LLM provider (OpenAI / Anthropic / etc.)

### Payments
- **Stripe** - Checkout, Billing Portal, and webhooks

### Tooling
- **pnpm** workspaces
- **ESLint** + **Prettier**
- **TypeScript** strict mode

---

<p align="center">
  — Built by <strong>Kevin George</strong> —
</p>
