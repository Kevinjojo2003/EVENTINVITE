-- Run once in the Supabase SQL editor, after 0001-0004.
-- Rounds out the event planner: vendors, a day-of timeline, accommodation and transport
-- logistics, a documents folder, and letting more than one person manage an event.

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  category text not null default 'Miscellaneous',
  name text not null default '',
  contact_name text,
  contact_phone text,
  contact_email text,
  quoted numeric(12,2) not null default 0,
  paid numeric(12,2) not null default 0,
  status text not null default 'Shortlisted' check (status in ('Shortlisted','Contacted','Negotiating','Confirmed','Completed')),
  arrived boolean not null default false, -- for event-day tracking
  note text,
  created_at timestamptz not null default now()
);
create index if not exists vendors_invite_idx on public.vendors(invite_id);

create table if not exists public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  title text not null,
  starts_at timestamptz,
  note text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists timeline_invite_idx on public.timeline_items(invite_id);

create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  hotel_name text not null default '',
  rooms_booked int not null default 0,
  guests_count int not null default 0,
  check_in date,
  check_out date,
  payment_status text not null default 'Pending' check (payment_status in ('Pending','Partial','Paid')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists accommodations_invite_idx on public.accommodations(invite_id);

create table if not exists public.transport_items (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  title text not null default '', -- "Airport pickup", "Venue shuttle"
  mode text not null default 'Vehicle', -- Flight/Train/Vehicle
  details text, -- flight no, vehicle type, driver name/phone
  guests_count int not null default 0,
  time_note text, -- "Arrival 10:40 AM" — free text, not every trip has a fixed timestamp
  created_at timestamptz not null default now()
);
create index if not exists transport_invite_idx on public.transport_items(invite_id);

create table if not exists public.event_documents (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  title text not null,
  category text not null default 'Other',
  file_url text not null,
  file_name text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists documents_invite_idx on public.event_documents(invite_id);

-- Lets more than one person manage an event. Role is informational for now (shown in the
-- UI); anyone accepted gets full read/write on that event, same as the owner.
create table if not exists public.event_team (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  email text not null,
  role text not null default 'planner' check (role in ('planner','family','finance','vendor')),
  accepted_user_id uuid references auth.users(id) on delete cascade,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);
create unique index if not exists event_team_invite_email_idx on public.event_team(invite_id, email);
create index if not exists event_team_user_idx on public.event_team(accepted_user_id);

-- On sign-in, link any pending invitations that match this user's email.
create or replace function public.link_event_team_invites() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.event_team set accepted_user_id = new.id, accepted_at = now()
  where email = new.email and accepted_user_id is null;
  return new;
end $$;
drop trigger if exists on_auth_user_link_team on auth.users;
create trigger on_auth_user_link_team after insert on auth.users for each row execute function public.link_event_team_invites();

-- ---------- access helper ----------
-- True for the event's owner, or anyone who has accepted a team invite to it.
create or replace function public.can_manage_invite(target_invite_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.invites i where i.id = target_invite_id and i.owner_id = auth.uid()
  ) or exists (
    select 1 from public.event_team t where t.invite_id = target_invite_id and t.accepted_user_id = auth.uid()
  )
$$;

-- ---------- row level security ----------
alter table public.vendors enable row level security;
alter table public.timeline_items enable row level security;
alter table public.accommodations enable row level security;
alter table public.transport_items enable row level security;
alter table public.event_documents enable row level security;
alter table public.event_team enable row level security;

drop policy if exists "vendors manage" on public.vendors;
create policy "vendors manage" on public.vendors for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

drop policy if exists "timeline manage" on public.timeline_items;
create policy "timeline manage" on public.timeline_items for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

drop policy if exists "accommodations manage" on public.accommodations;
create policy "accommodations manage" on public.accommodations for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

drop policy if exists "transport manage" on public.transport_items;
create policy "transport manage" on public.transport_items for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

drop policy if exists "documents manage" on public.event_documents;
create policy "documents manage" on public.event_documents for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

drop policy if exists "team owner manage" on public.event_team;
create policy "team owner manage" on public.event_team for all
  using (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()))
  with check (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()));
drop policy if exists "team self read" on public.event_team;
create policy "team self read" on public.event_team for select using (accepted_user_id = auth.uid());

-- Extend existing owner-only policies to include accepted team members too.
drop policy if exists "invites owner all" on public.invites;
create policy "invites owner all" on public.invites for all using (public.can_manage_invite(id)) with check (owner_id = auth.uid());

drop policy if exists "guests owner all" on public.guests;
create policy "guests owner all" on public.guests for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

drop policy if exists "rsvps owner read" on public.rsvps;
create policy "rsvps owner read" on public.rsvps for select using (public.can_manage_invite(invite_id));
drop policy if exists "rsvps owner delete" on public.rsvps;
create policy "rsvps owner delete" on public.rsvps for delete using (public.can_manage_invite(invite_id));
drop policy if exists "rsvps owner update" on public.rsvps;
create policy "rsvps owner update" on public.rsvps for update using (public.can_manage_invite(invite_id));

drop policy if exists "tasks owner all" on public.tasks;
create policy "tasks owner all" on public.tasks for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

drop policy if exists "expenses owner all" on public.expenses;
create policy "expenses owner all" on public.expenses for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));

-- ---------- storage: a private documents bucket ----------
-- Files live at {invite_id}/filename, so a team member (not just the owner) can reach them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 20971520, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "documents owner read" on storage.objects;
create policy "documents owner read" on storage.objects for select
  using (bucket_id = 'documents' and public.can_manage_invite(((storage.foldername(name))[1])::uuid));
drop policy if exists "documents owner write" on storage.objects;
create policy "documents owner write" on storage.objects for insert
  with check (bucket_id = 'documents' and public.can_manage_invite(((storage.foldername(name))[1])::uuid));
drop policy if exists "documents owner delete" on storage.objects;
create policy "documents owner delete" on storage.objects for delete
  using (bucket_id = 'documents' and public.can_manage_invite(((storage.foldername(name))[1])::uuid));
