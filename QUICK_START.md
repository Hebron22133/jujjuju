# 🚀 Quick Deployment Checklist

## Before Deploying

- [ ] Run `npm run typecheck` - verify no TypeScript errors
- [ ] Run `npm run build` - test production build
- [ ] Test locally with `npm run dev`:
  - [ ] Can sign up at `/signup`
  - [ ] Can log in at `/login`
  - [ ] Can see dashboard at `/dashboard`
  - [ ] Cannot access `/admin` (redirects to dashboard)

## Deploy to Vercel

### Option A: Automatic (Git Integration)
```bash
# 1. Make sure code is committed
git add .
git commit -m "Production ready: Jumia seller platform"
git push origin main

# 2. Go to https://vercel.com
# 3. Click "Add New Project"
# 4. Select your repository
# 5. Vercel automatically deploys
```

### Option B: Manual Deploy
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Follow prompts
```

## After Deployment

- [ ] Set environment variables in Vercel:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://zfohpxsguglediiekfwu.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- [ ] Update Supabase OAuth URLs:
  1. Go to Supabase Dashboard
  2. Project → Authentication → URL Configuration
  3. Add redirect URL:
     ```
     https://your-vercel-app.vercel.app/auth/callback
     ```

- [ ] Test on production:
  - [ ] Can sign up and log in
  - [ ] Can see dashboard
  - [ ] No auth errors in console

## Make First Admin

After deploying, run in Supabase SQL Editor:

```sql
UPDATE public.users
SET is_admin = true, is_activated = true
WHERE email = 'your-admin-email@example.com';
```

## Test Admin Workflow

1. Sign up as admin
2. Sign up as regular user
3. Set admin account: `is_admin = true`
4. Log in as admin → Go to `/admin/users`
5. Activate the regular user
6. Go to `/admin/orders` → Create order
7. Assign to regular user
8. Log in as regular user → See order in `/orders`
9. Click "Process Order" → Earn commission
10. Request withdrawal → Admin approves

## Monitoring

- Check Vercel logs: https://vercel.com/dashboard
- Check Supabase logs: https://app.supabase.com → Logs
- Monitor user activity in admin dashboard

## Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide  
- [DEV_GUIDE.md](./DEV_GUIDE.md) - Developer reference
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's implemented

## Need Help?

1. Check `.env.local` has correct values
2. Check browser console for errors
3. Check Vercel logs for backend errors
4. Check Supabase logs for database errors
5. Verify Supabase OAuth URLs are correct

---

**Everything is production-ready!** 

**Current Status**: ✅ Ready to deploy
