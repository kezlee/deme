"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: string;
  currentStatus: string;
};

const nextStatusMap: Record<string, string | null> = {
  processing: "packed",
  packed: "shipped",
  shipped: "completed",
  completed: null,
};

export default function OrderStatusActions({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextStatus = nextStatusMap[currentStatus] ?? null;

  const updateStatus = async () => {
    if (!nextStatus) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update order"
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
      setLoading(false);
    }
  };

  const buttonLabel: Record<string, string> = {
    packed: "Mark as Packed",
    shipped: "Mark as Shipped",
    completed: "Mark as Completed",
  };

  return (
    <div>
      {nextStatus ? (
        <button
          type="button"
          disabled={loading}
          onClick={updateStatus}
          className="rounded-full bg-[#dbe351] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#eef783] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Updating..."
            : buttonLabel[nextStatus]}
        </button>
      ) : (
        <p className="text-sm text-green-300">
          Order completed
        </p>
      )}

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}