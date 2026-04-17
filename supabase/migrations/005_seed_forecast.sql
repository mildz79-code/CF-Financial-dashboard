-- Generate 2026 forecast rows for Apr–Dec.
-- Forecast blend per line item per month:
--   = AVERAGE(Q1 monthly average, monthly budget)
--   If no budget row exists for that line item, forecast = Q1 monthly average.
-- Q1 monthly average = (Jan actual + Feb actual + Mar actual) / 3.

insert into public.pl_monthly (line_item_id, year, month, amount, source)
select
  q1.line_item_id,
  2026 as year,
  m.month,
  round(
    case
      when b.monthly_budget is not null and b.monthly_budget <> 0
        then (q1.q1_avg + b.monthly_budget) / 2.0
      else q1.q1_avg
    end,
    2
  ) as amount,
  'forecast' as source
from (
  select
    line_item_id,
    sum(case when month = 1 then amount else 0 end
      + case when month = 2 then amount else 0 end
      + case when month = 3 then amount else 0 end) / 3.0 as q1_avg
  from public.pl_monthly
  where year = 2026 and source = 'actual' and month in (1, 2, 3)
  group by line_item_id
) q1
cross join (
  select generate_series(4, 12) as month
) m
left join (
  select line_item_id, amount as monthly_budget
  from public.pl_monthly
  where year = 2026 and source = 'budget' and month = 1
) b on b.line_item_id = q1.line_item_id
on conflict (line_item_id, year, month, source)
do update set amount = excluded.amount, updated_at = now();
