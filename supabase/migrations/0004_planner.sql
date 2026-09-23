-- Run once in the Supabase SQL editor, after 0001-0003.
-- Turns the dashboard from an invitation editor into an event planner: a checklist, a
-- budget, and a few more columns per guest (meal, hotel, transport, group).

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  title text not null,
  category text not null default 'General',
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists tasks_invite_idx on public.tasks(invite_id);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  category text not null default 'Miscellaneous',
  vendor text not null default '',
  quoted numeric(12,2) not null default 0,
  paid numeric(12,2) not null default 0,
  due_date date,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists expenses_invite_idx on public.expenses(invite_id);

alter table public.guests add column if not exists group_name text;
alter table public.guests add column if not exists meal text; -- "veg" | "non-veg" | "vegan" | "jain" | ""
alter table public.guests add column if not exists hotel text; -- which hotel/room, free text
alter table public.guests add column if not exists transport text; -- pickup/drop note

alter table public.tasks enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "tasks owner all" on public.tasks;
create policy "tasks owner all" on public.tasks for all
  using (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()))
  with check (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()));

drop policy if exists "expenses owner all" on public.expenses;
create policy "expenses owner all" on public.expenses for all
  using (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()))
  with check (exists (select 1 from public.invites i where i.id = invite_id and i.owner_id = auth.uid()));
