"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (status === "canceled" || status === "cancelled" || status === "failed") {
      router.replace("/checkout");
      return;
    }

    if (!status || status === "completed") {
      return;
    }

    router.replace("/checkout");
  }, [status, reference, router]);

  if (status && status !== "completed") {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111319] px-4 py-8">
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#dbe351]/40 bg-white px-6 py-8 text-[#1c3324] shadow-2xl"
        role="alert"
      >
        <h1 className="mb-4 text-4xl font-bold">Payment Successful!</h1>
        <p className="text-lg text-[#4c5b51]">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
        {reference ? (
          <p className="mt-4 text-sm text-[#617267]">
            Reference: {reference}
          </p>
        ) : null}
        <div className="mt-6">
          <Link
            href="/checkout"
            className="inline-flex rounded-full border border-[#1c3324] px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#1c3324] transition hover:bg-[#1c3324] hover:text-white"
          >
            Back to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}