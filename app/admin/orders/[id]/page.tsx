import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { createClient } from "@/app/lib/supabase-server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import OrderStatusActions from "./OrderStatusActions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const {
    data: order,
    error,
  } = await supabaseAdmin
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
      updated_at,
      hitpay_payment_id,
      hitpay_payment_request_id,
      order_items (
        id,
        product_name,
        quantity,
        unit_price
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  const shippingAddress = [
    `${order.block} ${order.street}`,
    order.unit_number,
    `${order.country} ${order.postal_code}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#111319] px-4 py-8 text-white md:px-8 overflow-auto h-full">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/orders"
              className="text-sm text-white/60 transition hover:text-[#dbe351]"
            >
              ← Back to orders
            </Link>

            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/50">
              DEMË Admin
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#dbe351]">
              {order.order_number}
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Created{" "}
              {new Date(order.created_at).toLocaleString("en-SG")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs uppercase tracking-wide text-green-300">
              Payment: {order.payment_status}
            </span>

            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs uppercase tracking-wide text-yellow-300">
              Order: {order.order_status}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Customer */}
          <section className="rounded-2xl border border-white/15 bg-black/35 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#dbe351]">
              Customer
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-xs text-white/40">Name</p>
                <p className="mt-1">{order.customer_name}</p>
              </div>

              <div>
                <p className="text-xs text-white/40">Email</p>
                <p className="mt-1">{order.email}</p>
              </div>

              <div>
                <p className="text-xs text-white/40">Phone</p>
                <p className="mt-1">{order.phone}</p>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-2xl border border-white/15 bg-black/35 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#dbe351]">
              Shipping Address
            </h2>

            <p className="mt-5 text-sm leading-6 text-white/85">
              {shippingAddress}
            </p>
          </section>
        </div>

        {/* Items */}
        <section className="mt-6 rounded-2xl border border-white/15 bg-black/35 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#dbe351]">
            Items
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-white/50">
                <tr>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 px-4">Unit Price</th>
                  <th className="pb-3 px-4">Quantity</th>
                  <th className="pb-3 pl-4 text-right">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {order.order_items?.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/10 last:border-0"
                  >
                    <td className="py-4 pr-4 font-medium">
                      {item.product_name}
                    </td>

                    <td className="px-4 py-4">
                      {order.currency}{" "}
                      {Number(item.unit_price).toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      {item.quantity}
                    </td>

                    <td className="py-4 pl-4 text-right">
                      {order.currency}{" "}
                      {(
                        Number(item.unit_price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto mt-6 max-w-sm space-y-3 border-t border-white/10 pt-5 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span>
                {order.currency}{" "}
                {Number(order.subtotal).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-white/70">
              <span>Mailing fee</span>
              <span>
                {order.currency}{" "}
                {Number(order.shipping_fee).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-lg font-semibold text-[#dbe351]">
              <span>Total</span>
              <span>
                {order.currency}{" "}
                {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="mt-6 rounded-2xl border border-white/15 bg-black/35 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#dbe351]">
            Fulfilment
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Current status:{" "}
            <span className="font-medium text-white">
              {order.order_status}
            </span>
          </p>

          <div className="mt-5">
            <OrderStatusActions
              orderId={order.id}
              currentStatus={order.order_status}
            />
          </div>
        </section>

        {/* HitPay */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/50">
            Payment Reference
          </h2>

          <div className="mt-4 space-y-2 break-all text-xs text-white/50">
            <p>
              Payment request:{" "}
              {order.hitpay_payment_request_id || "-"}
            </p>

            <p>
              Payment ID:{" "}
              {order.hitpay_payment_id || "-"}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}