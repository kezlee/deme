import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase-server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

import SignOutButton from "./SignOutButton";
import OrdersClient from "./OrdersClient";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: orders, error } =
    await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        email,
        phone,
        total,
        currency,
        payment_status,
        order_status,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          unit_price
        )
      `)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Unable to load orders:",
      error
    );
  }

  return (
    <main className="min-h-screen bg-[#111319] px-4 py-8 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              DEMË Admin
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#dbe351]">
              Orders
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Signed in as {user.email}
            </p>
          </div>

          <SignOutButton />
        </header>

        <OrdersClient
          orders={orders ?? []}
        />
      </div>
    </main>
  );
}