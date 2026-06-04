# Jumia Seller Platform - Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (backend already configured)

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

The following packages are already included:
- `@supabase/supabase-js` - Supabase client library
- `@supabase/ssr` - Server-side rendering support for auth
- `next` - React framework
- `react` - UI library

### 2. Environment Variables

Create `.env.local` file in the root directory with:

```
NEXT_PUBLIC_SUPABASE_URL=https://zfohpxsguglediiekfwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmb2hweHNndWdsZWRpaWVrZnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODMzODYsImV4cCI6MjA5NjA1OTM4Nn0.uXjobjr21zm5c25IMMnZMAPrv9ZEfjs74-tCRih0H3A
```

These are already included in `.env.local`.

## Architecture

### Authentication Flow

1. **Login/Signup**: Users authenticate via Supabase Auth (email/password)
2. **Session Management**: Middleware refreshes session on every request
3. **Protected Routes**: All `/app/*` routes require authentication via `requireProfile()`
4. **Admin Routes**: `/admin/*` routes require `is_admin = true` via `requireAdminProfile()`

### Database Integration

All queries automatically respect Row Level Security (RLS) policies:

- **Users** can only access their own data
- **Admins** can access all data
- **Orders**, **Transactions**, **Withdrawals** are filtered by user_id or assigned_to

### Supabase Client Helpers

- **Browser Client** (`/lib/supabase/browser.ts`): Used in client components for auth
- **Server Client** (`/lib/supabase/server.ts`): Used in server components and actions
- **Middleware** (`/lib/supabase/middleware.ts`): Refreshes session on every request

## Core Features

### User System
- Registration with 2000 NGN initial balance
- Activation by admin before order processing
- Balance tracking and tier system
- Transaction history

### Order Management
- Admin creates and assigns orders
- Users process assigned orders
- Commission automatically calculated and credited
- Status tracking: pending → assigned → completed

### Withdrawal System
- Users request withdrawals
- Admin reviews and approves/rejects
- Automatic balance deduction on approval

### Admin Dashboard
- User management (view, activate/deactivate)
- Order management (create, assign, track)
- Withdrawal approval workflow
- System metrics (user count, active orders, pending withdrawals)

## Deployment to Vercel

### 1. Prepare for Deployment

```bash
# Build the project
npm run build

# Test production build locally
npm start
```

### 2. Push to Git Repository

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3. Deploy to Vercel

Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

Option B: Using GitHub
1. Connect your GitHub repo to Vercel
2. Vercel will auto-deploy on push to main

### 4. Set Environment Variables on Vercel

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zfohpxsguglediiekfwu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 5. Set OAuth Redirect URLs in Supabase

In Supabase dashboard (Authentication → URL Configuration):
```
http://localhost:3000/auth/callback
https://your-vercel-app.vercel.app/auth/callback
https://your-custom-domain.com/auth/callback
```

## Development

### Local Development

```bash
npm run dev
```

Server runs on http://localhost:3000

### Key Routes

**User Routes:**
- `/login` - Login page
- `/signup` - Registration page
- `/dashboard` - User dashboard
- `/orders` - Process assigned orders
- `/wallet` - View balance and transactions
- `/withdrawals` - Request withdrawals

**Admin Routes:**
- `/admin/dashboard` - System overview
- `/admin/users` - User management
- `/admin/orders` - Order management
- `/admin/withdrawals` - Withdrawal approvals

## Security

### RLS Policies
All data access is controlled by Supabase RLS:
- Users see only their own data
- Admins see all data
- Policies enforced at database level

### Authentication
- Secure password hashing via Supabase Auth
- Session tokens stored in secure HTTP-only cookies
- Middleware refreshes session on every request

### Server Actions
- All mutations go through server actions
- Authentication checked before any action
- Admin checks in place for admin-only operations

## Troubleshooting

### "Missing NEXT_PUBLIC_SUPABASE_URL"
- Ensure `.env.local` file exists
- Verify environment variables are correct
- Restart dev server after adding env vars

### "User profile not found" on login
- Check that user exists in `public.users` table
- Verify Supabase triggers are creating profiles on signup
- Check RLS policies allow profile read

### "Admin access required" on admin routes
- Verify user has `is_admin = true` in `public.users` table
- Admin must update user directly in Supabase dashboard

### Auth redirect loop
- Check OAuth redirect URLs in Supabase
- Verify session cookies are being set
- Clear browser cookies and try again

## Monitoring

### Check Supabase Logs
1. Go to Supabase dashboard
2. Check "Logs" tab for errors
3. Check RLS policy execution

### Monitor User Activity
- `/admin/dashboard` shows real-time stats
- Check transaction history in `/wallet`
- View withdrawal requests in `/admin/withdrawals`

## Support

For issues:
1. Check Supabase logs first
2. Verify environment variables are set
3. Check browser console for client errors
4. Review server logs in Vercel dashboard
