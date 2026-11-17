import Stripe from "stripe";

/**
 * Returns an initialized Stripe server instance if valid keys are provided.
 * Gracefully returns null if keys are missing or placeholders.
 */
export function getStripeServer(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (
    !secretKey ||
    secretKey.includes("sample_key") ||
    secretKey.includes("your_") ||
    (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_"))
  ) {
    return null;
  }

  try {
    return new Stripe(secretKey, {
      apiVersion: "2024-09-30.acacia" as any,
      typescript: true,
    });
  } catch (error) {
    console.error("Failed to initialize Stripe client:", error);
    return null;
  }
}

/**
 * Checks whether live or test Stripe keys are actively configured
 */
export function isStripeConfigured(): boolean {
  return getStripeServer() !== null && getStripePublishableKey() !== null;
}

/**
 * Returns public publishable key if valid
 */
export function getStripePublishableKey(): string | null {
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (
    !pubKey ||
    pubKey.includes("sample_key") ||
    pubKey.includes("your_") ||
    (!pubKey.startsWith("pk_test_") && !pubKey.startsWith("pk_live_"))
  ) {
    return null;
  }
  return pubKey;
}
