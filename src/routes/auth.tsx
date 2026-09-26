import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "@/config/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner Sign In | Kaara's Beauty Saloon & Makeover" },
      { name: "description", content: "Private owner sign-in for the Kaara's website dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("vigneshkumar95eee@gmail.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Enter the owner email address.");
      if (!password) throw new Error("Enter your password.");

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) {
        if (error.code === "invalid_credentials") {
          throw new Error("Invalid email or password.");
        }
        throw error;
      }

      toast.success("Signed in. Opening dashboard…");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-md rounded-sm border border-border bg-surface p-8 md:p-10">
        <Link to="/" className="block text-center">
          <span className="font-display text-2xl tracking-[0.3em] gold-text">KAARAS</span>
        </Link>
        <h1 className="mt-6 text-center font-display text-3xl text-ivory">Owner sign in</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Private dashboard for the {BUSINESS.shortName} website.
        </p>

        <form onSubmit={signIn} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              Owner email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              placeholder="owner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm text-ivory outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm text-ivory outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm bg-gold px-6 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : "Sign in"}
          </button>
        </form>


        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Owner access only. Create or manage the owner account from Supabase Authentication.
        </p>
      </div>
    </main>
  );
}
