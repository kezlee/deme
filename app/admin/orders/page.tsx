import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase-server";
import SignOutButton from "./SignOutButton";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#111319] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              DEMË Admin
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#dbe351]">
              Orders
            </h1>

            <p className="mt-2 text-sm text-white/60">
              Signed in as {user.email}
            </p>
          </div>

          <SignOutButton />
        </div>

        <div className="mt-8 rounded-2xl border border-white/15 bg-black/35 p-6">
          <p className="text-white/70">
            Order management will go here.
          </p>
        </div>
      </div>
    </main>
  );
}