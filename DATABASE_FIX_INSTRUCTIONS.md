# COMPLETE FIX - Step by Step

## THE PROBLEM
- "Could not find function `public.process_order(p_order_id)`" 
- "Could not find function `public.request_withdrawal(p_amount)`"

This means the database functions don't exist in your Supabase database.

## THE SOLUTION - 4 SIMPLE STEPS

### STEP 1: Go to Supabase Console
1. Open https://supabase.com/dashboard
2. Click your project "ng-p2-vip.space"

### STEP 2: Open SQL Editor
1. Click **SQL Editor** (left sidebar)
2. Click **New Query**

### STEP 3: Copy and Paste the SQL
1. **IMPORTANT:** Copy the ENTIRE content from `COMPLETE_DATABASE_FIX.sql` file in this project
2. Paste it into the Supabase SQL Editor query box
3. You should see a VERY LONG query

### STEP 4: Run It
1. Click **RUN** button (or press Ctrl+Enter)
2. Wait for it to complete (should take 10-20 seconds)
3. You should see:
   - ✅ No errors
   - ✅ Three functions listed: process_order, request_withdrawal, admin_review_withdrawal
   - ✅ Users table columns including: bank_name, bank_code, account_number, account_holder_name, bank_updated_at

### STEP 5: Verify
If you see all three functions listed with no errors, you're DONE!

## IF YOU GET ERRORS

**Error: "syntax error"**
- Make sure you copied the ENTIRE file
- Clear and try again

**Error: "relation 'public.users' does not exist"**
- Your database hasn't been initialized yet
- Contact support

**Error: "current_user_is_admin does not exist"**
- This is expected first time - the script will create it

## THEN REDEPLOY

After running the SQL:
1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Click project "ng.p2-vip.space"
3. Wait for it to show "✅ Deployed" (already deployed from our git push)
4. Or click "Redeploy" if you want to force a redeploy

## THEN TEST

1. Hard refresh the app: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Go to **Orders** page
3. Click **"Process Task"** button
4. You should see: "Task completed! Commission ₦... credited."
5. Go to **Withdrawals** page
6. Click **"Request Withdrawal"** button
7. You should be able to enter an amount

If both work, everything is fixed! 🎉
