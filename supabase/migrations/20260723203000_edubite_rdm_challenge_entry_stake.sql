-- Monthly Challenge entry stake (RDM deducted on enroll).
insert into public.edubite_rdm_rewards (
  reward_key,
  category,
  label,
  description,
  amount,
  unit,
  sort_order
)
values (
  'challenge.entry_stake',
  'Challenge',
  'Monthly Challenge entry stake',
  'RDM deducted from the learner’s balance when they enroll in the Monthly Challenge.',
  3000,
  'rdm',
  51
)
on conflict (reward_key) do update
set
  category = excluded.category,
  label = excluded.label,
  description = excluded.description,
  amount = excluded.amount,
  unit = excluded.unit,
  sort_order = excluded.sort_order;
