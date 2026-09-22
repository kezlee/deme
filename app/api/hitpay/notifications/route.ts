import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch(
      `${process.env.HITPAY_API_BASE_URL}/v1/notifications`,
      {
        method: "PUT",
        headers: {
          "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "customer_receipt@email": true,

          "daily_collection@email": false,
          "daily_collection@push_notification": false,

          "daily_payout@email": false,

          "new_order@email": false,
          "new_order@push_notification": false,

          "pending_order@email": false,

          "incoming_payment@email": false,
          "incoming_payment@push_notification": false,
        }),
      }
    );

    const data = await response.json().catch(() => null);

    console.log("HitPay notification response:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Unable to update HitPay notification settings",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("HitPay notification setup error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}