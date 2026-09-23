import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";


const SINGAPORE_POSTAL_CODE_PATTERN = /^\d{6}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const block = String(body.block || "").trim();
    const street = String(body.street || "").trim();
    const unitNumber = String(body.unitNumber || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const country = String(body.country || "").trim();

    const quantity = Number.parseInt(
      String(body.quantity || ""),
      10
    );

    if (
      !name ||
      !email ||
      !phone ||
      !block ||
      !street ||
      !unitNumber ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        {
          error:
            "Name, email, phone and all address fields are required",
        },
        { status: 400 }
      );
    }

    if (country.toLowerCase() !== "singapore") {
      return NextResponse.json(
        {
          error:
            "We currently only ship to Singapore addresses.",
        },
        { status: 400 }
      );
    }

    if (!SINGAPORE_POSTAL_CODE_PATTERN.test(postalCode)) {
      return NextResponse.json(
        {
          error:
            "Enter a valid 6-digit Singapore postal code.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          error: "Quantity must be at least 1",
        },
        { status: 400 }
      );
    }

    const unitPrice = Number(
      process.env.PRODUCT_UNIT_PRICE
    );

    const shippingFee = Number(
      process.env.SHIPPING_FEE
    );

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid server product price configuration",
        },
        { status: 500 }
      );
    }

    if (
      !Number.isFinite(shippingFee) ||
      shippingFee < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid server shipping fee configuration",
        },
        { status: 500 }
      );
    }

    const subtotal = unitPrice * quantity;
    const totalAmount =
      subtotal + shippingFee;

    const orderNumber =
      `DEME-${Date.now()}`;

    const currency =
      process.env.HITPAY_CURRENCY || "SGD";

    // =========================================
    // 1. CREATE ORDER IN SUPABASE
    // =========================================

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,

        customer_name: name,
        email,
        phone,

        block,
        street,
        unit_number: unitNumber,
        postal_code: postalCode,
        country: "Singapore",

        subtotal,
        shipping_fee: shippingFee,
        total: totalAmount,
        currency,

        payment_status: "pending",
        order_status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error(
        "Supabase order creation error:",
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create order",
        },
        { status: 500 }
      );
    }

    // =========================================
    // 2. CREATE ORDER ITEM
    // =========================================

    const {
      error: orderItemError,
    } = await supabaseAdmin
      .from("order_items")
      .insert({
        order_id: order.id,
        product_name: "DEMË Clay",
        quantity,
        unit_price: unitPrice,
      });

    if (orderItemError) {
      console.error(
        "Supabase order item error:",
        orderItemError
      );

      // Clean up the order because
      // the item could not be created
      await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            "Unable to create order item",
        },
        { status: 500 }
      );
    }

    // =========================================
    // 3. CREATE HITPAY PAYMENT
    // =========================================

    const configuredMethods = (
      process.env.HITPAY_PAYMENT_METHODS || ""
    )
      .split(",")
      .map((method) => method.trim())
      .filter(Boolean);

    const apiBaseUrl =
      process.env.HITPAY_API_BASE_URL!;

    const apiKey =
      process.env.HITPAY_API_KEY!;

    const payload: Record<string, unknown> = {
      amount: totalAmount.toFixed(2),

      currency,

      name,
      email,
      phone,

      send_email: true,

      address: {
        line1: `${block} ${street}`,
        line2: unitNumber,
        city: "Singapore",
        country: "SG",
        postal_code: postalCode,
      },

      purpose: `DEMË Clay x${quantity}`,

      reference_number: orderNumber,

      redirect_url:
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    };

    if (configuredMethods.length > 0) {
      payload.payment_methods =
        configuredMethods;
    }

    const response = await fetch(
      `${apiBaseUrl}/v1/payment-requests`,
      {
        method: "POST",

        headers: {
          "X-BUSINESS-API-KEY": apiKey,
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      console.error(
        "HitPay create payment error:",
        data
      );

      // Keep the order, but mark
      // payment creation as failed
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",
        })
        .eq("id", order.id);

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

    // =========================================
    // 4. SAVE HITPAY PAYMENT REQUEST ID
    // =========================================

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        hitpay_payment_request_id:
          data.id,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error(
        "Unable to save HitPay payment request:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Payment was created but order could not be updated",
        },
        { status: 500 }
      );
    }

    // =========================================
    // 5. RETURN PAYMENT URL
    // =========================================

    return NextResponse.json({
      paymentUrl: data.url,
      paymentRequestId: data.id,
      orderNumber,
    });
  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong",
      },
      { status: 500 }
    );
  }
}