import { NextResponse } from "next/server";

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
    const quantity = Number.parseInt(String(body.quantity || ""), 10);

    if (!name || !email || !phone || !block || !street || !unitNumber || !postalCode || !country) {
      return NextResponse.json(
        { error: "Name, email, phone and all address fields are required" },
        { status: 400 }
      );
    }

    if (country.toLowerCase() !== "singapore") {
      return NextResponse.json(
        { error: "We currently only ship to Singapore addresses." },
        { status: 400 }
      );
    }

    if (!SINGAPORE_POSTAL_CODE_PATTERN.test(postalCode)) {
      return NextResponse.json(
        { error: "Enter a valid 6-digit Singapore postal code." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    const unitPrice = Number(process.env.PRODUCT_UNIT_PRICE);
    const shippingFee = Number(process.env.SHIPPING_FEE);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid server product price configuration" },
        { status: 500 }
      );
    }

    if (!Number.isFinite(shippingFee) || shippingFee < 0) {
      return NextResponse.json(
        { error: "Invalid server shipping fee configuration" },
        { status: 500 }
      );
    }

    const subtotal = unitPrice * quantity;
    const totalAmount = subtotal + shippingFee;
    const compactAddress = `${block}, ${street}, ${unitNumber}, Singapore ${postalCode}`;
    const purpose = `DEME Clay x${quantity} | Ship to: ${compactAddress}`.slice(0, 200);

    const orderId = `DEME-${Date.now()}`;
    const currency = process.env.HITPAY_CURRENCY || "SGD";
    const configuredMethods = (process.env.HITPAY_PAYMENT_METHODS || "")
      .split(",")
      .map((method) => method.trim())
      .filter(Boolean);

    const payload: Record<string, unknown> = {
      amount: totalAmount.toFixed(2),
      currency,
      name,
      email,
      phone,
      purpose,
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