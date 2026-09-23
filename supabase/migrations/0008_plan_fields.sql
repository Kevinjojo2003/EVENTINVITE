-- Run once in the Supabase SQL editor, after 0007.
-- Adds the fields the Plan (Checklist/Timeline) screens need: who a task is for, how urgent it
-- is, and a free-text note per event for the shared "Notes" tab.

alter table public.tasks add column if not exists assignee text;
alter table public.tasks add column if not exists priority text not null default 'medium' check (priority in ('low','medium','high'));

alter table public.timeline_items add column if not exists location text;
alter table public.timeline_items add column if not exists assignee text;
alter table public.timeline_items add column if not exists vendor text;
alter table public.timeline_items add column if not exists show_on_website boolean not null default false;

create table if not exists public.event_notes (
  invite_id uuid primary key references public.invites(id) on delete cascade,
  body text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.event_notes enable row level security;
drop policy if exists "notes manage" on public.event_notes;
create policy "notes manage" on public.event_notes for all using (public.can_manage_invite(invite_id)) with check (public.can_manage_invite(invite_id));
