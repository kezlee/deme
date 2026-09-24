"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/orders");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#111319] px-4 py-12 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-white/15 bg-black/35 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            DEMË Admin
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#dbe351]">
            Sign In
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <label className="flex flex-col gap-2 text-sm text-white/80">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-white outline-none focus:border-[#dbe351]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/80">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-white outline-none focus:border-[#dbe351]"
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#dbe351] px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-[#eef783] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}