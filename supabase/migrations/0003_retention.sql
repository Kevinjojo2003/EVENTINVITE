-- Run once in the Supabase SQL editor, after 0001 and 0002.
-- Guest data is personal: names, phone numbers and replies. Keep it only as long as it is useful.
-- This deletes the guests and replies of any invitation whose event date passed more than 90 days ago.
-- The invitation page itself stays, so the hosts keep their memories; only the personal lists go.

create or replace function public.purge_old_guest_data(retain interval default interval '90 days')
returns integer language plpgsql security definer set search_path = public as $$
declare removed integer := 0; n integer;
begin
  with old as (
    select id from public.invites
    where nullif(config -> 'event' ->> 'dateTime', '') is not null
      and (config -> 'event' ->> 'dateTime')::timestamptz < now() - retain
  )
  delete from public.rsvps where invite_id in (select id from old);
  get diagnostics n = row_count; removed := removed + n;

  with old as (
    select id from public.invites
    where nullif(config -> 'event' ->> 'dateTime', '') is not null
      and (config -> 'event' ->> 'dateTime')::timestamptz < now() - retain
  )
  delete from public.guests where invite_id in (select id from old);
  get diagnostics n = row_count; removed := removed + n;
  return removed;
end $$;

-- Run it every night. In Supabase: Database > Extensions > enable "pg_cron", then:
--   select cron.schedule('purge-old-guest-data', '15 3 * * *', $$ select public.purge_old_guest_data(); $$);
-- To try it once by hand: select public.purge_old_guest_data();
