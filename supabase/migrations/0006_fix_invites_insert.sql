-- Run once in the Supabase SQL editor, after 0005.
-- Fixes: "new row violates row-level security policy for table invites".
--
-- 0005's "invites owner all" policy was FOR ALL with USING (can_manage_invite(id)) and
-- WITH CHECK (owner_id = auth.uid()). can_manage_invite(id) looks up the invites row by
-- that id — but on INSERT the row doesn't exist yet, so the lookup always fails, and that
-- rejects every insert regardless of WITH CHECK. Splitting into one policy per command
-- avoids the self-reference: INSERT no longer depends on a row that doesn't exist yet, and
-- UPDATE's check now correctly allows an accepted team member (not just the literal owner)
-- to save edits, since owner_id never changes on an ordinary edit.

drop policy if exists "invites owner all" on public.invites;

drop policy if exists "invites select" on public.invites;
create policy "invites select" on public.invites for select using (public.can_manage_invite(id));

drop policy if exists "invites insert" on public.invites;
create policy "invites insert" on public.invites for insert with check (owner_id = auth.uid());

drop policy if exists "invites update" on public.invites;
create policy "invites update" on public.invites for update using (public.can_manage_invite(id)) with check (public.can_manage_invite(id));

-- Deleting the whole event stays owner-only, same as inviting/removing team members.
drop policy if exists "invites delete" on public.invites;
create policy "invites delete" on public.invites for delete using (owner_id = auth.uid());
