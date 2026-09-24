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

    if (!ALLOWED_STATUSES.includes(orderStatus)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    const {
      data: order,
      error,
    } = await supabaseAdmin
      .from("orders")
      .update({
        order_status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !order) {
      console.error(
        "Unable to update order:",
        error
      );

      return NextResponse.json(
        { error: "Unable to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
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