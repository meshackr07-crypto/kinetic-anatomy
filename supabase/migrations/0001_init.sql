-- Kinetic Anatomy: initial schema. Run in order. RLS is ON for every table.

create type public.app_role as enum ('member', 'admin');
create type public.review_status as enum ('draft', 'approved');
create type public.muscle_role as enum ('primary', 'stabilizer', 'stretched');

-- Users' profile rows (one per auth user)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table public.styles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  origin text,
  summary text,
  status public.review_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.stances (
  id uuid primary key default gen_random_uuid(),
  style_id uuid not null references public.styles(id) on delete cascade,
  slug text unique not null,
  name text not null,
  native_name text,
  description text,
  physiology jsonb not null default '{}'::jsonb, -- balance, breathing, energy, injuries, prevention
  pose jsonb not null default '{}'::jsonb,       -- bone rotations, see docs/3D_GUIDE.md
  status public.review_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.muscles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  common_name text,
  region text not null,
  action text,
  origin_attachment text,
  insertion_attachment text,
  mesh_name text,          -- name of the mesh inside the .glb file
  status public.review_status not null default 'draft'
);

create table public.joints (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  joint_type text,
  bone_name text,          -- bone name in the .glb skeleton
  status public.review_status not null default 'draft'
);

create table public.stance_muscles (
  stance_id uuid references public.stances(id) on delete cascade,
  muscle_id uuid references public.muscles(id) on delete cascade,
  role public.muscle_role not null,
  note text,
  primary key (stance_id, muscle_id, role)
);

create table public.stance_joints (
  stance_id uuid references public.stances(id) on delete cascade,
  joint_id uuid references public.joints(id) on delete cascade,
  angle_degrees numeric,
  note text,
  primary key (stance_id, joint_id)
);

create table public.bookmarks (
  user_id uuid references auth.users(id) on delete cascade,
  stance_id uuid references public.stances(id) on delete cascade,
  studied boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, stance_id)
);

-- Turn on RLS everywhere
alter table public.profiles enable row level security;
alter table public.styles enable row level security;
alter table public.stances enable row level security;
alter table public.muscles enable row level security;
alter table public.joints enable row level security;
alter table public.stance_muscles enable row level security;
alter table public.stance_joints enable row level security;
alter table public.bookmarks enable row level security;

-- Profiles: read and edit your own row. Role cannot be changed by the user.
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "edit own profile" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Content: everyone reads approved rows. Admins do everything.
create policy "public read styles" on public.styles for select using (status = 'approved' or public.is_admin());
create policy "admin write styles" on public.styles for all using (public.is_admin()) with check (public.is_admin());

create policy "public read stances" on public.stances for select using (status = 'approved' or public.is_admin());
create policy "admin write stances" on public.stances for all using (public.is_admin()) with check (public.is_admin());

create policy "public read muscles" on public.muscles for select using (status = 'approved' or public.is_admin());
create policy "admin write muscles" on public.muscles for all using (public.is_admin()) with check (public.is_admin());

create policy "public read joints" on public.joints for select using (status = 'approved' or public.is_admin());
create policy "admin write joints" on public.joints for all using (public.is_admin()) with check (public.is_admin());

create policy "public read stance_muscles" on public.stance_muscles for select using (true);
create policy "admin write stance_muscles" on public.stance_muscles for all using (public.is_admin()) with check (public.is_admin());

create policy "public read stance_joints" on public.stance_joints for select using (true);
create policy "admin write stance_joints" on public.stance_joints for all using (public.is_admin()) with check (public.is_admin());

-- Bookmarks: private to each user
create policy "own bookmarks" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
