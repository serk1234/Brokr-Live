import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { customerId } = req.body;

  try {
    const session = await stripe.customerSessions.create({
      customer: customerId,
      components: { pricing_table: { enabled: true } },
    });
    res.status(200).json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
