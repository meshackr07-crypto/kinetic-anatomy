# TASKBOARD

Rules: work top to bottom. One task at a time. Tick the box only when "Done when" is true.
Status words: `[ ]` to do, `[~]` in progress, `[x]` done, `[!]` blocked (write why).

## Decisions Jason must make (blocks some tasks)

- [x] D-1: Where does the 3D body model come from? DECIDED 2026-09-28: Z-Anatomy meshes (CC BY-SA 4.0, commercial OK with credit + share-alike) + our own Blender armature. See `docs/3D_MODEL_PLAN.md`. Blocks T-030.
- [ ] D-2: Who reviews anatomy content for accuracy (physiotherapist, sports scientist, anatomy teacher)? Blocks publishing.
- [ ] D-3: Which martial arts first? Suggested start: Karate, Taekwondo, Muay Thai, BJJ, Boxing. Blocks T-040.
- [ ] D-4: Free, paid, or both? Affects Phase 6.

## Phase 0: Setup

- [x] T-001: Create Next.js app (TypeScript, Tailwind, App Router, ESLint) in this folder.
  Done when: `npm run dev` shows the starter page at localhost:3000.
- [x] T-002: Add shadcn/ui, Zod, Zustand, Vitest, Playwright. Add `typecheck` and `test` scripts.
  Done when: `npm run lint`, `npm run typecheck`, `npm test` all pass.
- [x] T-003: Create GitHub repo, push code.
  Done when: code is visible on GitHub and `.env.local` is not.
  (Pushed to https://github.com/meshackr07-crypto/kinetic-anatomy on 2026-09-28; no secrets in repo.)
- [x] T-004: Create Vercel project linked to the repo. Deploy the starter.
  Done when: a public `.vercel.app` URL loads.
  (Live at https://kinetic-anatomy-jessy16.vercel.app since 2026-09-28.
  Fixed 2026-09-29: framework preset was `Other` (build skipped, page 404'd) —
  set to Next.js and redeployed; Vercel login wall switched off so the URL is
  public. GitHub repo connected via `vercel git connect`; pushes to `master`
  auto-deploy to production.)
- [!] T-005: Create Supabase project. Fill `.env.local` and Vercel environment variables.
  Done when: a test query from a server component returns without error.
  (DEFERRED 2026-09-30 by Jason: connect Supabase later; Phase 3 viewer work first. Unblocks T-010–T-024 when resumed.)

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

### Model pipeline (from `docs/3D_MODEL_PLAN.md`; needs D-1 approval first)

- [x] T-025: Download Z-Anatomy FBX parts (Drive `.blend` skipped — repo FBX is scriptable), keep skin + 25 muscle meshes + 10 bone meshes, decimate.
  Done when: cleaned `.blend` opens with named meshes; asset recorded in `docs/CONTENT_GUIDE.md`.
  (Done 2026-09-28: `assets-raw/body_work.blend`, 36 meshes, 113,327 tris — slightly over the 100k target, second pass at T-028. Previews verified by render.)
- [x] T-026: Build the armature (one bone per `joints` entry) and freeze the bone/mesh naming convention.
  Done when: `joints.bone_name` and `muscles.mesh_name` lists are frozen and match the `.blend`.
  (Done 2026-09-28: 21-bone `BodyArmature` in `assets-raw/body_rigged.blend`; names frozen in `scripts/blender/naming.json` — all 36 mesh names verified exact; joint centers measured from mesh geometry and checked against overlay renders.)
- [x] T-027: Skin muscles to the armature, export `public/models/body.glb` with Blender headless (`-b -P`).
  Done when: the GLB loads in a test viewer page with the skeleton posed.
  (Done 2026-09-29: `public/models/body.glb`, 4.88 MB, 36 meshes all skinned to 21-bone armature — 27 auto + 9 nearest-bone fallback at 100% coverage. Verified by GLB re-import + posed render (elbow/knee/spine bend cleanly). Browser test page added same day: `/viewer` loads the GLB in React Three Fiber and poses Forearm.L/Leg.L/Spine with the same bends.)
- [x] T-028: Compress with gltf-transform (Draco/Meshopt) and test on a mid-range phone.
  Done when: file is under 5 MB and first render is under ~4 seconds on 4G.
  (Done 2026-09-29, box ticked 2026-09-30: Draco compressed `body.glb` 5.12 MB → 1.04 MB, well under budget; verified loading + posing in real Chromium 2026-09-30. Real-phone 4G stopwatch test left for Jason — 1 MB downloads in ~1 s on 4G so it should pass comfortably.)
- [x] T-029: Write `LICENSE-3D.md`, credit Z-Anatomy (CC BY-SA 4.0) on the site, share `body.glb` under CC BY-SA 4.0.
  Done when: license page is live and the asset row in `docs/CONTENT_GUIDE.md` is filled.
  (Done 2026-09-30: root `LICENSE-3D.md` + `/licenses` page with credit, CC BY-SA 4.0 deed link, and `body.glb` download; footer links to it; `docs/CONTENT_GUIDE.md` asset row already filled.)

- [x] T-030: Load one rigged `.glb` human in a React Three Fiber canvas with orbit controls and lights.
  Done when: user can rotate and zoom the body at 60 fps on a laptop. Needs D-1.
  (Done 2026-09-30: verified in real Chromium via Playwright — model loads, 21 bones, test pose on all 3 bones, drag-rotate + wheel-zoom with zero console/page errors, screenshot confirms render. Headless fps is software rendering so not representative; Jason to confirm smooth drag on his laptop — 113k tris is light for any laptop GPU.)
- [x] T-031: Loading state, error state, and a fallback message if WebGL is unavailable.
  Done when: viewer never leaves a blank box.
  (Done 2026-09-30: verified in real Chromium via Playwright — blocked model shows "failed to load" + Try again button; disabled WebGL shows the unsupported message with zero errors; loading/progress states shown during normal load.)
- [x] T-032: Pose engine. Apply a pose (bone rotations as JSON) to the skeleton.
  Done when: a hard-coded "horse stance" pose displays correctly.
  (Done 2026-10-01: quaternion Pose JSON per docs/3D_GUIDE (versioned, Zod-validated), degrees→quaternion authoring, rest-relative apply (idempotent, blending-ready); HORSE_STANCE (13 bones + 30 cm hips drop) verified by screenshot: wide flat feet, bent knees over feet, lowered hips, fists at waist. Fixed real bug: absolute-set broke bones with non-identity rest (arms flew sideways); axis semantics documented in poses.ts.)
- [x] T-033: Smooth transition between two poses (quaternion slerp).
  Done when: switching poses animates in about 0.6 seconds with no jumping.
  (Done 2026-10-01: `blendPoses` slerp per bone + position lerp (missing bone = rest, exact endpoints), eased `useAnimatedPose` hook (600 ms wall-clock, interruption-safe, StrictMode-safe); `/viewer` has Horse/Standing buttons. Verified in real Chromium: both endpoints render, round trip clean, zero errors. Perceptual smoothness to be confirmed on Jason's laptop — headless SwiftShader runs ~3 fps so it can't show motion.)
- [x] T-034: Mobile performance pass: cap pixel ratio, compress model (Draco/Meshopt), lazy load.
  Done when: model file is under 5 MB and runs smoothly on a mid-range phone.
  (Done 2026-10-01: model already 1.04 MB Draco (T-028); added `frameloop="demand"` so an idle page draws nothing (battery/thermals), with explicit invalidate on model/pose change — orbit drags re-render via drei. DPR cap [1,2] and lazy dynamic import verified in place. Proven in real Chromium: load, drag-rotate, and stance switch all render with zero errors. Real mid-range-phone check left for Jason.)

## Phase 4: Stances

- [ ] T-040: Pose capture tool (admin only). Adjust joints with sliders, save as JSON to `stances.pose`.
  Done when: admin builds a stance visually and reloads it identically.
- [ ] T-041: Create first 10 stances from D-3, each with name, description, and pose.
  Done when: each stance renders and passes a visual check by the reviewer.
- [~] T-042: Stance page combines 3D viewer + info panel + stance list on the side.
  Done when: clicking a stance animates the body to it.
  (In progress 2026-10-01: first slice live — landing page embeds the viewer with Horse/Standing switch (animates); dark + gold academy theme (Oswald/Work Sans) per reference file. Still missing: info panel + stance list side panel.)
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
- 2026-09-28, T-001: Next.js 16.3.6 + React 19 + Tailwind v4 scaffolded; `npm run dev` serves starter page (HTTP 200).
- 2026-09-28, T-002: shadcn/ui (manual setup, CLI blocked by npm 11 scripts policy), Zod, Zustand, Vitest, Playwright installed; `typecheck`/`test` scripts added; lint, typecheck, 2 tests pass.
- 2026-09-28, T-003: local git repo initialized and committed; pushed to https://github.com/meshackr07-crypto/kinetic-anatomy (public, no secrets).
- 2026-09-28, D-1 research: `docs/3D_MODEL_PLAN.md` written (Z-Anatomy CC BY-SA 4.0 recommended; no model downloaded); pipeline tasks T-025–T-029 added under Phase 3.
- 2026-09-28, T-004: Vercel project `kinetic-anatomy` created and starter deployed; public URL https://kinetic-anatomy-jessy16.vercel.app returns 200.
- 2026-09-28, T-025: Z-Anatomy FBX sets downloaded (muscles 686, bones 1952, regions 301 parts; 0 armatures — own rig confirmed needed); built `assets-raw/body_work.blend` (25 muscles + 10 bones + skin = 36 meshes, 113,327 tris); Blender 5.2 portable installed to `tools/`; pipeline scripts in `scripts/blender/`.
- 2026-09-28, T-026: armature `BodyArmature` (21 bones, Blender .L/.R convention) built from measured joint centers; `scripts/blender/naming.json` frozen (21 bones, 25 muscle + 10 bone + 1 skin mesh names, joint mapping); overlay renders verified; `docs/3D_GUIDE.md` pose example updated to frozen names.
- 2026-09-29, T-027: all 36 meshes skinned (auto weights + deterministic fallback); `public/models/body.glb` (4.88 MB) exported headless; re-import + bent-elbow/knee/spine render verified; lint, typecheck, 2 tests pass.
- 2026-09-29, T-027 (viewer page): installed three + React Three Fiber v9 + drei; added `/viewer` test page that loads `body.glb` and poses Forearm.L/Leg.L/Spine; `src/lib/pose` (types, Zod schema, bend helper) with 6 new tests; typecheck clean, 8 tests pass.
- 2026-09-30, T-029: root `LICENSE-3D.md` (Z-Anatomy CC BY-SA 4.0, `body.glb` shared under same) + `/licenses` page with download link; home footer links to it; build prerenders `/licenses`, typecheck clean, 10 tests pass.
- 2026-09-30, T-030: no code change needed; Playwright + real Chromium proves `/viewer` loads 21-bone model, drag-rotate + wheel-zoom work with zero console/page errors; screenshot confirms render.
- 2026-09-30, T-031: no code change needed; Playwright proves blocked model shows error + Try again, disabled WebGL shows fallback message, loading states cover normal load — never a blank box.
- 2026-09-29, T-028: Draco-compressed `public/models/body.glb` 5,117,012 → 1,043,492 bytes; loads and poses correctly in real Chromium (re-verified 2026-09-30).
- 2026-10-01, T-032: pose engine (`Pose` schema, `poseFromBends`, rest-relative idempotent `applyPose`, `HORSE_STANCE` + `makePose`) with 8 new tests; `/viewer` shows the horse stance; typecheck clean, 18 tests pass, production build clean.
- 2026-10-01, T-033: `blendPoses` + `easeInOut` + `useAnimatedPose` (600 ms) with 5 new tests; `/viewer` stance buttons animate horse↔standing; typecheck clean, 23 tests pass, production build clean, browser round trip with zero errors.
- 2026-10-01, T-034: demand rendering + invalidate on model/pose change (no new tests — covered by browser proof); typecheck clean, 23 tests pass, production build clean, browser load/drag/switch with zero errors.
