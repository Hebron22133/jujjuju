# SETUP INSTRUCTIONS - LEVEL-BASED SYSTEM

## CRITICAL: Migrations Must Be Executed First

The system has been deployed to Vercel, but **it will NOT work until you execute the database migrations in Supabase**. Follow these steps:

---

## Step 1: Login to Supabase

1. Go to https://supabase.com
2. Login with your account (hebronjesuloba@gmail.com)
3. Click on your project (ng-p2-vip-space or similar)

---

## Step 2: Navigate to SQL Editor

1. Click **SQL Editor** in the left sidebar
2. You should see a blank SQL editor

---

## Step 3: Run First Migration

1. Copy the entire contents of: `migrations/002_level_based_system.sql` from the GitHub repo
2. Paste it into the Supabase SQL Editor
3. Click **Run** (or press Ctrl+Enter)
4. Wait for success message ✓

**What this does:**
- Creates `levels` table with 5 predefined levels
- Adds columns to `users` table: `level_id`, `main_balance`, `commission_balance`
- Creates `user_progress` table to track level completion
- Creates `daily_completions` table to track daily tasks
- Adds columns to `withdrawals` table

---

## Step 4: Run Second Migration

1. Copy the entire contents of: `migrations/002_level_functions.sql` from the GitHub repo
2. Paste it into a **new** SQL Editor tab (or clear the previous one)
3. Click **Run**
4. Wait for success message ✓

**What this does:**
- Creates 5 Supabase RPC functions that enforce all business logic server-side
- Functions handle user activation, daily task completion, withdrawals, and level upgrades

---

## Step 5: Set Admin User

Run this SQL to make papasupe85@gmail.com an admin:

```sql
UPDATE public.users
SET is_admin = true
WHERE email = 'papasupe85@gmail.com';
```

---

## Step 6: Test the System

### Access Admin Dashboard:
1. Go to https://ng-p2-vip-space.vercel.app/admin/login
2. Login with: 
   - Email: `papasupe85@gmail.com`
   - Password: (the password you set)

### Activate a User:
1. On admin dashboard, go to **Users** page
2. Find a user and click **Activate**
3. Choose a level (1-5)
4. User is now activated!

### Test User Dashboard:
1. Logout from admin
2. Login as a regular user (any user account)
3. Go to https://ng-p2-vip-space.vercel.app
4. Should see dashboard with:
   - Main Balance (task access amount for their level)
   - Commission Balance (0 initially)
   - Level progress
   - Buttons to complete tasks, request withdrawal, upgrade level

---

## SYSTEM OVERVIEW

### For Users:
- **Main Balance**: Cannot be withdrawn, used to access level tasks
- **Commission Balance**: Earned by completing daily tasks, can be withdrawn
- **Daily Tasks**: Complete once per day to earn daily_commission amount
- **Withdrawals**: Can only withdraw if you've completed all days for your level
- **Level Upgrade**: Pay entry_amount from main_balance to move to next level

### For Admins:
- **Login at /admin/login** with admin credentials
- **Dashboard**: View total users, active users, pending withdrawals
- **Users Page**: Activate users, assign levels, see balances
- **Withdrawals Page**: Approve or reject withdrawal requests
- **Tasks Page**: Create tasks for specific levels

### Level Structure (5 Levels):

| Level | Entry Cost | Main Balance | Daily Commission | Duration | Next Level Earnings |
|-------|-----------|-------------|------------------|----------|-------------------|
| 1 | ₦2,000 | ₦4,000 | ₦500/day | 2 days | ₦1,000 |
| 2 | ₦5,000 | ₦8,000 | ₦2,000/day | 7 days | ₦14,000 |
| 3 | ₦10,000 | ₦16,000 | ₦4,000/day | 10 days | ₦40,000 |
| 4 | ₦20,000 | ₦32,000 | ₦8,000/day | 15 days | ₦120,000 |
| 5 | ₦40,000 | ₦64,000 | ₦16,000/day | 20 days | ₦320,000 |

---

## Verification Checklist

After running migrations, verify:

- [ ] `levels` table has 5 rows
- [ ] `users` table has new columns: `level_id`, `main_balance`, `commission_balance`
- [ ] `user_progress` table exists
- [ ] `daily_completions` table exists
- [ ] `withdrawals` table has new columns: `level_id`, `days_completed_at_withdrawal`
- [ ] 5 RPC functions exist: `admin_activate_user`, `complete_daily_task`, `request_withdrawal_leveled`, `admin_approve_withdrawal`, `upgrade_level`
- [ ] Admin user is set (is_admin = true)
- [ ] Can login to /admin/login
- [ ] Can view admin dashboard
- [ ] Can activate a user

---

## If You Get Errors

**"column already exists"** → This is OK, migrations have `IF NOT EXISTS` clauses
**"function already exists"** → This is OK, just means it was already created
**Any auth errors** → Make sure the admin email is set correctly

---

## Deployment Status

✅ Code deployed to Vercel (https://ng-p2-vip-space.vercel.app)
✅ GitHub updated (master branch)
⏳ **WAITING: Migrations must be run in Supabase**
⏳ **WAITING: Admin user setup in database**

After migrations are complete, system is fully operational!
