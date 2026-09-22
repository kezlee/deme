"use client";

import { useState } from "react";
import Home from "../home";

export default function App() {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount: 35,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to create payment");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      throw new Error("Missing payment URL from checkout response");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Checkout failed";

      console.error("Checkout failed:", message);
      window.alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <header className="top-bar absolute w-full z-10">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="circle-button"
        type="button"
        aria-label="Contact"
      >
        <img
          src="/buynow.svg"
          alt=""
          className="buy-now-ring"
        />
        <img
          src="/arrow.svg"
          alt=""
          className="buy-now-arrow"
        />
      </button>
    </header>
    <Home />
    </>
  );
}