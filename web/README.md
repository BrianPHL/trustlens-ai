# TrustLens AI — Web

A lightweight Next.js web frontend for TrustLens AI. This project provides a UI to analyze images and text for scam or misinformation risk, with optional mobile packaging via Capacitor.

## Key Features

- Image and text analysis (OCR + heuristics)
- Integration with Supabase for backend and storage
- Mobile-ready using Capacitor
- Built with Next.js, React, and TypeScript

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Capacitor
- Tesseract.js (OCR)

## Quick Start

1. Install dependencies:

```
pnpm install
```

2. Run the dev server:

```
pnpm dev
```

3. Build for production:

```
pnpm build
```

4. Mobile (Capacitor) helpers:

```
pnpm mobile:build
pnpm cap:sync
pnpm cap:add:ios
pnpm cap:add:android
```

## Environment

Configure any required environment variables (for example, Supabase credentials) before running the app. See `supabase_schema.sql` for database schema hints.

## Project Structure

- `app/` — Next.js app routes and pages
- `components/` — UI components
- `lib/` — app logic and helpers (OCR, analyzers, Supabase helpers)
- `public/` — static assets
- `styles/` — global styles and Tailwind setup

## Contributing

Contributions welcome — open issues or PRs to propose changes.

---

Simple README created by the project maintainer's assistant.
