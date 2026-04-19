import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PLANS = {
  creator_monthly: {
    name: "Creator",
    priceId: process.env.STRIPE_CREATOR_MONTHLY_PRICE_ID!,
    credits: 150,
    amount: 1900,
  },
  creator_annual: {
    name: "Creator",
    priceId: process.env.STRIPE_CREATOR_ANNUAL_PRICE_ID!,
    credits: 150,
    amount: 15000,
  },
  team_monthly: {
    name: "Team",
    priceId: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
    credits: 500,
    amount: 4900,
  },
  team_annual: {
    name: "Team",
    priceId: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID!,
    credits: 500,
    amount: 39000,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
