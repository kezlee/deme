import { supabaseAdmin } from "@/app/lib/supabase-admin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    const signature =
      req.headers.get(
        "x-hitpay-signature"
      );

    if (!signature) {
      return new Response(
        "Missing signature",
        {
          status: 401,
        }
      );
    }

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.HITPAY_SALT!
        )
        .update(rawBody)
        .digest("hex");

    if (
      signature.length !==
      expectedSignature.length
    ) {
      return new Response(
        "Invalid signature",
        {
          status: 401,
        }
      );
    }

    const isValid =
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(
          expectedSignature
        )
      );

    if (!isValid) {
      return new Response(
        "Invalid signature",
        {
          status: 401,
        }
      );
    }

    const event =
      JSON.parse(rawBody);

    console.log(
      "HitPay webhook:",
      event
    );

    const status = String(
      event.status ||
      event.data?.status ||
      ""
    ).toLowerCase();

    const referenceNumber =
      event.reference_number ||
      event.data?.reference_number;

    const paymentRequestId =
      event.payment_request_id ||
      event.id ||
      event.data?.payment_request_id ||
      event.data?.id;

    const paymentId =
      event.payment_id ||
      event.data?.payment_id ||
      null;

    if (!referenceNumber) {
      console.error(
        "HitPay webhook missing reference number:",
        event
      );

      return new Response(
        "Missing reference number",
        {
          status: 400,
        }
      );
    }

    // =========================================
    // PAYMENT COMPLETED
    // =========================================

    if (status === "completed") {
      const {
        error,
      } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "processing",

          hitpay_payment_id:
            paymentId,

          hitpay_payment_request_id:
            paymentRequestId,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "order_number",
          referenceNumber
        );

      if (error) {
        console.error(
          "Unable to update paid order:",
          error
        );

        return new Response(
          "Database update failed",
          {
            status: 500,
          }
        );
      }

      console.log(
        `Order ${referenceNumber} marked as paid`
      );
    }

    // =========================================
    // PAYMENT FAILED
    // =========================================

    if (
      status === "failed" ||
      status === "cancelled"
    ) {
      const {
        error,
      } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: status,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "order_number",
          referenceNumber
        );

      if (error) {
        console.error(
          "Unable to update failed order:",
          error
        );
      }
    }

    return new Response(
      "OK",
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "HitPay webhook error:",
      error
    );

    return new Response(
      "Webhook error",
      {
        status: 500,
      }
    );
  }
}
