# Architecture

## Flow
```
Browser  ->  Vercel (Next.js pages + server code)  ->  Supabase (Auth, Postgres, Storage)
   |
   +-- 3D viewer (Three.js in the browser, loads .glb file)
```

## Pages
| Route | Access | Purpose |
|---|---|---|
| `/` | public | Landing page |
| `/styles` | public | List of martial arts |
| `/styles/[slug]` | public | Style and its stances |
| `/stances/[slug]` | public | 3D viewer + anatomy panel |
| `/login`, `/signup`, `/reset` | public | Auth |
| `/account` | member | Bookmarks, progress |
| `/admin/*` | admin | Content and pose editor |

## Key rules
- Pages read data on the server. The browser gets finished data.
- The 3D viewer is a client-only component (WebGL needs a browser). Load it with `dynamic` and `ssr: false`.
- The browser never gets the service role key. Only the publishable key.
- Access control lives in the database (RLS), not just in the UI. Hiding a button is not security.

## Pose data flow
1. Admin sets joint angles in the pose tool.
2. Pose saved as JSON in `stances.pose`.
3. Viewer reads the JSON and rotates the skeleton bones.
4. Muscle roles from `stance_muscles` decide which meshes glow.

## Session refresh
Next.js 16 renamed `middleware.ts` to `proxy.ts`. Put Supabase session refresh there. Check the current Supabase and Next.js docs for the exact file shape before writing it.
