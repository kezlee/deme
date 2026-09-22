// app/api/checkout/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = `DEME-${Date.now()}`;

    const response = await fetch(
      `${process.env.HITPAY_API_BASE_URL}/v1/payment-requests`,
      {
        method: "POST",
        headers: {
          "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: body.amount,
          currency: "SGD",

          payment_methods: [
            "paynow_online",
            "card",
          ],

          reference_number: orderId,

          redirect_url:
            `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return NextResponse.json(
        { error: "Unable to create payment" },
        { status: 500 }
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