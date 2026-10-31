"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: string;
  currentStatus: string;
  currentTrackingCode?: string;
  currentTrackingUrl?: string;
};

const nextStatusMap: Record<string, string | null> = {
  pending: "processing",
  processing: "shipped",
  packed: "shipped",
  shipped: "completed",
  completed: null,
};

export default function OrderStatusActions({
  orderId,
  currentStatus,
  currentTrackingCode = "",
  currentTrackingUrl =
    "https://www.singpost.com/track-items",
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState(
    currentTrackingCode
  );

  const [trackingUrl, setTrackingUrl] = useState(
    currentTrackingUrl
  );

  const normalizedCurrentStatus =
    currentStatus.trim().toLowerCase();

  const nextStatus =
    nextStatusMap[normalizedCurrentStatus] ?? null;

  const requiresTrackingCode = nextStatus === "shipped";

  const updateStatus = async () => {
    if (!nextStatus) return;

    if (
      requiresTrackingCode &&
      !trackingCode.trim()
    ) {
      setError(
        "Tracking code is required before marking this order as shipped"
      );

      return;
    }

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
            tracking_code: trackingCode.trim() || null,
            tracking_url: trackingUrl.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update order"
        );
      }

      if (data?.warning) {
        setError(String(data.warning));
      }

      setTrackingCode(
        trackingCode.trim()
      );

      setTrackingUrl(
        trackingUrl.trim() ||
          currentTrackingUrl
      );

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
    processing: "Mark as Processing",
    packed: "Mark as Packed",
    shipped: "Mark as Shipped",
    completed: "Mark as Completed",
  };

  return (
    <div>
      {nextStatus ? (
        <div className="space-y-3">
          {requiresTrackingCode ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.12em] text-white/65">
                Tracking code
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(event) =>
                    setTrackingCode(event.target.value)
                  }
                  placeholder="e.g. SG123456789"
                  className="mt-1.5 w-full rounded-lg border border-white/20 bg-black/35 px-3 py-2 text-sm uppercase tracking-[0.04em] text-white outline-none transition focus:border-[#dbe351]"
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.12em] text-white/65">
                Tracking URL (optional)
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(event) =>
                    setTrackingUrl(event.target.value)
                  }
                  placeholder="https://carrier.com/track/..."
                  className="mt-1.5 w-full rounded-lg border border-white/20 bg-black/35 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none transition focus:border-[#dbe351]"
                />
              </label>
            </div>
          ) : null}

          <button
            type="button"
            disabled={
              loading ||
              (requiresTrackingCode &&
                !trackingCode.trim())
            }
            onClick={updateStatus}
            className="rounded-full bg-[#dbe351] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#eef783] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Updating..."
              : buttonLabel[nextStatus]}
          </button>
        </div>
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