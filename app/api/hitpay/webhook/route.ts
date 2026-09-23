import crypto from "crypto";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

type HitPayPayment = {
  id?: string;
  status?: string;
};

type HitPayPaymentRequest = {
  id?: string;
  status?: string;
  reference_number?: string;
  amount?: string | number;
  currency?: string;
  payments?: HitPayPayment[];
};

function amountsMatch(
  first: string | number | null | undefined,
  second: string | number | null | undefined
) {
  const a = Number(first);
  const b = Number(second);

  return (
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a - b) < 0.001
  );
}

export async function POST(req: Request) {
  try {
    // =========================================
    // 1. READ RAW WEBHOOK BODY
    // =========================================

    const rawBody = await req.text();

    let event: HitPayPaymentRequest;

    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error("Invalid HitPay webhook JSON");

      return new Response("Invalid JSON", {
        status: 400,
      });
    }

    console.log("HitPay webhook received:", {
      id: event.id,
      status: event.status,
      reference_number: event.reference_number,
    });

    const paymentRequestId = String(
      event.id || ""
    ).trim();

    const referenceNumber = String(
      event.reference_number || ""
    ).trim();

    if (!paymentRequestId || !referenceNumber) {
      console.error(
        "HitPay webhook missing payment request ID or reference number"
      );

      return new Response(
        "Missing payment information",
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 2. VERIFY SIGNATURE IF HITPAY SENDS ONE
    // =========================================
    //
    // Your current registered Event Webhook did
    // not send this header, so we don't reject
    // solely because it is missing.
    //
    // If HitPay sends it in Live, however,
    // verify it.

    const signature =
      req.headers.get("x-hitpay-signature");

    const hitpaySalt =
      process.env.HITPAY_SALT;

    if (signature && hitpaySalt) {
      const expectedSignature = crypto
        .createHmac(
          "sha256",
          hitpaySalt
        )
        .update(rawBody)
        .digest("hex");

      const signatureBuffer =
        Buffer.from(signature);

      const expectedBuffer =
        Buffer.from(expectedSignature);

      if (
        signatureBuffer.length !==
          expectedBuffer.length ||
        !crypto.timingSafeEqual(
          signatureBuffer,
          expectedBuffer
        )
      ) {
        console.error(
          "Invalid HitPay webhook signature"
        );

        return new Response(
          "Invalid signature",
          {
            status: 401,
          }
        );
      }
    }

    // =========================================
    // 3. FIND OUR ORDER
    // =========================================

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        total,
        currency,
        payment_status,
        order_status,
        hitpay_payment_request_id
      `)
      .eq(
        "order_number",
        referenceNumber
      )
      .single();

    if (orderError || !order) {
      console.error(
        "Order not found:",
        referenceNumber,
        orderError
      );

      return new Response(
        "Order not found",
        {
          status: 404,
        }
      );
    }

    // =========================================
    // 4. VERIFY HITPAY REQUEST ID MATCHES
    // =========================================

    if (
      order.hitpay_payment_request_id &&
      order.hitpay_payment_request_id !==
        paymentRequestId
    ) {
      console.error(
        "HitPay payment request ID mismatch",
        {
          order:
            order.hitpay_payment_request_id,
          webhook: paymentRequestId,
        }
      );

      return new Response(
        "Payment request mismatch",
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 5. ASK HITPAY DIRECTLY FOR THE PAYMENT
    // =========================================
    //
    // Do NOT trust the webhook JSON by itself.
    // Verify the payment with HitPay's API.

    const apiBaseUrl =
      process.env.HITPAY_API_BASE_URL;

    const apiKey =
      process.env.HITPAY_API_KEY;

    if (!apiBaseUrl || !apiKey) {
      console.error(
        "Missing HitPay server configuration"
      );

      return new Response(
        "Server configuration error",
        {
          status: 500,
        }
      );
    }

    const hitpayResponse = await fetch(
      `${apiBaseUrl}/v1/payment-requests/${encodeURIComponent(
        paymentRequestId
      )}`,
      {
        method: "GET",

        headers: {
          "X-BUSINESS-API-KEY":
            apiKey,
          Accept: "application/json",
        },

        cache: "no-store",
      }
    );

    if (!hitpayResponse.ok) {
      const responseText =
        await hitpayResponse.text();

      console.error(
        "Unable to verify payment with HitPay:",
        hitpayResponse.status,
        responseText
      );

      // Returning 500 allows HitPay to retry.
      return new Response(
        "Payment verification failed",
        {
          status: 500,
        }
      );
    }

    const verifiedPayment:
      HitPayPaymentRequest =
        await hitpayResponse.json();

    // =========================================
    // 6. VERIFY PAYMENT BELONGS TO THIS ORDER
    // =========================================

    if (
      verifiedPayment.id !==
      paymentRequestId
    ) {
      console.error(
        "Verified payment ID mismatch"
      );

      return new Response(
        "Payment ID mismatch",
        {
          status: 400,
        }
      );
    }

    if (
      verifiedPayment.reference_number !==
      order.order_number
    ) {
      console.error(
        "Verified reference number mismatch"
      );

      return new Response(
        "Reference mismatch",
        {
          status: 400,
        }
      );
    }

    if (
      !amountsMatch(
        verifiedPayment.amount,
        order.total
      )
    ) {
      console.error(
        "Verified payment amount mismatch",
        {
          hitpay:
            verifiedPayment.amount,
          order: order.total,
        }
      );

      return new Response(
        "Amount mismatch",
        {
          status: 400,
        }
      );
    }

    if (
      String(
        verifiedPayment.currency || ""
      ).toUpperCase() !==
      String(
        order.currency || ""
      ).toUpperCase()
    ) {
      console.error(
        "Verified payment currency mismatch"
      );

      return new Response(
        "Currency mismatch",
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 7. GET VERIFIED PAYMENT STATUS
    // =========================================

    const verifiedStatus =
      String(
        verifiedPayment.status || ""
      ).toLowerCase();

    const successfulPayment =
      verifiedPayment.payments?.find(
        (payment) =>
          String(
            payment.status || ""
          ).toLowerCase() ===
          "succeeded"
      );

    // =========================================
    // 8. PAYMENT COMPLETED
    // =========================================

    if (
      verifiedStatus === "completed" &&
      successfulPayment
    ) {
      // Webhooks can be delivered more than once.
      // Don't reset an already-processed order.

      if (
        order.payment_status === "paid"
      ) {
        console.log(
          `Order ${referenceNumber} is already paid`
        );

        return new Response("OK", {
          status: 200,
        });
      }

      const {
        error: updateError,
      } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",

          // Payment completed means we're now
          // preparing the physical order.
          order_status: "processing",

          hitpay_payment_id:
            successfulPayment.id ??
            null,

          hitpay_payment_request_id:
            paymentRequestId,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          order.id
        );

      if (updateError) {
        console.error(
          "Supabase payment update error:",
          updateError
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

      return new Response("OK", {
        status: 200,
      });
    }

    // =========================================
    // 9. PAYMENT FAILED
    // =========================================

    if (verifiedStatus === "failed") {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          order.id
        )
        .neq(
          "payment_status",
          "paid"
        );

      if (updateError) {
        console.error(
          "Supabase failed-payment update error:",
          updateError
        );

        return new Response(
          "Database update failed",
          {
            status: 500,
          }
        );
      }

      console.log(
        `Order ${referenceNumber} marked as failed`
      );
    }

    // =========================================
    // 10. ACKNOWLEDGE WEBHOOK
    // =========================================

    return new Response("OK", {
      status: 200,
    });
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