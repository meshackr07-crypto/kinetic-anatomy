# Product Requirements

## One sentence
A website where a person sees a 3D body hold a martial arts stance and learns which muscles, joints, and body systems make that stance work.

## Who it is for
- Martial arts students who want to understand why a stance feels the way it does.
- Instructors who want a visual teaching aid.
- Anatomy and sports science students who want real-movement context.

## Core features (version 1)
1. Browse martial arts styles and their stances.
2. View any stance on a rotatable 3D body.
3. See muscles highlighted by role: primary, stabilizer, stretched.
4. Read physiology notes: balance, energy use, breathing, common injuries and prevention.
5. Sign up and log in. Save bookmarks and mark stances as studied.
6. Admin area to add and publish content.

## Not in version 1
Video, motion capture, AI coaching, live classes, payments, native mobile apps.

## Success measures
- Stance page loads and is usable in under 4 seconds on a mid-range phone.
- A new visitor reaches a rotating stance within 3 clicks.
- Every published stance has reviewed anatomy content.

## Risks
| Risk | Response |
|---|---|
| 3D anatomy model is expensive or badly licensed | Decide D-1 early. Record licenses in `docs/CONTENT_GUIDE.md`. |
| Wrong anatomy damages trust | Reviewer signs off before publish (D-2). |
| Heavy 3D is slow on phones | Compress models, lazy load, cap pixel ratio (T-034). |
| Injury liability | Clear disclaimer on every page. Education only. |
