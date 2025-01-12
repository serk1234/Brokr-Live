import { supabase } from "@/app/supabaseClient";
import { buffer } from "micro";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      // Read the raw body
      const buf = await buffer(req);

      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (!event.type) {
      res.json({ received: true });
      return;
    }

    const paymentIntent = event.data.object;

    // Retrieve customer email from the PaymentIntent object
    const customerId = paymentIntent.customer;
    let customerEmail = null;

    if (customerId) {
      try {
        // Fetch customer details from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        customerEmail = customer.email;
        console.log("Customer Email:", customerEmail);
      } catch (err) {
        console.error("Failed to retrieve customer details:", err.message);
      }
    }

    // Handle the event
    switch (event.type) {
      //   case "payment_intent.succeeded":
      case "invoice.payment_succeeded":
        const paymentIntent = event.data.object;
        console.log(event.type, customerEmail);
        console.log(paymentIntent.id);
        console.log(paymentIntent);
        console.log(paymentIntent.plan);
        var result = await supabase.from("subscriptions").insert({
          plan_name: paymentIntent.id,
          plan_detail: paymentIntent,
          plan_details: "test",
          plan_cost: "test",
          user_email: customerEmail,
          stripe_customer_id: customerId,
          stripe_subscription_id: paymentIntent.id,
          status: "sa",
        });
        console.log(result);
        break;
      case "customer.subscription.created":
        /*  const paymentIntent1 = event.data.object;
        console.log(event.type, cussubscriptiotomerEmail);
        console.log(paymentIntent1);
        console.log("PaymentIntent was successful!", paymentIntent1); */
        break;

      case "payment_intent.payment_failed":
        const paymentFailed = event.data.object;
        console.log("PaymentIntent failed!", paymentFailed);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
