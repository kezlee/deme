import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase-server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

const ALLOWED_STATUSES = [
  "processing",
  "packed",
  "shipped",
  "completed",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

async function sendTrackingEmail({
  to,
  customerName,
  orderNumber,
  trackingCode,
  trackingUrl,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingCode: string;
  trackingUrl: string | null;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error(
      "Missing RESEND_API_KEY. Set this in your environment to send tracking emails."
    );
  }

  const fromEmail =
    process.env.ORDER_EMAIL_FROM ||
    "DEMË <orders@deme.com>";

  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const safeCustomerName = escapeHtml(
    customerName || "there"
  );

  const safeOrderNumber = escapeHtml(orderNumber);
  const safeTrackingCode = escapeHtml(trackingCode);

  const trackingLine = trackingUrl
    ? `
      <tr>
        <td style="padding:0 32px 28px 32px;">
          <a
            href="${trackingUrl}"
            style="display:inline-block;padding:12px 20px;border-radius:999px;background:#DBE351;color:#111319;font-weight:700;text-decoration:none;letter-spacing:0.02em;"
          >
            Track My Parcel
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 24px 32px;font-size:13px;color:#6b7280;line-height:1.5;word-break:break-all;">
          If the button does not work, copy this link:<br />
          <a href="${trackingUrl}" style="color:#4f46e5;text-decoration:none;">${trackingUrl}</a>
        </td>
      </tr>
    `
    : "";

  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Segoe UI,Arial,sans-serif;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px 32px;background:#111319;color:#DBE351;">
                <div style="font-size:24px; font-family: 'Bebas Neue', 'Arial Narrow', sans-serif; font-weight: bold;text-transform:uppercase;opacity:0.9;">DEMË</div>
                <h1 style="margin:8px 0 0 0;font-size:24px;line-height:1.3;color:#f9fafb;">Your parcel is on the way!</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 8px 32px;color:#111827;font-size:16px;line-height:1.65;">
                Hi ${safeCustomerName},<br /><br />
                Your order <strong>${safeOrderNumber}</strong> has been shipped. You can track delivery with the details below.
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 8px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px 6px 16px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Tracking Code</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px 16px;font-size:22px;font-weight:700;color:#111319;letter-spacing:0.04em;">${safeTrackingCode}</td>
                  </tr>
                </table>
              </td>
            </tr>

            ${trackingLine}

            <tr>
              <td style="padding:0 32px 28px 32px;font-size:14px;color:#4b5563;line-height:1.6;">
                Thank you for shopping with DEMË.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const text = [
    `Hi ${customerName || "there"},`,
    "",
    `Your order ${orderNumber} has been shipped and your tracking details are ready.`,
    `Tracking code: ${trackingCode}`,
    trackingUrl ? `Track your parcel: ${trackingUrl}` : "",
    "",
    "Thank you for shopping with DEMË.",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: `Your DEMË order ${orderNumber} tracking details`,
        html,
        text,
      }),
    }
  );

  if (!response.ok) {
    const emailError = await response.text();

    throw new Error(
      `Unable to send tracking email: ${emailError}`
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await req.json();

    const orderStatus = String(
      body.order_status || ""
    ).toLowerCase() as OrderStatus;

    const trackingCode = String(
      body.tracking_code || ""
    ).trim();

    const trackingUrl = String(
      body.tracking_url || ""
    ).trim();

    if (!ALLOWED_STATUSES.includes(orderStatus)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    if (
      orderStatus === "shipped" &&
      !trackingCode
    ) {
      return NextResponse.json(
        {
          error:
            "Tracking code is required before marking this order as shipped",
        },
        { status: 400 }
      );
    }

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, customer_name, email"
      )
      .eq("id", id)
      .single();

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const {
      data: order,
      error,
    } = await supabaseAdmin
      .from("orders")
      .update({
        order_status: orderStatus,
        tracking_code: trackingCode || null,
        tracking_url: trackingUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !order) {
      const missingTrackingColumn =
        error?.code === "PGRST204" ||
        error?.message
          ?.toLowerCase()
          .includes("tracking_code") ||
        error?.message
          ?.toLowerCase()
          .includes("tracking_url");

      if (missingTrackingColumn) {
        return NextResponse.json(
          {
            error:
              "Tracking columns are missing in your orders table. Add tracking_code and tracking_url columns in Supabase first.",
          },
          { status: 500 }
        );
      }

      console.error(
        "Unable to update order:",
        error
      );

      return NextResponse.json(
        { error: "Unable to update order" },
        { status: 500 }
      );
    }

    let warning: string | null = null;

    if (
      orderStatus === "shipped" &&
      trackingCode &&
      existingOrder.email
    ) {
      try {
        await sendTrackingEmail({
          to: existingOrder.email,
          customerName:
            existingOrder.customer_name || "",
          orderNumber:
            existingOrder.order_number || "",
          trackingCode,
          trackingUrl: trackingUrl || null,
        });
      } catch (emailError) {
        console.error(
          "Tracking email send failed:",
          emailError
        );

        warning =
          emailError instanceof Error
            ? emailError.message
            : "Status updated, but email could not be sent";
      }
    }

    return NextResponse.json({
      success: true,
      order,
      warning,
    });
  } catch (error) {
    console.error(
      "Admin order update error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}