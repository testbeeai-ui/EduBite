-- Forward-fix environments where the original Brain Gym mastery migration
-- has already been recorded. Preserve persisted counters when stale clients
-- submit a session payload.
DO $migration$
DECLARE
  function_definition text;
BEGIN
  SELECT pg_get_functiondef(p.oid)
  INTO function_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'edubite_private'
    AND p.proname = 'apply_brain_gym_mutation'
    AND pg_get_function_identity_arguments(p.oid) = 'p_progress jsonb, p_mutation jsonb';

  IF function_definition IS NULL THEN
    RAISE EXCEPTION 'Brain Gym mutation function is missing';
  END IF;

  IF position(
    'p_progress - ''games'' - ''totalPlays'' - ''totalWins'''
    IN function_definition
  ) = 0 THEN
    IF position('next_progress := p_progress;' IN function_definition) = 0 THEN
      RAISE EXCEPTION 'Unexpected Brain Gym mutation function body';
    END IF;

    function_definition := replace(
      function_definition,
      'next_progress := p_progress;',
      $replacement$next_progress := current_progress || (
      p_progress - 'games' - 'totalPlays' - 'totalWins'
    );
    next_progress := jsonb_set(
      next_progress,
      '{games}',
      coalesce(current_progress->'games', '{}'::jsonb),
      true
    );$replacement$
    );
    function_definition := replace(
      function_definition,
      'next_game := coalesce(next_progress#>ARRAY[''games'', game_id], current_game);',
      $replacement$next_game := coalesce(next_progress#>ARRAY['games', game_id], current_game);
    next_game := coalesce(p_progress#>ARRAY['games', game_id], next_game);$replacement$
    );

    EXECUTE function_definition;
  END IF;
END
$migration$;
