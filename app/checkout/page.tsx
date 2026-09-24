"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

const SINGAPORE_POSTAL_CODE_PATTERN = /^\d{6}$/;

type CheckoutFormState = {
  name: string;
  email: string;
  phone: string;
  block: string;
  street: string;
  unitNumber: string;
  postalCode: string;
  country: string;
  quantity: number;
};

export default function CheckoutPage() {
  const UNIT_PRICE = Number(process.env.NEXT_PUBLIC_PRODUCT_UNIT_PRICE);
  const SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_SHIPPING_FEE);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CheckoutFormState>({
    name: "",
    email: "",
    phone: "",
    block: "",
    street: "",
    unitNumber: "",
    postalCode: "",
    country: "Singapore",
    quantity: 1,
  });

  const subtotal = useMemo(
    () => UNIT_PRICE * form.quantity,
    [form.quantity]
  );

  const isValidPostalCode = useMemo(
    () => form.postalCode.trim().length === 0 || SINGAPORE_POSTAL_CODE_PATTERN.test(form.postalCode.trim()),
    [form.postalCode]
  );

  const total = useMemo(
    () => subtotal + SHIPPING_FEE,
    [subtotal]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!SINGAPORE_POSTAL_CODE_PATTERN.test(form.postalCode.trim())) {
      setError("Enter a valid 6-digit Singapore postal code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to create payment");
      }

      if (!data?.paymentUrl) {
        throw new Error("Payment URL was not returned by checkout API");
      }

      window.location.href = data.paymentUrl;
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Checkout failed";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-auto bg-[#111319] text-[#dbe351]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">DEME Checkout</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#dbe351]">Customer Details</h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/80 transition hover:border-[#dbe351] hover:text-[#dbe351]"
          >
            Back
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-white/15 bg-black/35 p-5 md:p-7"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/80">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="text"
                  autoComplete="name"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/80">
                Email
                <input
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="email"
                  autoComplete="email"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/80">
                Phone number
                <input
                  required
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/80">
                Quantity
                <input
                  required
                  min={1}
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: Math.max(1, Number.parseInt(event.target.value || "1", 10)),
                    }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="number"
                  inputMode="numeric"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/80">
                Block
                <input
                  required
                  value={form.block}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, block: event.target.value }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="text"
                  autoComplete="address-line1"
                  placeholder="428"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/80">
                Street
                <input
                  required
                  value={form.street}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, street: event.target.value }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="text"
                  autoComplete="address-line2"
                  placeholder="Clementi Avenue 3"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/80">
                Unit number
                <input
                  required
                  value={form.unitNumber}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, unitNumber: event.target.value }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="text"
                  autoComplete="address-line3"
                  placeholder="#10-454"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/80">
                Postal code
                <input
                  required
                  value={form.postalCode}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      postalCode: event.target.value.replace(/\D/g, "").slice(0, 6),
                    }))
                  }
                  className="rounded-lg border border-white/20 bg-[#191c24] px-3 py-2 text-sm text-white outline-none focus:border-[#dbe351]"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="120428"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/80 md:col-span-2">
                Country
                <input
                  disabled
                  value={form.country}
                  className="rounded-lg border border-white/10 bg-[#151821] px-3 py-2 text-sm text-white/70 outline-none"
                  type="text"
                />
              </label>
            </div>

            <p className="mt-2 text-xs text-white/60">
              Shipping is currently available for Singapore addresses only.
            </p>

            {!isValidPostalCode ? (
              <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
                Enter a valid 6-digit Singapore postal code.
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#dbe351] px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-[#eef783] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating payment..." : "Proceed to payment"}
            </button>
          </form>

          <aside className="rounded-2xl border border-white/15 bg-black/35 p-5 md:p-7">
            <h2 className="text-sm uppercase tracking-[0.18em] text-white/70">Order Summary</h2>

            <div className="mt-4 space-y-3 text-sm text-white/85">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Unit price</span>
                <span>SGD {UNIT_PRICE.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Quantity</span>
                <span>{form.quantity}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Subtotal</span>
                <span>SGD {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Mailing fee</span>
                <span>SGD {SHIPPING_FEE.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pt-1 text-base font-semibold text-[#dbe351]">
                <span>Total</span>
                <span>SGD {total.toFixed(2)}</span>
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-white/60">
              You will be redirected to HitPay only after submitting this form.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
