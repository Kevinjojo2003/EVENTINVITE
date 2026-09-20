-- Run once in the Supabase SQL editor, after 0001_init.sql.
-- Multi-event invitations: each guest can be invited to only some ceremonies, and a
-- reply carries a separate answer and headcount (adults / children / infants) per event.

alter table public.guests add column if not exists events text[] not null default '{}';
-- guests.events: keys of the schedule items this guest is invited to. Empty means all of them.

alter table public.rsvps add column if not exists responses jsonb not null default '{}'::jsonb;
-- rsvps.responses: { "<event key>": { "attending": true, "adults": 2, "children": 1, "infants": 0 } }
