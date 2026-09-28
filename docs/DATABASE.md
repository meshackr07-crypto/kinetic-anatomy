# Database

Full SQL: `supabase/migrations/0001_init.sql`. The agent runs it in the Supabase SQL editor or through the Supabase CLI.

## Tables
| Table | Holds |
|---|---|
| `profiles` | One row per user. Has `role`: `member` or `admin`. Created automatically at sign-up. |
| `styles` | Martial arts (Karate, Muay Thai...). |
| `stances` | Each stance: text, physiology notes (JSON), pose (JSON). |
| `muscles` | Muscle list with action, attachments, and the 3D mesh name. |
| `joints` | Joint list with the 3D bone name. |
| `stance_muscles` | Which muscles work in which stance, and their role. |
| `stance_joints` | Joint angles per stance. |
| `bookmarks` | A user's saved and studied stances. |

## Security in plain words
RLS (Row Level Security) is a rule set inside the database. Even if someone bypasses the website, the database still refuses.
- Visitors read only `approved` content.
- Members read and write only their own bookmarks and profile.
- Admins write content. Promote a user to admin by editing their `profiles.role` in the Supabase dashboard. Never build a public "make me admin" button.

## Rules for changes
- New change = new numbered file: `0002_...sql`. Never edit an applied migration.
- Every new table: enable RLS and add policies in the same migration.
