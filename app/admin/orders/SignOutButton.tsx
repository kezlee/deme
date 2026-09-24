"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.15em] text-white/80 transition hover:border-[#dbe351] hover:text-[#dbe351]"
    >
      Sign Out
    </button>
  );
}