-- Add level_id column to users table for tracking user's current level
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS level_id integer references public.levels(id) on delete set null;

-- Create index on level_id for performance
CREATE INDEX IF NOT EXISTS idx_users_level_id ON public.users(level_id);

-- Update default level_id to 1 for activated users
UPDATE public.users
SET level_id = 1
WHERE level_id IS NULL AND is_activated = true;
