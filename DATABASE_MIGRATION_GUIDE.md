# DATABASE MIGRATION INSTRUCTIONS

**CRITICAL**: These database migrations MUST be applied for the system to work. The code is deployed but the database schema needs to be updated.

## Summary of Changes

This migration adds level-based task assignment system to the database:
- Adds `level_id` column to `tasks` table (FK to `levels.id`)
- Adds `level_id` column to `users` table (FK to `levels.id`)
- Updates RLS policies for level-based task access
- Creates proper indexes for performance

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com and log in
2. Select your project: **ng.p2-vip.space**
3. Go to **SQL Editor** on the left sidebar
4. Click **"New query"**
5. Copy and paste the SQL from **migrations/006_fix_level_based_tasks.sql**
6. Click **"Run"** (or Ctrl+Enter)
7. Verify: No errors should appear
8. Repeat for **migrations/007_add_level_id_to_users.sql**

### Option 2: Using Supabase CLI

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Link your project
supabase link --project-ref <your-project-ref>

# Apply migration 006
supabase migration up migrations/006_fix_level_based_tasks.sql

# Apply migration 007
supabase migration up migrations/007_add_level_id_to_users.sql
```

## Migration Files

### Migration 006: fix_level_based_tasks.sql
**Location**: `/migrations/006_fix_level_based_tasks.sql`

**What it does**:
- Adds `level_id` integer column to `tasks` table (nullable, references `levels.id`)
- Creates index `idx_tasks_level_id` on tasks(level_id)
- Removes old RLS policies that used `assigned_to`
- Creates NEW RLS policies:
  - `users can read tasks for their level`: Users see tasks matching their level
  - `users can complete tasks at their level`: Users can update tasks at their level
  - `admins can insert tasks`: Only admins can create tasks
  - `admins can update tasks`: Only admins can modify tasks

**Expected result after running**:
- `tasks` table has new `level_id` column
- New RLS policies enforce level-based access
- Agents can now see tasks assigned to their level

### Migration 007: add_level_id_to_users.sql
**Location**: `/migrations/007_add_level_id_to_users.sql`

**What it does**:
- Adds `level_id` integer column to `users` table (nullable, references `levels.id`)
- Creates index `idx_users_level_id` on users(level_id)
- Updates all activated users to have `level_id = 1` (if not already set)

**Expected result after running**:
- `users` table tracks each user's current level
- All activated users get level_id = 1 (default)
- Admin activation endpoint can set level_id

## Verification After Migration

### Check that columns were added:

**For tasks table:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='tasks' AND column_name='level_id';
```
Should return: `level_id | integer`

**For users table:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='users' AND column_name='level_id';
```
Should return: `level_id | integer`

### Check RLS policies were created:

```sql
SELECT polname, polcmd 
FROM pg_policies 
WHERE tablename = 'tasks';
```

Should show these policies:
- users can read tasks for their level (SELECT)
- users can complete tasks at their level (UPDATE)
- admins can insert tasks (INSERT)
- admins can update tasks (UPDATE)

## How It Works Now

### Admin Activates Agent

1. Admin clicks "Activate" on agent
2. Admin enters amount agent paid (e.g., 4,000)
3. System determines level based on amount:
   - ₦4,000-₦9,999 → Level 1
   - ₦10,000-₦49,999 → Level 2
   - ₦50,000-₦99,999 → Level 3
   - ₦100,000-₦199,999 → Level 4
   - ₦200,000+ → Level 5
4. User's `level_id` is set to determined level
5. User's balance is set to amount agent paid

### Admin Creates Task for Level

1. Admin goes to Tasks section
2. Creates task with title, amount, etc.
3. Selects level (e.g., Level 2)
4. Task is saved with `level_id = 2`

### Agent Sees Tasks

1. Agent goes to Orders/Tasks page
2. System fetches agent's `level_id` from `users` table
3. Queries `tasks` table WHERE `level_id = agent.level_id`
4. Agent sees all tasks assigned to their level
5. Agent can complete tasks and earn commission

## Important Notes

⚠️ **DO NOT** skip these migrations - the code won't work without them
⚠️ Apply migrations in order: 006, then 007
⚠️ These are additive - they won't delete existing data
⚠️ After applying migrations, the activation endpoint will need custom amounts

## Rollback (if needed)

If something goes wrong, you can remove the migrations:

```sql
-- Remove level_id from tasks
ALTER TABLE public.tasks DROP COLUMN IF EXISTS level_id;
DROP INDEX IF EXISTS idx_tasks_level_id;

-- Remove level_id from users
ALTER TABLE public.users DROP COLUMN IF EXISTS level_id;
DROP INDEX IF EXISTS idx_users_level_id;
```

But this would break the new level-based task system.

## Support

If migrations fail:
1. Check Supabase status page for outages
2. Verify you have admin access to the project
3. Check that `levels` table exists (it should from migration 002)
4. Take a screenshot of the error and share it

Next steps after migration:
1. Test admin activation with custom amount
2. Test agent seeing tasks at their level
3. Verify agents can't see tasks from other levels
