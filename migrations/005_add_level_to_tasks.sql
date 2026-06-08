-- Add level_id to tasks table for level-based task assignment
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS level_id integer references public.levels(id) on delete cascade;

-- Add index on level_id for performance
CREATE INDEX IF NOT EXISTS idx_tasks_level_id ON public.tasks(level_id);

-- Update task assignment to be per-level instead of per-agent
-- This allows all agents at a level to see the same tasks

-- Update RLS policies for tasks
DROP POLICY IF EXISTS "users can read assigned tasks" ON public.tasks;

CREATE POLICY "users can read tasks for their level"
ON public.tasks FOR SELECT
USING (
  level_id = (SELECT level_id FROM public.users WHERE id = auth.uid()) 
  OR public.current_user_is_admin()
);

-- Allow admins to create tasks with level assignment
DROP POLICY IF EXISTS "admins can insert tasks" ON public.tasks;

CREATE POLICY "admins can insert tasks"
ON public.tasks FOR INSERT
WITH CHECK (public.current_user_is_admin());

-- Allow admins to update tasks
DROP POLICY IF EXISTS "admins can update tasks" ON public.tasks;

CREATE POLICY "admins can update tasks"
ON public.tasks FOR UPDATE
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Allow users to update (complete) tasks for their level
DROP POLICY IF EXISTS "users can complete assigned tasks" ON public.tasks;

CREATE POLICY "users can complete tasks"
ON public.tasks FOR UPDATE
USING (
  level_id = (SELECT level_id FROM public.users WHERE id = auth.uid()) 
  AND status = 'assigned'
)
WITH CHECK (
  level_id = (SELECT level_id FROM public.users WHERE id = auth.uid()) 
  AND (status = 'completed' OR status = 'assigned')
);
