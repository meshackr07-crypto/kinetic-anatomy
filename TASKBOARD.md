# TASKBOARD

Rules: work top to bottom. One task at a time. Tick the box only when "Done when" is true.
Status words: `[ ]` to do, `[~]` in progress, `[x]` done, `[!]` blocked (write why).

## Decisions Jason must make (blocks some tasks)

- [ ] D-1: Where does the 3D body model come from? Options: buy a licensed anatomy model, commission one, or start with a free rigged human and add muscle meshes later. Blocks T-030.
- [ ] D-2: Who reviews anatomy content for accuracy (physiotherapist, sports scientist, anatomy teacher)? Blocks publishing.
- [ ] D-3: Which martial arts first? Suggested start: Karate, Taekwondo, Muay Thai, BJJ, Boxing. Blocks T-040.
- [ ] D-4: Free, paid, or both? Affects Phase 6.

## Phase 0: Setup

- [ ] T-001: Create Next.js app (TypeScript, Tailwind, App Router, ESLint) in this folder.
  Done when: `npm run dev` shows the starter page at localhost:3000.
- [ ] T-002: Add shadcn/ui, Zod, Zustand, Vitest, Playwright. Add `typecheck` and `test` scripts.
  Done when: `npm run lint`, `npm run typecheck`, `npm test` all pass.
- [ ] T-003: Create GitHub repo, push code.
  Done when: code is visible on GitHub and `.env.local` is not.
- [ ] T-004: Create Vercel project linked to the repo. Deploy the starter.
  Done when: a public `.vercel.app` URL loads.
- [ ] T-005: Create Supabase project. Fill `.env.local` and Vercel environment variables.
  Done when: a test query from a server component returns without error.

## Phase 1: Authentication

- [ ] T-010: Supabase clients: browser, server, and the request proxy that refreshes sessions.
  Done when: session cookies refresh on page load.
- [ ] T-011: Sign up, log in, log out (email + password). Add Google login if Jason wants it.
  Done when: a new user can register, confirm email, log in, log out.
- [ ] T-012: Password reset flow.
  Done when: reset email arrives and the new password works.
- [ ] T-013: `profiles` table with trigger that creates a row on sign-up. Roles: `member`, `admin`.
  Done when: new user gets a profile row automatically.
- [ ] T-014: Protect routes. `/account` and `/admin` require login; `/admin` requires admin role.
  Done when: logged-out visit to `/account` redirects to login. Member cannot open `/admin`.
- [ ] T-015: Set Supabase Auth redirect URLs for localhost and the Vercel domain.
  Done when: login works on the live site.

## Phase 2: Database and content

- [ ] T-020: Migration for tables in `docs/DATABASE.md` with RLS policies.
  Done when: anonymous user reads only `published` rows; cannot write anything.
- [ ] T-021: Seed script with the starter muscles and joints from `docs/CONTENT_GUIDE.md`.
  Done when: seed runs twice without duplicating rows.
- [ ] T-022: Generate TypeScript types from the database.
  Done when: queries are typed with no `any`.
- [ ] T-023: Public pages: styles list, style detail, stance detail (text only, no 3D yet).
  Done when: pages load real data from Supabase on the Vercel URL.
- [ ] T-024: Admin CRUD for styles, stances, muscles (draft/published toggle).
  Done when: admin creates a stance and it appears only after publishing.

## Phase 3: 3D viewer

- [ ] T-030: Load one rigged `.glb` human in a React Three Fiber canvas with orbit controls and lights.
  Done when: user can rotate and zoom the body at 60 fps on a laptop. Needs D-1.
- [ ] T-031: Loading state, error state, and a fallback message if WebGL is unavailable.
  Done when: viewer never leaves a blank box.
- [ ] T-032: Pose engine. Apply a pose (bone rotations as JSON) to the skeleton.
  Done when: a hard-coded "horse stance" pose displays correctly.
- [ ] T-033: Smooth transition between two poses (quaternion slerp).
  Done when: switching poses animates in about 0.6 seconds with no jumping.
- [ ] T-034: Mobile performance pass: cap pixel ratio, compress model (Draco/Meshopt), lazy load.
  Done when: model file is under 5 MB and runs smoothly on a mid-range phone.

## Phase 4: Stances

- [ ] T-040: Pose capture tool (admin only). Adjust joints with sliders, save as JSON to `stances.pose`.
  Done when: admin builds a stance visually and reloads it identically.
- [ ] T-041: Create first 10 stances from D-3, each with name, description, and pose.
  Done when: each stance renders and passes a visual check by the reviewer.
- [ ] T-042: Stance page combines 3D viewer + info panel + stance list on the side.
  Done when: clicking a stance animates the body to it.
- [ ] T-043: Stance-to-stance transitions (e.g. guard to front kick chamber) as a short animation sequence.
  Done when: a sequence plays, pauses, and scrubs.

## Phase 5: Anatomy layer

- [ ] T-050: Muscle highlighting. Color muscle meshes by role: primary, stabilizer, stretched.
  Done when: selecting a stance highlights the mapped muscles.
- [ ] T-051: Click a muscle to see its name, action, attachments, and how it works in this stance.
  Done when: panel opens with reviewed content.
- [ ] T-052: Joint load indicators (angle, common stress notes).
  Done when: joint markers show angle in degrees for the current pose.
- [ ] T-053: Layer toggles: skin, muscle, skeleton.
  Done when: each layer shows and hides independently.
- [ ] T-054: Physiology section per stance (energy system, balance, breathing, common injuries and prevention).
  Done when: every published stance has all sections marked `approved`.

## Phase 6: Members and launch

- [ ] T-060: Bookmarks and "studied" progress for logged-in users.
  Done when: user's bookmarks persist across devices.
- [ ] T-061: Search and filter (style, body region, muscle).
  Done when: searching "quadriceps" lists related stances.
- [ ] T-062: Disclaimer, privacy policy, terms pages.
  Done when: linked in footer.
- [ ] T-063: SEO basics: titles, descriptions, sitemap, share image.
  Done when: link preview looks right when shared.
- [ ] T-064: Security review using `docs/SECURITY.md` checklist.
  Done when: every item is ticked.
- [ ] T-065: Custom domain on Vercel. Update Supabase redirect URLs.
  Done when: login works on the custom domain.
- [ ] T-066: Playwright tests for sign-up, login, open stance, bookmark.
  Done when: tests pass in CI.

## Log

(agent adds one line per finished task: date, task ID, what changed)
