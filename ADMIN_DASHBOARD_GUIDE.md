# Admin Dashboard - Complete Implementation

## Overview

The admin dashboard is now fully restructured with a clean, organized interface for managing the task/agent system. All sections are logically grouped and properly styled.

## Quick Setup

### 1. Add is_admin Column to Database

If you get the error `column "is_admin" of relation "users" does not exist`, run this in your Supabase SQL Editor:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin boolean not null default false;
```

### 2. Set papasupe85@gmail.com as Admin

Run [ADMIN_SETUP.sql](ADMIN_SETUP.sql) in Supabase SQL Editor. It will:
- Add the `is_admin` column (if missing)
- Set papasupe85@gmail.com as admin
- Verify the update

Or manually run:
```sql
UPDATE public.users
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'papasupe85@gmail.com'
);
```

## Dashboard Structure

### 1. **Dashboard** (`/admin/dashboard`)
- **System Overview**: Key metrics at a glance
  - Total Agents count
  - Total Tasks created
  - Pending Withdrawals (count + amount)
- **Recent Tasks**: Last 5 tasks with details
- **Recent Agents**: Last 5 agents joined with balances

### 2. **Agent Management** (`/admin/agents`)
- **Stats Grid**: 
  - Total Agents
  - Active Agents count
  - Total Balance across all agents
- **Agents Table**: List all agents with
  - Email and ID
  - Current balance
  - Active/Inactive status
  - Join date
  - Activate/Deactivate buttons

### 3. **Task Management** (`/admin/tasks`)
- **Stats Grid**:
  - Total Tasks
  - Active Tasks count
  - Completed Tasks count
- **Create Task Form**:
  - Task Title *
  - Task Amount *
  - Commission Rate % *
- **All Tasks Table**: Display all tasks with
  - Title and ID
  - Amount
  - Commission Rate
  - Status (available, completed, etc.)
  - Created date

### 4. **Submissions** (`/admin/submissions`)
- **Stats Grid**:
  - Total Submissions
  - Pending count
  - Approved count
  - Rejected count
- **All Submissions Table**: 
  - Task title and agent email
  - Amount
  - Commission rate
  - Status (pending, approved, rejected)
  - Submitted date
  - Approve/Reject buttons (for pending only)

### 5. **Withdrawals** (`/admin/withdrawals`)
- **Stats Grid**:
  - Total Requests
  - Pending (with total amount)
  - Approved count
  - Rejected count
- **All Withdrawals Table**:
  - Amount
  - User ID
  - Status (pending, approved, rejected)
  - Requested date
  - Approve/Reject buttons (for pending only)

### 6. **Wallet Control** (`/admin/wallet`)
- **Stats Grid**:
  - Total Balance across all agents
  - Total Agent count
  - Top Agent info (email + balance)
- **Adjust Balance Form**:
  - Select Agent dropdown
  - Amount field (positive = add, negative = deduct)
  - Reason field (for audit trail)
- **Agents by Balance Table**: Top 20 agents ranked by balance
  - Rank #
  - Email
  - Balance
  - Status (Active/Inactive)

## Navigation

**Admin Sidebar** now displays:
- Dashboard
- Agent Management
- Task Management
- Submissions
- Withdrawals
- Wallet Control

Each menu item includes:
- Icon for quick identification
- Label
- Description text for clarity

## Security

- Only users with `is_admin = true` can access `/admin` routes
- Protected by `requireAdminProfile()` authentication guard
- All operations verified server-side

## Features

✅ Dashboard with real-time stats
✅ Agent management (view, activate, deactivate)
✅ Task management (create, list, manage)
✅ Submission review (approve/reject)
✅ Withdrawal management (approve/reject)
✅ Wallet control (adjust balances)
✅ Proper async handling & error states
✅ Clean sidebar navigation
✅ Responsive grid layouts
✅ Status badges with color coding
✅ Quick stats panels
✅ Form validation

## Database Connections

All pages connected to Supabase tables:
- `users` - Agent data (with is_admin column)
- `orders` - Tasks
- `submissions` - Task submissions
- `withdrawals` - Withdrawal requests
- `transactions` - Transaction history

## Styling

Admin pages use:
- Consistent `.admin-header` for page titles
- `.admin-panel` sections with clear grouping
- `.admin-table` for data display
- `.admin-row` and `.admin-cell` for table structure
- Status badges (`.badge.ok`, `.badge.warn`)
- Stat labels for clarity
- Responsive grid layouts
- Jumia orange/yellow theme colors

## Troubleshooting

### Error: "column is_admin does not exist"
- Run the migration: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean not null default false;`
- See **Quick Setup** section above

### Error: "Not authorized"
- Make sure the user's `is_admin` column is set to `true`
- Verify by running: `SELECT id, email, is_admin FROM public.users WHERE email = 'papasupe85@gmail.com';`
