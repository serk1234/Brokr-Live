import { Controller, Post, Body } from '@nestjs/common';
import Stripe from 'stripe';

@Controller('subscription')
export class SubscriptionController {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe('sk_test_...', { apiVersion: '2022-11-15' });
    }

    @Post('create-checkout-session')
    async createCheckoutSession(@Body() body: { userId: string }) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: 'price_1N...', // Your price ID from Stripe
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: 'https://yourdomain.com/profile?status=success',
            cancel_url: 'https://yourdomain.com/profile?status=cancel',
        });

        return { url: session.url };
    }
}
