import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerId, returnUrl } = req.body;

  if (!customerId || !returnUrl) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error.message);
    res.status(500).json({ error: error.message });
  }
}
