// Stripe Payment Integration for FitAI Coach
// This file handles client-side Stripe Checkout and subscription management

// ============================================================
// IMPORTANT: Replace with your actual keys
// - STRIPE_PUBLISHABLE_KEY: Get from Stripe Dashboard > Developers > API keys
// - CLOUD_FUNCTIONS_URL: Your Firebase Cloud Functions base URL
//   e.g., https://us-central1-fitai-coach-ad084.cloudfunctions.net
// ============================================================

const STRIPE_CONFIG = {
    publishableKey: 'pk_live_51Sp67CGyWowgwdltTnEbaWLYoTMPyUO25UvBdhK0j6T4tzDf5Y5LnBv39H5FoBJBmhTNR6RmxyH0w60kK1OS339a009AVwobVl',
    cloudFunctionsUrl: 'https://us-central1-fitai-coach-ad084.cloudfunctions.net',
    // Cloud Run URLs (2nd Gen functions)
    createCheckoutUrl: 'https://createcheckoutsession-ow42qa5fnq-uc.a.run.app',
    createPortalUrl: 'https://createportalsession-ow42qa5fnq-uc.a.run.app',
    webhookUrl: 'https://stripewebhook-ow42qa5fnq-uc.a.run.app',
    checkStatusUrl: 'https://checksubscriptionstatus-ow42qa5fnq-uc.a.run.app',
};

let stripeInstance = null;

// Initialize Stripe
function initStripe() {
    if (typeof Stripe !== 'undefined' && STRIPE_CONFIG.publishableKey !== 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY') {
        stripeInstance = Stripe(STRIPE_CONFIG.publishableKey);
        console.log('Stripe initialized successfully');
        return true;
    } else {
        console.warn('Stripe not initialized. Please set your publishable key in stripe-payment.js');
        return false;
    }
}

// Start Stripe Checkout for Premium subscription
async function startStripeCheckout() {
    const user = getCurrentUser();
    if (!user) {
        alert(currentLanguage === 'en' ?
            'Please log in first to subscribe.' :
            'Sila log masuk terlebih dahulu untuk melanggan.');
        return;
    }

    // Check if Stripe is configured
    if (!stripeInstance) {
        if (!initStripe()) {
            // Fallback: Stripe not configured yet, show message
            alert(currentLanguage === 'en' ?
                'Payment system is being set up. Please try again later.' :
                'Sistem pembayaran sedang disediakan. Sila cuba lagi kemudian.');
            return;
        }
    }

    const userId = user.uid;
    const userEmail = user.email || userData.email || '';

    // Show loading
    showLoading(currentLanguage === 'en' ? 'Redirecting to payment...' : 'Mengalihkan ke pembayaran...');

    try {
        const response = await fetch(STRIPE_CONFIG.createCheckoutUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userEmail }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Redirect to Stripe Checkout
        if (data.url) {
            window.location.href = data.url;
        } else if (data.sessionId) {
            const result = await stripeInstance.redirectToCheckout({ sessionId: data.sessionId });
            if (result.error) {
                throw new Error(result.error.message);
            }
        }
    } catch (error) {
        console.error('Stripe checkout error:', error);
        hideLoading();
        alert(currentLanguage === 'en' ?
            'Error starting payment. Please try again.' :
            'Ralat memulakan pembayaran. Sila cuba lagi.');
    }
}

// Open Stripe Customer Portal (manage subscription, cancel, update card)
async function openCustomerPortal() {
    const user = getCurrentUser();
    if (!user) return;

    showLoading(currentLanguage === 'en' ? 'Opening subscription management...' : 'Membuka pengurusan langganan...');

    try {
        const response = await fetch(STRIPE_CONFIG.createPortalUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        window.location.href = data.url;
    } catch (error) {
        console.error('Portal error:', error);
        hideLoading();
        alert(currentLanguage === 'en' ?
            'Error opening subscription management. Please try again.' :
            'Ralat membuka pengurusan langganan. Sila cuba lagi.');
    }
}

// Check subscription status from Firestore via Cloud Function
async function checkSubscriptionFromServer() {
    const user = getCurrentUser();
    if (!user) return false;

    try {
        const response = await fetch(STRIPE_CONFIG.checkStatusUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid }),
        });

        const data = await response.json();

        if (data.isPremium) {
            localStorage.setItem('isPremium', 'true');
            localStorage.setItem('subscriptionStatus', data.subscriptionStatus);
            updateSubscriptionUI(true, data.subscriptionStatus);
            return true;
        } else {
            localStorage.setItem('isPremium', 'false');
            localStorage.setItem('subscriptionStatus', data.subscriptionStatus || 'none');
            updateSubscriptionUI(false, data.subscriptionStatus);
            return false;
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
        return isPremium();
    }
}

// Update the subscription UI elements
function updateSubscriptionUI(premium, status) {
    const badge = document.getElementById('subscription-badge');
    if (!badge) return;

    if (premium) {
        badge.innerHTML = '<span data-en="Premium Plan" data-bm="Pelan Premium">Premium Plan</span>';
        badge.className = 'status-badge premium';
    } else {
        badge.innerHTML = '<span data-en="Free Plan" data-bm="Pelan Percuma">Free Plan</span>';
        badge.className = 'status-badge free';
    }

    // Update the subscription modal buttons
    const upgradeBtn = document.querySelector('.pricing-card.featured .btn-primary');
    const freeBtn = document.querySelector('.pricing-card:not(.featured) .btn-secondary');

    if (premium && upgradeBtn) {
        upgradeBtn.textContent = currentLanguage === 'en' ? 'Manage Subscription' : 'Urus Langganan';
        upgradeBtn.onclick = openCustomerPortal;
    }

    if (premium && freeBtn) {
        freeBtn.disabled = false;
        freeBtn.textContent = currentLanguage === 'en' ? 'Downgrade' : 'Turun Taraf';
        freeBtn.onclick = openCustomerPortal;
    }

    // Show/hide manage subscription button in settings
    const manageBtn = document.getElementById('manage-subscription-btn');
    if (manageBtn) {
        manageBtn.style.display = premium ? 'inline-block' : 'none';
    }
}

// Handle payment result from URL parameters (after Stripe redirect)
function handlePaymentResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success') {
        // Payment successful — verify with server
        localStorage.setItem('isPremium', 'true');
        updateSubscriptionUI(true, 'active');

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Show success message after a short delay
        setTimeout(() => {
            showPaymentSuccessModal();
        }, 500);

        // Verify with server in background
        checkSubscriptionFromServer();
    } else if (paymentStatus === 'cancelled') {
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => {
            alert(currentLanguage === 'en' ?
                'Payment was cancelled. You can try again anytime.' :
                'Pembayaran dibatalkan. Anda boleh cuba lagi bila-bila masa.');
        }, 500);
    }
}

// Show payment success modal
function showPaymentSuccessModal() {
    const modal = document.getElementById('payment-success-modal');
    if (modal) {
        modal.classList.add('active');
    } else {
        alert(currentLanguage === 'en' ?
            '🎉 Welcome to Premium! You now have access to all features.' :
            '🎉 Selamat datang ke Premium! Anda kini mempunyai akses kepada semua ciri.');
    }
}

function closePaymentSuccessModal() {
    const modal = document.getElementById('payment-success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize Stripe on page load
document.addEventListener('DOMContentLoaded', () => {
    initStripe();
    handlePaymentResult();

    // Check subscription status periodically (every 5 minutes)
    setTimeout(() => {
        checkSubscriptionFromServer();
    }, 3000);

    setInterval(() => {
        checkSubscriptionFromServer();
    }, 5 * 60 * 1000);
});
