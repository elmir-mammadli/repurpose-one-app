import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planKey } = await request.json() as { planKey: PlanKey };
  const plan = PLANS[planKey];
  if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const origin = request.headers.get("origin") ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/#pricing`,
    metadata: { user_id: user.id, plan_key: planKey },
    subscription_data: { metadata: { user_id: user.id, plan_key: planKey } },
  });

  return NextResponse.json({ url: session.url });
}
