# Security Checklist

Tick each item during T-064. Explanations are in plain words.

- [ ] RLS is on for every table. (The database refuses bad requests even if the website is bypassed.)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in Vercel server environment variables. Search the code: it must not appear in any file under `src/components/` or in any `NEXT_PUBLIC_` variable.
- [ ] `.env.local` is in `.gitignore`. Run `git log -p | grep -i service_role` and get no result.
- [ ] Auth redirect URLs in Supabase list only your real domains.
- [ ] Email confirmation is on.
- [ ] Password minimum length is set in Supabase Auth settings. Enable leaked-password protection if the plan offers it.
- [ ] Server code checks the user with `supabase.auth.getUser()` (not only the cookie) before private actions.
- [ ] All forms and API inputs pass through Zod on the server.
- [ ] Admin pages check the admin role on the server, and RLS also blocks non-admin writes.
- [ ] No user-supplied HTML is rendered raw. Do not use `dangerouslySetInnerHTML` with user text.
- [ ] Storage buckets: public only for approved images. Admin-only write.
- [ ] Rate limits on login and reset (Supabase Auth has built-in limits; confirm they are on).
- [ ] Dependencies updated. Run `npm audit`. Install the latest Next.js patch, since Next.js now ships monthly security releases.
- [ ] Security headers set in `next.config.ts` (Content-Security-Policy, X-Content-Type-Options, Referrer-Policy).
