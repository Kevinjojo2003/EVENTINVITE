-- Already applied directly to the live database while diagnosing 0006. Recorded here so a
-- fresh setup (or another environment) ends up with the same fix.
--
-- After 0006, INSERT itself worked, but INSERT ... RETURNING (what every Supabase client
-- does by default) still failed with the RLS error. RETURNING re-checks the new row against
-- the SELECT policy, and "invites select" used can_manage_invite(id) — a SECURITY DEFINER
-- function that re-queries the table by id. Confirmed by direct testing: that subquery does
-- not reliably see a row inserted earlier in the *same* statement, even though it resolves
-- correctly a moment later in a separate statement. A plain column comparison against the
-- row in hand has no such visibility issue, so the owner's own case now short-circuits on
-- that instead; can_manage_invite(id) still covers accepted team members.

drop policy if exists "invites select" on public.invites;
create policy "invites select" on public.invites for select using (owner_id = auth.uid() or public.can_manage_invite(id));
