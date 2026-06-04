"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createSupabaseBrowserClient();

    if (mode === "signup") {
      const confirmPassword = String(form.get("confirm_password") ?? "");
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setPasswordMatch(false);
        setLoading(false);
        return;
      }
      setPasswordMatch(true);
    }

    const response =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (response.error) {
      setLoading(false);
      setError(response.error.message);
      return;
    }

    if (mode === "signup") {
      if (response.data.user && response.data.session) {
        // Signup successful with session - wait for profile creation trigger
        // Database trigger needs time to create the user profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify the profile was created
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", response.data.user.id)
          .single();
        
        if (profileError || !profile) {
          setLoading(false);
          setError("Account created successfully! Please try logging in.");
          return;
        }
        
        // Ensure session is synced to server cookies before redirecting
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push("/dashboard");
        return;
      } else if (response.data.user) {
        // User created but no session - redirect to login to let them verify
        setLoading(false);
        setError("Account created! Please check your email to verify, or try logging in.");
        return;
      }
    }

    if (mode === "login") {
      if (response.data.session) {
        // Ensure session is synced to server cookies before redirecting
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push("/dashboard");
        return;
      } else {
        setLoading(false);
        setError("Login failed. Please try again.");
        return;
      }
    }

    setLoading(false);
    setError("Something went wrong. Please try again.");
  }

  return (
    <>
      {error ? <div className="notice error">{error}</div> : null}
      <form className="form" onSubmit={onSubmit}>
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="email">Email</label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input 
              className="input" 
              id="email" 
              name="email" 
              type="email" 
              placeholder="Email address"
              autoComplete="email" 
              required 
            />
          </div>
        )}
        {mode === "login" && (
          <div className="field">
            <label htmlFor="email">Email</label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input 
              className="input" 
              id="email" 
              name="email" 
              type="email" 
              placeholder="Email address"
              autoComplete="email" 
              required 
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="password">Password</label>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
          />
        </div>
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="confirm_password">Confirm Password</label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              className="input"
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Confirm password"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
        )}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Register" : "Login"}
        </button>
      </form>
      <div className="auth-switch">
        {mode === "signup" ? (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        ) : (
          <>
            New user? <Link href="/signup">Register</Link>
          </>
        )}
      </div>
    </>
  );
}
