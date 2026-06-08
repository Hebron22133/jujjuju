-- Update levels with correct task_access_amount values
UPDATE public.levels 
SET task_access_amount = CASE 
  WHEN id = 1 THEN 4000
  WHEN id = 2 THEN 10000
  WHEN id = 3 THEN 50000
  WHEN id = 4 THEN 100000
  WHEN id = 5 THEN 200000
  ELSE task_access_amount
END
WHERE id IN (1, 2, 3, 4, 5);
