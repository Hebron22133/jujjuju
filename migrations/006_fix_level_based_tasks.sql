-- Add level_id column to tasks table for level-based assignment
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS level_id integer references public.levels(id) on delete cascade;

-- Create index on level_id for performance
CREATE INDEX IF NOT EXISTS idx_tasks_level_id ON public.tasks(level_id);

-- Drop old policies that use assigned_to
DROP POLICY IF EXISTS "users can read assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "users can complete assigned tasks" ON public.tasks;

-- Create new policies for level-based access
CREATE POLICY "users can read tasks for their level"
ON public.tasks FOR SELECT
USING (
  level_id = (SELECT level_id FROM public.users WHERE id = auth.uid()) 
  OR public.current_user_is_admin()
);

CREATE POLICY "users can complete tasks at their level"
ON public.tasks FOR UPDATE
USING (
  level_id = (SELECT level_id FROM public.users WHERE id = auth.uid())
  AND status = 'assigned'
)
WITH CHECK (
  level_id = (SELECT level_id FROM public.users WHERE id = auth.uid())
  AND (status = 'completed' OR status = 'assigned')
);

-- Keep admin policies
DROP POLICY IF EXISTS "admins can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "admins can update tasks" ON public.tasks;

CREATE POLICY "admins can insert tasks"
ON public.tasks FOR INSERT
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "admins can update tasks"
ON public.tasks FOR UPDATE
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
