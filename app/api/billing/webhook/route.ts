import { NextResponse } from "next/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const planKey = session.metadata?.plan_key as PlanKey | undefined;
    if (!userId || !planKey) return NextResponse.json({ ok: true });

    const plan = PLANS[planKey];
    const customerId = session.customer as string;

    await supabase.from("profiles").update({
      stripe_customer_id: customerId,
      stripe_subscription_id: session.subscription as string,
      plan: plan.name.toLowerCase(),
      credits: plan.credits,
    }).eq("id", userId);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.user_id;
    if (!userId) return NextResponse.json({ ok: true });

    await supabase.from("profiles").update({
      plan: "free",
      stripe_subscription_id: null,
      credits: 15,
    }).eq("id", userId);
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
    const subId = invoice.subscription;
    if (!subId) return NextResponse.json({ ok: true });

    const sub = await stripe.subscriptions.retrieve(subId);
    const userId = sub.metadata?.user_id;
    const planKey = sub.metadata?.plan_key as PlanKey | undefined;
    if (!userId || !planKey) return NextResponse.json({ ok: true });

    await supabase.from("profiles")
      .update({ credits: PLANS[planKey].credits })
      .eq("id", userId);
  }

  return NextResponse.json({ ok: true });
}
