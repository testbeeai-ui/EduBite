-- Allow content admins to read all game progress (Monthly Challenge streak board).
drop policy if exists edubite_game_state_admin_select on public.edubite_game_state;
create policy edubite_game_state_admin_select
  on public.edubite_game_state
  for select
  to authenticated
  using (public.edubite_is_content_admin());
