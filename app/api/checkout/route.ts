// app/api/checkout/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const orderId = `DEME-${Date.now()}`;
    const currency = process.env.HITPAY_CURRENCY || "SGD";
    const configuredMethods = (process.env.HITPAY_PAYMENT_METHODS || "")
      .split(",")
      .map((method) => method.trim())
      .filter(Boolean);

    const payload: Record<string, unknown> = {
      amount,
      currency,
      reference_number: orderId,
      redirect_url:
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    };

    // Send payment_methods only when explicitly configured and enabled in HitPay.
    if (configuredMethods.length > 0) {
      payload.payment_methods = configuredMethods;
    }

    const response = await fetch(
      `${process.env.HITPAY_API_BASE_URL}/v1/payment-requests`,
      {
        method: "POST",
        headers: {
          "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("HitPay create payment error:", data);

      return NextResponse.json(
        {
          error:
            typeof data?.message === "string"
              ? data.message
              : "Unable to create payment",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      paymentUrl: data.url,
      paymentRequestId: data.id,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}