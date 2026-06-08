# DEPLOYMENT CHECKLIST ✅

## PRE-DEPLOYMENT

### 1. Database Migrations
Run the migration file in Supabase SQL Editor to add products & tasks tables:
```sql
-- Run: migrations/003_add_products_and_tasks.sql
```

### 2. Supabase Storage Buckets
Create these storage buckets in Supabase:
- `task-images` (public)
- `product-images` (public)

### 3. Environment Variables (Vercel)
Set in Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## BUILD VERIFICATION
✅ Build completed successfully
✅ All admin routes compiled:
   - /admin/login
   - /admin/dashboard
   - /admin/agents
   - /admin/tasks
   - /admin/products
   - /admin/withdrawals
   - /admin/activations

## DEPLOYMENT STEPS

### Option A: Deploy to Vercel (Recommended)
1. Push code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import project
4. Add environment variables above
5. Deploy

### Option B: Manual Deploy Commands
```bash
# Production build
pnpm install
pnpm build
pnpm start
```

## POST-DEPLOYMENT

### 1. Run Database Migrations
Execute in Supabase SQL Editor:
```sql
-- migrations/003_add_products_and_tasks.sql
```

### 2. Set Admin User
Run in Supabase SQL Editor:
```sql
UPDATE public.users SET is_admin = true WHERE email = 'admin@example.com';
```

### 3. Test Admin Access
- Go to /admin/login
- Enter admin email
- Enter key: Q
- Should redirect to /admin/dashboard

### 4. Verify All Features
- ✓ Create tasks with images
- ✓ Create products with images
- ✓ Manage agents/activation
- ✓ Approve/reject withdrawals

## LIVE URL AFTER DEPLOYMENT
Your app will be live at: `https://your-vercel-domain.vercel.app`
Admin panel: `https://your-vercel-domain.vercel.app/admin/login`

## ROLLBACK (if needed)
```bash
git revert HEAD
git push
# Vercel auto-redeploys on push
```
