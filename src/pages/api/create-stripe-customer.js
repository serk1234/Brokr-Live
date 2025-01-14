import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default async function handler(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      // Return the ID of the existing customer
      return res.status(200).json({ id: existingCustomers.data[0].id });
    }

    // Create a new customer if no match is found
    const newCustomer = await stripe.customers.create({ email });
    return res.status(200).json({ id: newCustomer.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
async function handler1(req, res) {
  const { email } = req.body;

  try {
    const customer = await stripe.customers.create({ email });
    res.status(200).json({ id: customer.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
