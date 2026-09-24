"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: string;
  currentStatus: string;
};

const statusFlow = [
  "processing",
  "packed",
  "shipped",
  "completed",
] as const;

export default function OrderStatusActions({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const updateStatus = async (
    status: string
  ) => {
    try {
      setLoading(status);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to update order"
        );
      }

      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update order"
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {statusFlow.map((status) => {
          const active =
            currentStatus === status;

          return (
            <button
              key={status}
              type="button"
              disabled={
                loading !== null ||
                active
              }
              onClick={() =>
                updateStatus(status)
              }
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                active
                  ? "cursor-default bg-[#dbe351] text-black"
                  : "border border-white/20 text-white/70 hover:border-[#dbe351] hover:text-[#dbe351]"
              } disabled:opacity-60`}
            >
              {loading === status
                ? "Updating..."
                : status}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}