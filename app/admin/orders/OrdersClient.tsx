"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string | null;
  total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  order_items: OrderItem[];
};

type Props = {
  orders: Order[];
};

const filters = [
  "all",
  "processing",
  "packed",
  "shipped",
  "completed",
] as const;

function getStatusClass(status: string) {
  switch (status) {
    case "processing":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

    case "packed":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";

    case "shipped":
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";

    case "completed":
      return "border-green-500/30 bg-green-500/10 text-green-300";

    default:
      return "border-white/20 bg-white/5 text-white/60";
  }
}

export default function OrdersClient({
  orders,
}: Props) {
  const [filter, setFilter] =
    useState<(typeof filters)[number]>("all");

  const [search, setSearch] =
    useState("");

  const filteredOrders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        filter === "all" ||
        order.order_status === filter;

      const matchesSearch =
        !query ||
        order.order_number
          .toLowerCase()
          .includes(query) ||
        order.customer_name
          .toLowerCase()
          .includes(query) ||
        order.email
          .toLowerCase()
          .includes(query) ||
        order.phone
          ?.toLowerCase()
          .includes(query);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [orders, filter, search]);

  return (
    <div className="mt-8">

      {/* Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex flex-wrap gap-2">
          {filters.map((status) => {
            const active =
              filter === status;

            return (
              <button
                key={status}
                onClick={() =>
                  setFilter(status)
                }
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  active
                    ? "bg-[#dbe351] text-black"
                    : "border border-white/15 text-white/60 hover:border-[#dbe351] hover:text-[#dbe351]"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <input
          type="search"
          placeholder="Search order or customer..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          className="w-full rounded-full border border-white/15 bg-[#191c24] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#dbe351] lg:max-w-sm"
        />
      </div>

      <p className="mt-5 text-xs text-white/40">
        {filteredOrders.length}{" "}
        {filteredOrders.length === 1
          ? "order"
          : "orders"}
      </p>

      {/* Desktop */}
      <div className="mt-3 hidden overflow-hidden rounded-2xl border border-white/15 bg-black/35 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-white/50">
              <tr>
                <th className="px-4 py-3">
                  Order
                </th>

                <th className="px-4 py-3">
                  Customer
                </th>

                <th className="px-4 py-3">
                  Items
                </th>

                <th className="px-4 py-3">
                  Total
                </th>

                <th className="px-4 py-3">
                  Payment
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(
                (order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/10 transition last:border-b-0 hover:bg-white/[0.025]"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-[#dbe351] underline-offset-4 hover:underline"
                      >
                        {
                          order.order_number
                        }
                      </Link>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {
                          order.customer_name
                        }
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {order.email}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {order.order_items?.map(
                          (item) => (
                            <p
                              key={
                                item.id
                              }
                            >
                              {
                                item.product_name
                              }{" "}
                              ×{" "}
                              {
                                item.quantity
                              }
                            </p>
                          )
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {
                        order.currency
                      }{" "}
                      {Number(
                        order.total
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs capitalize text-green-300">
                        {
                          order.payment_status
                        }
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                          order.order_status
                        )}`}
                      >
                        {
                          order.order_status
                        }
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-white/50">
                      {new Date(
                        order.created_at
                      ).toLocaleString(
                        "en-SG"
                      )}
                    </td>
                  </tr>
                )
              )}

              {!filteredOrders.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-white/40"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-3 space-y-4 md:hidden">
        {filteredOrders.map(
          (order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block rounded-2xl border border-white/15 bg-black/35 p-5 transition hover:border-[#dbe351]/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#dbe351]">
                    {
                      order.order_number
                    }
                  </p>

                  <p className="mt-1 text-sm">
                    {
                      order.customer_name
                    }
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                    order.order_status
                  )}`}
                >
                  {
                    order.order_status
                  }
                </span>
              </div>

              <div className="mt-4 space-y-1 text-sm text-white/60">
                {order.order_items?.map(
                  (item) => (
                    <p key={item.id}>
                      {item.product_name} ×{" "}
                      {item.quantity}
                    </p>
                  )
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs text-white/40">
                  {new Date(
                    order.created_at
                  ).toLocaleDateString(
                    "en-SG"
                  )}
                </span>

                <span className="font-semibold">
                  {order.currency}{" "}
                  {Number(
                    order.total
                  ).toFixed(2)}
                </span>
              </div>
            </Link>
          )
        )}

        {!filteredOrders.length ? (
          <div className="rounded-2xl border border-white/15 bg-black/35 px-5 py-12 text-center text-sm text-white/40">
            No orders found.
          </div>
        ) : null}
      </div>
    </div>
  );
}