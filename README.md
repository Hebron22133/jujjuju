# Jumia Seller Platform

A controlled internal system for managing seller orders, commissions, and withdrawals. Built with Next.js and Supabase.

## Overview

This is **NOT** a public marketplace. It's an internal agent management platform where:
- **Agents** process assigned orders and earn commissions
- **Admins** create orders, manage users, and approve withdrawals
- All actions are role-based and secure via Row Level Security

## Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Supabase (Auth + PostgreSQL)
- **Security**: Row Level Security (RLS) policies
- **Hosting**: Vercel-ready

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env.local` file is already configured with:
```
NEXT_PUBLIC_SUPABASE_URL=https://zfohpxsguglediiekfwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

## Architecture

### Authentication
- Users sign up with email/password via Supabase Auth
- Sessions stored in secure HTTP-only cookies
- Middleware refreshes session on every request
- Protected routes require `requireProfile()` or `requireAdminProfile()`

### User System
- Registration: ₦2000 initial balance, `is_activated = false`
- Activation: Only admin can activate users
- Tiers: Based on balance (1-5 levels)
- Transactions: Tracked for all operations

### Order System
- **Creation**: Admin only
- **Assignment**: Admin assigns to users
- **Processing**: User clicks to earn commission
- **Commission**: Auto-calculated (default 1.2%)

### Withdrawal System
- **Request**: User submits amount
- **Approval**: Admin reviews and approves/rejects
- **Execution**: Balance deducted on approval

### Admin Controls
- User management (activate/deactivate)
- Order creation and assignment
- Withdrawal approval workflow
- System metrics and monitoring

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Login, signup pages
│   ├── (app)/                  # Protected user pages
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── wallet/
│   │   ├── withdrawals/
│   │   └── admin/              # Admin-only pages
│   └── auth/callback/          # OAuth callback
├── components/
│   ├── layout/                 # Shells, navigation
│   └── ui/                     # Forms, badges, notices
├── lib/
│   ├── supabase/               # Client configuration
│   ├── auth.ts                 # Authentication guards
│   ├── types.ts                # TypeScript definitions
│   └── format.ts               # Utility functions
└── actions/
    └── app.ts                  # Server actions
```

## Key Routes

**User Routes**:
- `/login` - Log in
- `/signup` - Register
- `/dashboard` - User dashboard with balance and stats
- `/orders` - Process assigned orders
- `/wallet` - View balance and transaction history
- `/withdrawals` - Request and track withdrawals

**Admin Routes** (require `is_admin = true`):
- `/admin/dashboard` - System overview
- `/admin/users` - User management
- `/admin/orders` - Create and assign orders
- `/admin/withdrawals` - Approve/reject withdrawals

## Usage Workflow

### 1. User Registration
- Visit `/signup` and create account
- Auto-receive ₦2000 balance
- Cannot work until activated

### 2. Admin Activation
- Go to `/admin/users`
- Click "Activate" on user
- User can now process orders

### 3. Order Processing
- Admin goes to `/admin/orders` and creates order (e.g., ₦1000)
- Admin assigns order to user
- User sees order in `/orders`
- User clicks "Process Order"
- System calculates commission (₦1000 × 1.2% = ₦12)
- Commission added to user balance

### 4. Withdrawal
- User goes to `/withdrawals` and requests amount
- Admin reviews in `/admin/withdrawals`
- Admin clicks "Approve" or "Reject"
- If approved, balance deducted immediately

## Security

### Row Level Security (RLS)
All database access controlled by RLS policies:
- Users can only access their own data
- Admins can access all data
- Policies enforced at database level

### Authentication Guards
- `requireProfile()` - Any logged-in user
- `requireAdminProfile()` - Only admins, redirects others

### Server Actions
- All mutations through server actions
- Authentication checked before any operation
- Admin verification for admin-only operations

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
```

These are public (prefixed with `NEXT_PUBLIC_`) because they're for browser use. Authentication is handled through RLS policies in Supabase.

## Deployment to Vercel

### Automatic (Recommended)
1. Push to GitHub
2. Connect repo to Vercel
3. Vercel auto-deploys on push

### Manual
```bash
npm run build
vercel
```

### Post-Deployment
1. Set environment variables in Vercel project settings
2. Update OAuth redirect URLs in Supabase:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-custom-domain.com/auth/callback
   ```

## Making an Admin

After registering first user, run in Supabase SQL Editor:

```sql
UPDATE public.users
SET is_admin = true, is_activated = true
WHERE email = 'admin@example.com';
```

## Database Schema

**Note:** The database is already fully configured with tables, functions, and RLS policies. No setup required.

Tables:
- `users` - User profiles and balances
- `orders` - Order assignments and status
- `transactions` - Balance history
- `withdrawals` - Withdrawal requests

Functions:
- `admin_create_order()` - Create orders
- `admin_assign_order()` - Assign to users
- `process_order()` - User processes order
- `request_withdrawal()` - Request payout
- `admin_review_withdrawal()` - Approve/reject

## Development

### Local Development
```bash
npm run dev
```

### Type Checking
```bash
npm run typecheck
```

### Build
```bash
npm run build
```

### Production Run
```bash
npm start
```

## Styling

Jumia branding with orange/yellow theme:
- Primary color: `#ff9900` (orange)
- Background: `#fff8e1` (cream)
- All styled components use CSS variables

See `src/app/globals.css` for complete theme.

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [DEV_GUIDE.md](./DEV_GUIDE.md) - Developer quick start
- [database/schema.sql](./database/schema.sql) - Database schema (reference only)

## Support & Troubleshooting

**Problem**: "Missing NEXT_PUBLIC_SUPABASE_URL"
- **Solution**: Restart dev server after checking `.env.local`

**Problem**: "User profile not found"
- **Solution**: Verify Supabase triggers create profile on signup

**Problem**: "Admin access required" but user is admin
- **Solution**: Set `is_admin = true` in Supabase users table

**Problem**: Cannot log in
- **Solution**: Check Supabase Auth is working, verify email confirmation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting.

## License

Internal use only. Not for public distribution.

