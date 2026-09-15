-- Run this once in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------- tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$'),
  event_type text not null check (event_type in ('wedding','engagement','housewarming','birthday','corporate')),
  published boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invites_owner_idx on public.invites(owner_id);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  name text not null,
  phone text,
  token text not null unique default encode(gen_random_bytes(9), 'base64'),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists guests_invite_idx on public.guests(invite_id);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  name text not null,
  email text,
  company text,
  attending boolean not null,
  party_size int not null default 1 check (party_size between 0 and 20),
  events text[] not null default '{}',
  note text,
  ticket_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists rsvps_invite_idx on public.rsvps(invite_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists invites_touch on public.invites;
create trigger invites_touch before update on public.invites for each row execute function public.touch_updated_at();

-- create a profile row on sign-up
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;

drop policy if exists "profiles self" on public.profiles;
create policy "profiles self" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "invites owner all" on public.invites;
create policy "invites owner all" on public.invites for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "invites public read" on public.invites;
create policy "invites public read" on public.invites for select using (published = true);

drop policy if exists "guests owner all" on public.guests;
create policy "guests owner all" on public.guests for all
  using (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()))
  with check (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()));

drop policy if exists "rsvps owner read" on public.rsvps;
create policy "rsvps owner read" on public.rsvps for select
  using (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()));
drop policy if exists "rsvps owner delete" on public.rsvps;
create policy "rsvps owner delete" on public.rsvps for delete
  using (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()));
drop policy if exists "rsvps owner update" on public.rsvps;
create policy "rsvps owner update" on public.rsvps for update
  using (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()));
-- Public RSVP inserts go through /api/rsvp with the service role, which validates the invite is published.

-- ---------- storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('photos', 'photos', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
  ('music',  'music',  true, 20971520, array['audio/mpeg','audio/mp4','audio/aac','audio/ogg','audio/wav','audio/x-m4a'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can read (public buckets). Owners write only inside their own folder: {user_id}/...
drop policy if exists "storage public read" on storage.objects;
create policy "storage public read" on storage.objects for select using (bucket_id in ('photos','music'));

drop policy if exists "storage owner write" on storage.objects;
create policy "storage owner write" on storage.objects for insert
  with check (bucket_id in ('photos','music') and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "storage owner update" on storage.objects;
create policy "storage owner update" on storage.objects for update
  using (bucket_id in ('photos','music') and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "storage owner delete" on storage.objects;
create policy "storage owner delete" on storage.objects for delete
  using (bucket_id in ('photos','music') and auth.uid()::text = (storage.foldername(name))[1]);

-- A shared royalty-free library lives at music/library/*. Upload those from the Supabase
-- dashboard; the app lists that folder for every couple.
