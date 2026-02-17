# Stripe Payment Integration Setup Guide

## Overview
FitAI Coach uses **Stripe Checkout** for Premium subscriptions (RM29/month) with **Firebase Cloud Functions** as the backend.

## Architecture
```
User clicks "Upgrade Now"
  → Client calls Firebase Cloud Function (createCheckoutSession)
    → Cloud Function creates Stripe Checkout Session
      → User redirected to Stripe hosted payment page
        → Payment succeeds → Stripe sends webhook
          → Cloud Function (stripeWebhook) updates Firestore
            → Client reads updated subscription status
```

---

## Step 1: Stripe Account Setup

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Go to **Stripe Dashboard > Developers > API keys**
3. Copy your **Publishable key** (`pk_test_...` or `pk_live_...`)
4. Copy your **Secret key** (`sk_test_...` or `sk_live_...`)

## Step 2: Create a Stripe Product & Price

1. Go to **Stripe Dashboard > Products**
2. Click **+ Add product**
   - Name: `FitAI Coach Premium`
   - Description: `Unlimited AI-powered fitness coaching`
3. Add a **Recurring price**:
   - Amount: `RM 29.00`
   - Currency: `MYR`
   - Billing period: `Monthly`
4. Copy the **Price ID** (`price_...`)

## Step 3: Configure Client-Side

Edit `stripe-payment.js` and replace the placeholder values:

```javascript
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE',
    cloudFunctionsUrl: 'https://us-central1-fitai-coach-ad084.cloudfunctions.net',
};
```

## Step 4: Install Firebase CLI & Deploy Cloud Functions

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to project directory
cd "AI Personalized Fitness Coach"

# Install Cloud Functions dependencies
cd functions
npm install
cd ..

# Set Stripe configuration
firebase functions:config:set stripe.secret_key="sk_test_YOUR_SECRET_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"
firebase functions:config:set stripe.price_id="price_YOUR_PRICE_ID"
firebase functions:config:set app.url="https://your-deployed-app-url.com"

# Deploy Cloud Functions
firebase deploy --only functions
```

## Step 5: Set Up Stripe Webhook

1. Go to **Stripe Dashboard > Developers > Webhooks**
2. Click **+ Add endpoint**
3. Set the endpoint URL to:
   ```
   https://us-central1-fitai-coach-ad084.cloudfunctions.net/stripeWebhook
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_...`)
7. Update Firebase config:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SIGNING_SECRET"
   firebase deploy --only functions
   ```

## Step 6: Enable Stripe Customer Portal

1. Go to **Stripe Dashboard > Settings > Billing > Customer portal**
2. Enable the portal
3. Configure allowed actions:
   - Cancel subscriptions: ✅
   - Update payment methods: ✅
   - View invoices: ✅

## Step 7: Update Firestore Rules

Add these rules to allow subscription status reads:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Testing

### Use Stripe Test Mode
- Use test API keys (`pk_test_...` and `sk_test_...`)
- Test card number: `4242 4242 4242 4242`
- Any future expiry date, any CVC, any ZIP

### Test the Flow
1. Log in to FitAI Coach
2. Click "View Plans" → "Upgrade Now"
3. Complete payment with test card
4. Verify redirect back to app with success message
5. Verify `isPremium: true` in Firestore

### Test Webhook Locally
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe listen --forward-to localhost:5001/fitai-coach-ad084/us-central1/stripeWebhook

# In another terminal
firebase emulators:start --only functions
```

---

## Going Live

1. Switch to **live** Stripe API keys
2. Update `stripe-payment.js` with `pk_live_...` key
3. Update Firebase config with `sk_live_...` key
4. Create a new webhook endpoint with the live signing secret
5. Redeploy:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_YOUR_LIVE_KEY"
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_LIVE_WEBHOOK_SECRET"
   firebase deploy --only functions
   ```

---

## Files Modified/Created

| File | Purpose |
|------|---------|
| `functions/package.json` | Cloud Functions dependencies |
| `functions/index.js` | Cloud Functions (checkout, webhook, portal, status check) |
| `stripe-payment.js` | Client-side Stripe integration |
| `firebase.json` | Firebase project configuration |
| `app.html` | Added Stripe.js SDK, payment success modal |
| `app.js` | Updated `subscribePremium()` to use Stripe |

## Troubleshooting

- **"Payment system is loading"**: Stripe.js hasn't loaded. Check network/ad blockers.
- **CORS errors**: Ensure Cloud Functions are deployed and the URL in `STRIPE_CONFIG.cloudFunctionsUrl` is correct.
- **Webhook failures**: Check the signing secret matches. Use `firebase functions:log` to debug.
- **Subscription not updating**: Verify webhook events are being received in Stripe Dashboard > Developers > Webhooks > Recent events.
