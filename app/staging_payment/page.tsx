"use client";

import { useRouter } from "next/navigation";
import Home from "../home";

export default function App() {
  const router = useRouter();

  return (
    <>
    <header className="top-bar absolute w-full z-10">
      <button
        onClick={() => router.push("/checkout")}
        className="circle-button"
        type="button"
        aria-label="Checkout"
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