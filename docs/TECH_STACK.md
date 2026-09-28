# Tech Stack

Each tool has one job. Plain-language reason included.

| Layer | Tool | Job |
|---|---|---|
| Framework | Next.js (App Router) | Builds the pages, handles routing and server code. Made by Vercel, so it deploys there with no setup. |
| Language | TypeScript (strict) | JavaScript with type checks. Catches mistakes before users see them. |
| Styling | Tailwind CSS | Style with short class names instead of separate CSS files. |
| UI parts | shadcn/ui | Ready-made buttons, dialogs, forms. The code is copied into your repo, so you own it. |
| 3D engine | Three.js | Draws 3D in the browser. |
| 3D in React | React Three Fiber + drei | Lets you write Three.js scenes as React components. drei adds orbit controls, model loaders, and helpers. |
| 3D model format | glTF / GLB | The standard web 3D file. Holds mesh, skeleton, and materials in one file. |
| Model compression | gltf-transform (Draco or Meshopt) | Shrinks GLB files 5 to 10 times for fast loading. |
| Auth | Supabase Auth | Sign up, login, password reset, sessions. |
| Database | Supabase Postgres | Stores styles, stances, muscles, users' bookmarks. |
| File storage | Supabase Storage | Stores images and optional model files. |
| Auth in Next.js | `@supabase/ssr` | Keeps login sessions in cookies so server pages know who the user is. |
| Validation | Zod | Checks that incoming data has the right shape. |
| Viewer state | Zustand | Small store for "which stance, which muscle, which layers are on." |
| Unit tests | Vitest | Tests pose math and data logic. |
| Browser tests | Playwright | Clicks through the real site to test flows. |
| Hosting | Vercel | Runs the site. Every push to GitHub becomes a live preview. |
| Code host | GitHub | Stores code, triggers Vercel deploys. |
| Optional later | Vercel Analytics, Sentry | Traffic and error tracking. |

## Version rule
Do not copy version numbers from this file. Run `npm install` for the current stable release and check each library's docs. As of 28 September 2026 the current Next.js line is 16.3, and a security patch (16.3.7) is due on 30 September 2026. Install the latest patch release.

## Accounts Jason needs
GitHub, Vercel, Supabase. All have free tiers to start.

## Install commands (agent runs these)
```
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir
npx shadcn@latest init
npm i three @react-three/fiber @react-three/drei zustand zod
npm i @supabase/supabase-js @supabase/ssr
npm i -D @types/three vitest @playwright/test
```
