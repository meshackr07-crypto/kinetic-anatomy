# AGENTS.md

Instructions for any AI coding agent (Claude Code, Codex, Cursor) working in this repo.
Read this file first. Then read `TASKBOARD.md` and pick the next unchecked task.

## Project

Working name: **Kinetic Anatomy**. A web platform that teaches human anatomy and
physiology through martial arts stances. Users rotate a 3D body in a stance, see
which muscles work, which joints load, and read the physiology behind it.

Owner: Jason. He is a complete beginner in coding and directs the agent. Explain
what you did in plain language after every task. Never assume he knows a term.

## Stack (do not swap without asking)

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS + shadcn/ui
- 3D: Three.js through React Three Fiber (`@react-three/fiber`) and `@react-three/drei`
- Auth, database, file storage: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Validation: Zod. State: Zustand (3D viewer state only)
- Tests: Vitest (logic), Playwright (key user flows)
- Hosting: Vercel. Package manager: npm.

Details: `docs/TECH_STACK.md`.

## Working rules

1. One task at a time from `TASKBOARD.md`. Do not start the next one until the
   current one passes its "Done when" check.
2. Before writing code for a library, check its current docs. Versions change.
   Do not write from memory for Next.js, Supabase, or React Three Fiber.
3. Small commits. One task, one commit. Message format: `T-012: add stance list page`.
4. Never commit secrets. Keys live in `.env.local` (git-ignored). Add every new
   variable to `.env.example` with a fake value.
5. Never put the Supabase service role key in browser code or any `NEXT_PUBLIC_` variable.
6. Every database table gets Row Level Security (RLS) on. No exceptions.
7. Validate all input on the server with Zod, even if the form already checks it.
8. TypeScript: no `any`. If a type is hard, stop and ask.
9. 3D code stays inside `src/components/viewer/` and `src/lib/pose/`. Pages import
   the viewer as one component. Load it with `dynamic(..., { ssr: false })`.
10. Run `npm run lint`, `npm run typecheck`, `npm test` before saying a task is done.
11. When a task is finished, tick its box in `TASKBOARD.md` and add one line to the log at the bottom.

## Content rules (anatomy accuracy)

- This is education, not medical advice. Every stance and muscle page shows the
  disclaimer from `docs/CONTENT_GUIDE.md`.
- Do not invent anatomy facts. Use the seed data in `docs/CONTENT_GUIDE.md`. Anything
  new is marked `review_status = 'draft'` until a qualified person approves it.
- Use standard anatomical names (Latin/English) with a plain-language alias.

## Folder map

```
src/app/                 routes (pages, layouts, route handlers)
src/components/ui/       shadcn/ui components
src/components/viewer/   3D viewer (R3F)
src/lib/supabase/        browser, server, and proxy clients
src/lib/pose/            pose data types, interpolation, muscle highlighting
src/lib/validation/      Zod schemas
supabase/migrations/     SQL migrations, numbered in order
public/models/           .glb files
docs/                    project documents
```

## Definition of done

- Works on desktop and a mid-range phone.
- No console errors. No secrets in the repo.
- Lint, typecheck, and tests pass.
- Plain-language summary given to Jason, with what he should click to see it work.

## When to stop and ask Jason

- A choice changes cost, security, or the stack.
- A 3D model, image, or text has unclear licensing.
- A task needs an account or key he has not made yet.
