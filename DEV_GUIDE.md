# Jumia Seller Platform - Developer Quick Start

## What is this?

Jumia Seller Platform is a controlled internal system where:
- **Agents** (sellers) log in and process assigned orders
- **Admins** control all operations: user activation, order creation, commission rates
- **Payments** are tracked and withdrawn through admin approval

## Quick Setup

### 1. Install & Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### 2. Test Accounts

**Create test users:**
1. Visit `/signup` and register two accounts
2. In Supabase dashboard, set one as admin:
   ```sql
   UPDATE public.users SET is_admin = true WHERE email = 'admin@example.com';
   ```

### 3. Admin Workflow

1. Log in as admin → `/admin/dashboard`
2. Go to `/admin/users` → Activate a user
3. Go to `/admin/orders` → Create order (e.g., ₦1000 @ 1.2%)
4. Assign order to activated user
5. Log in as user → `/orders` → Click "Process Order"
6. Commission (₦12) appears in balance
7. User can request withdrawal in `/withdrawals`
8. Admin approves in `/admin/withdrawals`

## Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (app)/                    # Protected user pages
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── wallet/
│   │   ├── withdrawals/
│   │   └── admin/                # Admin pages
│   ├── auth/callback/            # OAuth callback
│   └── globals.css               # Jumia theme colors
├── components/
│   ├── layout/                   # Shells, navigation
│   └── ui/                       # Forms, badges, notices
├── lib/
│   ├── supabase/                 # Client configs & middleware
│   ├── auth.ts                   # Authentication guards
│   ├── types.ts                  # TypeScript types
│   └── format.ts                 # Formatters
└── actions/
    └── app.ts                    # Server actions
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `.env.local` | Supabase credentials |
| `src/lib/auth.ts` | `requireProfile()` and `requireAdminProfile()` guards |
| `src/actions/app.ts` | All server actions (create order, process order, etc.) |
| `src/lib/supabase/browser.ts` | Client-side Supabase |
| `src/lib/supabase/server.ts` | Server-side Supabase |
| `middleware.ts` | Session refresh on every request |

## Common Tasks

### Add a New Admin Route

1. Create folder: `src/app/(app)/admin/new-feature/`
2. Add `page.tsx`:
   ```tsx
   import { requireAdminProfile } from "@/lib/auth";
   
   export default async function NewFeaturePage() {
     const { supabase, profile } = await requireAdminProfile();
     
     // Fetch data
     const { data } = await supabase.from("table").select("*");
     
     return <>Your UI</>;
   }
   ```

### Call Supabase from Client

```tsx
"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function MyComponent() {
  const supabase = createSupabaseBrowserClient();
  
  async function fetchData() {
    const { data } = await supabase.from("orders").select("*");
  }
}
```

### Create Server Action

```tsx
"use server";
import { requireProfile } from "@/lib/auth";

export async function myAction(formData: FormData) {
  const { supabase } = await requireProfile();
  
  const { error } = await supabase.rpc("my_function", { params });
  
  if (error) redirect("/error");
  revalidatePath("/page");
  redirect("/success");
}
```

## Authentication Flow

1. User logs in at `/login`
2. Supabase Auth authenticates and creates session
3. `auth/callback` exchanges code for session
4. Middleware refreshes session on every request
5. Protected routes use `requireProfile()` to check auth
6. Admin routes use `requireAdminProfile()` to check `is_admin`

## Data Flow

### User sees their orders:
```
Dashboard → requireProfile() 
→ Supabase client (already authenticated)
→ Query orders WHERE assigned_to = current_user_id
→ RLS policy enforces this automatically
```

### Admin creates order:
```
Admin form → createOrderAction()
→ requireAdminProfile() (checks is_admin)
→ supabase.rpc("admin_create_order", {...})
→ Database function executes
→ RLS allows because user is admin
```

## Styling

Jumia theme colors in `src/app/globals.css`:
- Primary (orange): `#ff9900`
- Background (cream): `#fff8e1`
- All CSS classes: `.panel`, `.button`, `.badge`, `.list-item`

## Testing Locally

1. **Test login flow**: Sign up, confirm email, log in
2. **Test user access**: Can't access `/admin`, redirected to dashboard
3. **Test admin access**: Set `is_admin=true`, can access `/admin`
4. **Test order flow**: Admin creates → assigns → user processes
5. **Test withdrawal**: User requests → admin approves → balance deducts

## Debugging

- Check `.env.local` first!
- Browser console: Client-side errors
- Network tab: API calls to Supabase
- Vercel logs: Server errors and RLS rejections
- Supabase logs: Database errors and policy failures

## Deploy to Vercel

```bash
git push origin main
# Vercel auto-deploys

# Or manual:
npm run build
npm start
```

Set env vars in Vercel project settings (same as `.env.local`).

---

**Ready to code?** Start by understanding the auth flow, then pick a feature to work on!
