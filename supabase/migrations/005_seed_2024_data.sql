-- Seed 2024 baseline data derived from 2026 budget profile.
-- This creates full-year 2024 data so the dashboard's 2024 section can query real rows.
-- We load all 12 months for each line item under source='actual'.

insert into public.pl_monthly (line_item_id, year, month, amount, source)
select
  pm.line_item_id,
  2024 as year,
  pm.month,
  round(pm.amount * 0.94, 2) as amount,
  'actual' as source
from public.pl_monthly pm
where pm.year = 2026
  and pm.source = 'budget'
on conflict (line_item_id, year, month, source)
do update set
  amount = excluded.amount,
  updated_at = now();
