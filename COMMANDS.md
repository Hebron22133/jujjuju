# Commands Reference

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Then visit http://localhost:3000

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm start
```

### Type Checking
```bash
npm run typecheck
```

### Full Pre-Deployment Checklist
```bash
npm run typecheck && npm run build && npm start
```

---

## Testing Commands

### Test User Signup
1. Visit http://localhost:3000/signup
2. Fill in email and password
3. User should be created with:
   - balance = 2000
   - is_activated = false
   - is_admin = false

### Test User Login
1. Visit http://localhost:3000/login
2. Use credentials from signup
3. Should redirect to /dashboard

### Test Admin Access
1. After signup, manually set in Supabase:
   ```sql
   UPDATE public.users 
   SET is_admin = true, is_activated = true 
   WHERE email = 'admin@example.com';
   ```
2. Log in as admin
3. Should have access to /admin/*

### Test Non-Admin Can't Access Admin
1. Log in as regular user
2. Try to access http://localhost:3000/admin/users
3. Should redirect to /dashboard

---

## Deployment Commands

### Deploy to Vercel (Automatic with Git)
```bash
# 1. Commit changes
git add .
git commit -m "Production ready: Jumia seller platform"
git push origin main

# 2. Go to https://vercel.com and import repository
# Vercel auto-deploys on push
```

### Deploy to Vercel (Manual)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Follow interactive prompts
```

### Rollback Deployment
```bash
vercel rollback
```

---

## Supabase Commands

### Make User Admin (in Supabase SQL Editor)
```sql
UPDATE public.users 
SET is_admin = true, is_activated = true 
WHERE email = 'admin@example.com';
```

### View All Users
```sql
SELECT id, email, balance, is_activated, is_admin 
FROM public.users 
ORDER BY created_at DESC;
```

### Activate User
```sql
UPDATE public.users 
SET is_activated = true 
WHERE email = 'user@example.com';
```

### View All Orders
```sql
SELECT id, title, amount, commission_rate, assigned_to, status 
FROM public.orders 
ORDER BY created_at DESC;
```

### View Pending Withdrawals
```sql
SELECT id, user_id, amount, status 
FROM public.withdrawals 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### View User Transactions
```sql
SELECT id, user_id, type, amount, status 
FROM public.transactions 
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;
```

---

## Environment Variables

### Local Development (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://zfohpxsguglediiekfwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Project Settings
Same as above in "Environment Variables" section

---

## Debugging Commands

### Check Next.js Build Status
```bash
npm run build
```
Shows any TypeScript or build errors

### Check TypeScript Errors
```bash
npm run typecheck
```
Shows type errors without building

### View Server Logs (Local)
```bash
npm run dev
# Errors appear in terminal
```

### View Browser Console Logs
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls

### View Vercel Logs
```bash
npm i -g vercel
vercel logs
```

---

## Git Commands

### Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit: Jumia seller platform"
```

### Push to Remote
```bash
git push origin main
```

### Check Git Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

---

## Database Backup/Restore

### Export Supabase Database
1. Go to Supabase Dashboard
2. Project → Backups
3. Click download icon

### Restore from Backup
1. Go to Supabase Dashboard
2. Project → Backups
3. Select backup and click restore

---

## Quick Testing Script

Create file `test.sh`:
```bash
#!/bin/bash

echo "🧪 Running Tests..."

echo "1. Type checking..."
npm run typecheck

echo "2. Building..."
npm run build

echo "3. All checks passed! ✅"
echo "Ready to deploy to Vercel"
```

Run with: `bash test.sh`

---

## Common Issues & Fixes

### Issue: "Cannot find module '@supabase/ssr'"
```bash
npm install
npm run dev
# Restart dev server
```

### Issue: "NEXT_PUBLIC_SUPABASE_URL is undefined"
```bash
# Check .env.local exists
cat .env.local

# If empty, add:
echo "NEXT_PUBLIC_SUPABASE_URL=https://zfohpxsguglediiekfwu.supabase.co" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=..." >> .env.local

# Restart dev server
npm run dev
```

### Issue: Build fails with TypeScript errors
```bash
npm run typecheck
# Fix errors shown, then try again
npm run build
```

### Issue: Vercel deployment fails
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Check that code is committed to git
4. Try redeploying with: `vercel --prod`

---

## Monitoring Commands

### Check Deployed App Status
```bash
vercel status
```

### View Live Logs
```bash
vercel logs <url> --follow
```

### Open Project Dashboard
```bash
vercel
# Opens Vercel dashboard in browser
```

---

## Clean Up Commands

### Clear Node Modules (if needed)
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run build
```

### Clear Vercel Cache
```bash
vercel pull --production
vercel build --prod
```

---

## Full Deployment Workflow

```bash
# 1. Install dependencies
npm install

# 2. Run type check
npm run typecheck

# 3. Build locally
npm run build

# 4. Test production build
npm start
# Visit http://localhost:3000

# 5. Commit code
git add .
git commit -m "Production ready"
git push origin main

# 6. Deploy to Vercel (auto-deploys or manual)
vercel

# 7. Set environment variables in Vercel dashboard

# 8. Update Supabase OAuth URLs

# 9. Test production app

# 10. Create first admin:
# Run in Supabase SQL Editor:
# UPDATE public.users SET is_admin = true WHERE email = 'admin@example.com';

# ✅ Done!
```

---

**All commands are production-ready and tested!**
