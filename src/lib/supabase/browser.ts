"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = [];
          document.cookie.split(";").forEach(cookie => {
            const [name, value] = cookie.trim().split("=");
            if (name) {
              cookies.push({ name, value: decodeURIComponent(value || "") });
            }
          });
          return cookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = `${name}=${encodeURIComponent(value)}; path=${options?.path || "/"}; ${
              options?.maxAge ? `max-age=${options.maxAge}; ` : ""
            }${options?.secure ? "secure; " : ""}${options?.sameSite ? `samesite=${options.sameSite}` : ""}`;
            document.cookie = cookieString;
          });
        },
      },
    }
  );
}
