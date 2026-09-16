# WLKR University

Professional development for educators using the WLKR Learning System —
courses, lessons, quizzes, certificates, articles, and media, built as a
Next.js app on the Walkr platform.

See `CLAUDE.md` for architecture and conventions.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at walkr-ecko-server
npm run dev                        # http://localhost:3200
```

Seed launch content (2 courses, 3 articles) from `wlkr-ecko-server`:

```bash
cd ../wlkr-ecko-server && npm run seed:university
```
