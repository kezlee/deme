import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase-server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import SignOutButton from "./SignOutButton";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      email,
      phone,
      block,
      street,
      unit_number,
      postal_code,
      country,
      subtotal,
      shipping_fee,
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load orders:", error);
  }

  return (
    <main className="min-h-screen bg-[#111319] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
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

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-black/35">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-white/60">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Order Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>

              <tbody>
                {orders?.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#dbe351] underline-offset-4 transition hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {order.customer_name}
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        {order.email}
                      </div>
                      <div className="text-xs text-white/50">
                        {order.phone}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {order.order_items?.map((item) => (
                          <div key={item.id}>
                            {item.product_name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {order.currency} {Number(order.total).toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs text-green-300">
                        {order.payment_status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-300">
                        {order.order_status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-white/60">
                      {new Date(order.created_at).toLocaleString("en-SG")}
                    </td>
                  </tr>
                ))}

                {!orders?.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-white/50"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}