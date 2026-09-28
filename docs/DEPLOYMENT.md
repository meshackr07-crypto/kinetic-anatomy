# Deployment (Vercel + Supabase)

## One-time setup
1. Push the repo to GitHub.
2. In Vercel: Add New Project, import the repo. Framework preset detects Next.js.
3. In Vercel project Settings, Environment Variables, add the four variables from `.env.example`. Set `SUPABASE_SERVICE_ROLE_KEY` for server use only.
4. In Supabase: Authentication, URL Configuration. Set Site URL to your Vercel production URL. Add redirect URLs for `http://localhost:3000/**` and your Vercel URL(s).
5. Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
6. Deploy. Open the live URL and test sign-up.

## Every day after
- Push to a branch: Vercel builds a preview URL.
- Merge to `main`: Vercel deploys to production.

## Before launch
- Custom domain in Vercel, then update Supabase Site URL and redirect URLs.
- Run the checklist in `docs/SECURITY.md`.
- Test on a real phone.

## If a deploy breaks
Vercel, Deployments tab, open the last good deployment, Promote to Production. Then fix forward.
