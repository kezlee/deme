import crypto from "crypto";

export async function POST(req: Request) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-hitpay-signature");

  if (!signature) {
    return new Response("Missing signature", {
      status: 401,
    });
  }

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.HITPAY_SALT!
    )
    .update(rawBody)
    .digest("hex");

  const isValid =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

  if (!isValid) {
    return new Response("Invalid signature", {
      status: 401,
    });
  }

  const event = JSON.parse(rawBody);

  console.log("HitPay webhook:", event);

  // Example:
  // if (event.status === "completed") {
  //   find order using event.reference_number
  //   update payment_status = "paid"
  // }

  return new Response("OK", {
    status: 200,
  });
}