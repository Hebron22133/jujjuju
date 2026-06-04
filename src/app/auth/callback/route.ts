import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("Auth error:", error, error_description);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin));
  }

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(new URL("/login?error=Invalid verification link", requestUrl.origin));
      }

      // Session was successfully exchanged
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    } catch (err) {
      console.error("Callback error:", err);
      return NextResponse.redirect(new URL("/login?error=Authentication failed", requestUrl.origin));
    }
  }

  // No code provided
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
