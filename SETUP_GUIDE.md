# 🚀 Quick Start Guide - Stripe Payment Integration with Angular 20

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Stripe Account** - [Sign up here](https://stripe.com/)

## 🔑 Getting Your Stripe Keys

1. **Log in to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Navigate to Developers → API Keys**
3. You'll find two keys:
   - **Publishable Key** (starts with `pk_test_...` for test mode)
   - **Secret Key** (starts with `sk_test_...` for test mode)

⚠️ **IMPORTANT**: Never share your Secret Key publicly!

## 📦 Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd C:\Users\Yogesh\.gemini\antigravity\scratch\stripe-angular-app
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

## ⚙️ Configuration

### Frontend Configuration

**File**: `src/environments/environment.ts`

Replace `YOUR_PUBLISHABLE_KEY_HERE` with your actual Stripe Publishable Key:

```typescript
export const environment = {
  production: false,
  stripePublishableKey: "pk_test_YOUR_ACTUAL_KEY_HERE", // ← Update this
  apiUrl: "http://localhost:3000/api",
};
```

### Backend Configuration

**File**: `server/server.js`

Find line 9 and replace `YOUR_SECRET_KEY_HERE` with your actual Stripe Secret Key:

```javascript
const stripe = require("stripe")("sk_test_YOUR_ACTUAL_KEY_HERE"); // ← Update this
```

**Alternative**: Use environment variables (recommended for production)

1. Create a `.env` file in the `server` directory:

   ```bash
   cd server
   copy .env.example .env
   ```

2. Edit `.env` and add your keys:

   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
   ```

3. Update `server/server.js` line 9:
   ```javascript
   const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
   ```

## 🏃 Running the Application

You need to run both the backend server and the Angular app.

### Option 1: Run in Separate Terminals

**Terminal 1 - Backend Server:**

```bash
cd server
npm start
```

Server will run on: http://localhost:3000

**Terminal 2 - Angular App:**

```bash
npm start
```

App will run on: http://localhost:4200

### Option 2: Run Concurrently (if you installed concurrently)

```bash
npm run serve:all
```

## 🧪 Testing the Payment

1. **Open your browser**: Navigate to http://localhost:4200

2. **Fill in the form**:

   - Name: Any name
   - Email: Any email
   - Amount: Any amount (minimum $0.50)

3. **Use Stripe Test Card**:

   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

4. **Click "Pay"** and watch the magic happen! ✨

## 📱 Test Card Numbers

Stripe provides various test cards for different scenarios:

| Card Number         | Scenario                            |
| ------------------- | ----------------------------------- |
| 4242 4242 4242 4242 | Success                             |
| 4000 0000 0000 9995 | Declined (insufficient funds)       |
| 4000 0000 0000 0002 | Declined (generic)                  |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

[Full list of test cards](https://stripe.com/docs/testing#cards)

## 🔍 Verifying Payments

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com/
2. Click on **Payments** in the left sidebar
3. You should see your test payment listed there!

## 🛠️ Project Structure

```
stripe-angular-app/
├── src/                          # Angular source code
│   ├── app/
│   │   ├── components/
│   │   │   └── payment/         # Payment component
│   │   └── services/
│   │       └── payment.service.ts  # API service
│   └── environments/            # Environment configs
├── server/                      # Backend server
│   ├── server.js               # Express server with Stripe
│   └── package.json
└── package.json                # Angular dependencies
```

## 🔐 Security Best Practices

1. **Never expose your Secret Key** in frontend code
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Validate all payments** on the server side
5. **Use webhooks** to handle asynchronous events

## 🚨 Troubleshooting

### Issue: "Stripe has not been initialized"

**Solution**: Make sure you've added your Publishable Key in `environment.ts`

### Issue: "Failed to create payment intent"

**Solution**: Check that your Secret Key is correctly set in `server/server.js`

### Issue: CORS errors

**Solution**: The server is already configured with CORS. Make sure both servers are running.

### Issue: Port already in use

**Solution**:

- For Angular (4200): `ng serve --port 4201`
- For Server (3000): Change PORT in server/.env

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Angular Integration](https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements)
- [Angular Documentation](https://angular.dev/)

## 🎯 Next Steps

1. **Implement webhooks** for handling asynchronous events
2. **Add payment history** tracking
3. **Implement refunds** functionality
4. **Add subscription** support
5. **Deploy to production** (remember to switch to live keys!)

## 💡 Tips

- Always test with Stripe's test mode before going live
- Monitor your Stripe Dashboard for payment activity
- Set up webhook endpoints for production
- Implement proper error handling and logging

---

**Need Help?** Check the Stripe documentation or open an issue in the project repository.

Happy coding! 🎉
