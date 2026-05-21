const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

// ============================================================
// Configuration is loaded from environment variables
// Set via: firebase functions:secrets:set STRIPE_SECRET_KEY
// ============================================================

let _stripe = null;
function getStripe() {
  if (!_stripe) {
    _stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// ----------------------------------------------------------
// Create Stripe Checkout Session
// Called from the client when user clicks "Upgrade Now"
// ----------------------------------------------------------
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const stripe = getStripe();
      const { userId, userEmail } = req.body;

      if (!userId || !userEmail) {
        return res.status(400).json({ error: "Missing userId or userEmail" });
      }

      const appUrl = process.env.APP_URL || "https://localhost";
      const priceId = process.env.STRIPE_PRICE_ID;

      // Check if user already has a Stripe customer ID
      const userDoc = await db.collection("users").doc(userId).get();
      let customerId = null;

      if (userDoc.exists && userDoc.data().stripeCustomerId) {
        customerId = userDoc.data().stripeCustomerId;
      } else {
        // Create a new Stripe customer
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { firebaseUID: userId },
        });
        customerId = customer.id;

        // Save Stripe customer ID to Firestore
        await db.collection("users").doc(userId).set({
          stripeCustomerId: customerId,
        }, { merge: true });
      }

      // Create checkout session for a recurring subscription
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/app.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/app.html?payment=cancelled`,
        metadata: {
          firebaseUID: userId,
        },
        subscription_data: {
          metadata: {
            firebaseUID: userId,
          },
        },
      });

      return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// ----------------------------------------------------------
// Create Stripe Customer Portal Session
// Allows users to manage their subscription (cancel, update card, etc.)
// ----------------------------------------------------------
exports.createPortalSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const stripe = getStripe();
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const appUrl = process.env.APP_URL || "https://localhost";

      // Get user's Stripe customer ID from Firestore
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists || !userDoc.data().stripeCustomerId) {
        return res.status(404).json({ error: "No Stripe customer found for this user" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: userDoc.data().stripeCustomerId,
        return_url: `${appUrl}/app.html`,
      });

      return res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// ----------------------------------------------------------
// Stripe Webhook Handler
// Listens for Stripe events to update subscription status in Firestore
// ----------------------------------------------------------
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Stripe event received:", event.type);

  try {
    switch (event.type) {
      // Checkout completed — activate subscription
      case "checkout.session.completed": {
        const session = event.data.object;
        const firebaseUID = session.metadata.firebaseUID;

        if (firebaseUID) {
          await db.collection("users").doc(firebaseUID).set({
            isPremium: true,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            subscriptionStatus: "active",
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`User ${firebaseUID} upgraded to Premium`);
        }
        break;
      }

      // Subscription updated (e.g., plan change, renewal)
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const firebaseUID = subscription.metadata.firebaseUID;

        if (firebaseUID) {
          const isActive = ["active", "trialing"].includes(subscription.status);
          await db.collection("users").doc(firebaseUID).set({
            isPremium: isActive,
            subscriptionStatus: subscription.status,
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`User ${firebaseUID} subscription updated: ${subscription.status}`);
        }
        break;
      }

      // Subscription cancelled or expired
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const firebaseUID = subscription.metadata.firebaseUID;

        if (firebaseUID) {
          await db.collection("users").doc(firebaseUID).set({
            isPremium: false,
            subscriptionStatus: "cancelled",
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`User ${firebaseUID} subscription cancelled`);
        }
        break;
      }

      // Payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find user by Stripe customer ID
        const usersSnapshot = await db
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            subscriptionStatus: "past_due",
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Payment failed for user ${userDoc.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send("Webhook processing error");
  }

  return res.status(200).json({ received: true });
});

// ----------------------------------------------------------
// Check Subscription Status
// Called from client to verify current subscription state
// ----------------------------------------------------------
exports.checkSubscriptionStatus = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const data = userDoc.data();
      return res.status(200).json({
        isPremium: data.isPremium || false,
        subscriptionStatus: data.subscriptionStatus || "none",
        stripeCustomerId: data.stripeCustomerId || null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
