# 💳 Stripe Payment Integration - Code Examples

## Table of Contents

1. [Basic Payment Intent](#basic-payment-intent)
2. [Payment with Metadata](#payment-with-metadata)
3. [Handling Payment Errors](#handling-payment-errors)
4. [Payment Confirmation](#payment-confirmation)
5. [Webhook Implementation](#webhook-implementation)
6. [Refund Implementation](#refund-implementation)

---

## Basic Payment Intent

### Frontend (Angular)

```typescript
// In your component
async processPayment() {
  const amount = 5000; // $50.00 in cents

  // Create payment intent
  const response = await this.paymentService
    .createPaymentIntent(amount, 'usd')
    .toPromise();

  // Confirm payment
  const result = await this.stripe.confirmCardPayment(
    response.clientSecret,
    {
      payment_method: {
        card: this.cardElement,
        billing_details: { name: 'Customer Name' }
      }
    }
  );

  if (result.error) {
    console.error(result.error.message);
  } else {
    console.log('Payment successful!', result.paymentIntent);
  }
}
```

### Backend (Node.js)

```javascript
app.post("/api/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});
```

---

## Payment with Metadata

Metadata allows you to attach custom information to payments.

### Frontend

```typescript
processPaymentWithMetadata() {
  const metadata = {
    orderId: 'ORDER-12345',
    customerId: 'CUST-67890',
    productName: 'Premium Subscription',
    quantity: '1'
  };

  this.paymentService
    .createPaymentIntent(5000, 'usd', metadata)
    .subscribe(response => {
      // Continue with payment confirmation
    });
}
```

### Backend

```javascript
app.post("/api/create-payment-intent", async (req, res) => {
  const { amount, metadata } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    metadata: metadata, // Metadata will be visible in Stripe Dashboard
    automatic_payment_methods: { enabled: true },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});
```

---

## Handling Payment Errors

### Frontend Error Handling

```typescript
async handlePayment() {
  try {
    // Create payment intent
    const paymentIntent = await this.paymentService
      .createPaymentIntent(this.amount * 100, 'usd')
      .toPromise();

    // Confirm payment
    const { error, paymentIntent: confirmedPayment } =
      await this.stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.customerName,
              email: this.customerEmail
            }
          }
        }
      );

    if (error) {
      // Handle specific error types
      switch (error.type) {
        case 'card_error':
          this.showError(`Card Error: ${error.message}`);
          break;
        case 'validation_error':
          this.showError(`Validation Error: ${error.message}`);
          break;
        case 'invalid_request_error':
          this.showError('Invalid request. Please try again.');
          break;
        default:
          this.showError('An unexpected error occurred.');
      }
    } else if (confirmedPayment.status === 'succeeded') {
      this.showSuccess('Payment successful!');
    }

  } catch (error: any) {
    console.error('Payment error:', error);
    this.showError(error.message || 'Payment failed');
  }
}
```

### Backend Error Handling

```javascript
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "usd" } = req.body;

    // Validation
    if (!amount || amount < 50) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be at least 50 cents",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe error:", error);

    // Handle Stripe-specific errors
    if (error.type === "StripeCardError") {
      res.status(400).json({ error: error.message });
    } else if (error.type === "StripeInvalidRequestError") {
      res.status(400).json({ error: "Invalid request parameters" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
```

---

## Payment Confirmation

### Server-Side Confirmation

```javascript
app.post("/api/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check payment status
    if (paymentIntent.status === "succeeded") {
      // Payment successful - fulfill the order
      await fulfillOrder(paymentIntent);

      res.json({
        success: true,
        message: "Payment confirmed and order fulfilled",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
    } else {
      res.json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error("Confirmation error:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// Helper function to fulfill order
async function fulfillOrder(paymentIntent) {
  // Your business logic here
  console.log("Fulfilling order for payment:", paymentIntent.id);

  // Example: Update database, send confirmation email, etc.
  // await db.orders.update({
  //   paymentIntentId: paymentIntent.id,
  //   status: 'paid'
  // });
}
```

---

## Webhook Implementation

Webhooks allow you to receive real-time notifications about payment events.

### Backend Webhook Handler

```javascript
// Use raw body parser for webhook endpoint
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;

      case "charge.refunded":
        await handleRefund(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

async function handlePaymentSuccess(paymentIntent) {
  console.log("✅ Payment succeeded:", paymentIntent.id);

  // Your business logic
  // - Update order status
  // - Send confirmation email
  // - Update inventory
  // - Grant access to product/service
}

async function handlePaymentFailure(paymentIntent) {
  console.log("❌ Payment failed:", paymentIntent.id);

  // Your business logic
  // - Notify customer
  // - Log the failure
  // - Retry logic if applicable
}

async function handleRefund(charge) {
  console.log("💰 Refund processed:", charge.id);

  // Your business logic
  // - Update order status
  // - Notify customer
  // - Restore inventory
}
```

### Setting Up Webhooks

1. **Install Stripe CLI** (for local testing):

   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

2. **Get Webhook Secret**:
   The CLI will output a webhook secret (whsec\_...)

3. **Add to Environment**:

   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

4. **For Production**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhook`
   - Select events to listen for
   - Copy the webhook secret

---

## Refund Implementation

### Backend Refund Endpoint

```javascript
app.post("/api/refund", async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    // Create a refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // Optional: partial refund
      reason: reason || "requested_by_customer",
    });

    res.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({
      error: "Failed to process refund",
      message: error.message,
    });
  }
});

// Full refund
app.post("/api/refund/full", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    res.json({
      success: true,
      message: "Full refund processed",
      refund: refund,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend Refund Service

```typescript
// In payment.service.ts
refundPayment(paymentIntentId: string, amount?: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/refund`, {
    paymentIntentId,
    amount,
    reason: 'requested_by_customer'
  });
}

// In component
processRefund(paymentIntentId: string) {
  this.paymentService.refundPayment(paymentIntentId).subscribe({
    next: (response) => {
      console.log('Refund successful:', response);
      this.showSuccess('Refund processed successfully');
    },
    error: (error) => {
      console.error('Refund failed:', error);
      this.showError('Failed to process refund');
    }
  });
}
```

---

## Additional Examples

### Save Card for Future Use

```javascript
// Backend
app.post("/api/save-card", async (req, res) => {
  const { customerId, paymentMethodId } = req.body;

  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  res.json({ success: true });
});
```

### Create Customer

```javascript
app.post("/api/create-customer", async (req, res) => {
  const { email, name } = req.body;

  const customer = await stripe.customers.create({
    email: email,
    name: name,
    metadata: {
      userId: "your-internal-user-id",
    },
  });

  res.json({ customerId: customer.id });
});
```

---

## Testing Tips

1. **Use Stripe Test Cards**: Never use real card numbers in test mode
2. **Test Different Scenarios**: Success, decline, authentication required
3. **Monitor Stripe Dashboard**: Check payments in real-time
4. **Use Webhooks**: Test asynchronous event handling
5. **Error Handling**: Test all error cases

---

## Resources

- [Stripe API Reference](https://stripe.com/docs/api)
- [Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Webhook Events](https://stripe.com/docs/api/events/types)
- [Testing Guide](https://stripe.com/docs/testing)

---

**Happy Coding! 🚀**
