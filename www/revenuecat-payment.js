// RevenueCat Payment Integration for FitAI Coach (Android Native)
// This file bridges the WebView with the native RevenueCat SDK via the JavaScript interface.
// The native bridge is available at: window.RevenueCat

// ============================================================
// Check if running inside the native Android app
// ============================================================
function isNativeApp() {
    return typeof window.RevenueCat !== 'undefined';
}

// ============================================================
// Show the RevenueCat Paywall (native UI)
// ============================================================
function showRevenueCatPaywall() {
    if (!isNativeApp()) {
        console.warn('RevenueCat: Not running in native app, falling back to Stripe.');
        if (typeof startStripeCheckout === 'function') {
            startStripeCheckout();
        }
        return;
    }

    showLoading(currentLanguage === 'en' ? 'Opening subscription plans...' : 'Membuka pelan langganan...');
    window.RevenueCat.showPaywall();

    // Hide loading after a short delay (paywall opens as a new activity)
    setTimeout(() => { hideLoading(); }, 1000);
}

// ============================================================
// Show the RevenueCat Customer Center (manage subscription)
// ============================================================
function showRevenueCatCustomerCenter() {
    if (!isNativeApp()) {
        console.warn('RevenueCat: Not running in native app.');
        if (typeof openCustomerPortal === 'function') {
            openCustomerPortal();
        }
        return;
    }

    showLoading(currentLanguage === 'en' ? 'Opening subscription management...' : 'Membuka pengurusan langganan...');
    window.RevenueCat.showCustomerCenter();

    setTimeout(() => { hideLoading(); }, 1000);
}

// ============================================================
// Check premium status via native RevenueCat
// ============================================================
function checkRevenueCatPremium() {
    if (!isNativeApp()) return;
    window.RevenueCat.checkPremiumStatus();
}

// ============================================================
// Get full subscription status as JSON
// ============================================================
function getRevenueCatSubscriptionStatus() {
    if (!isNativeApp()) return;
    window.RevenueCat.getSubscriptionStatus();
}

// ============================================================
// Identify user with Firebase UID in RevenueCat
// ============================================================
function revenueCatLogin(firebaseUid) {
    if (!isNativeApp()) return;
    window.RevenueCat.loginUser(firebaseUid);
}

// ============================================================
// Log out user from RevenueCat
// ============================================================
function revenueCatLogout() {
    if (!isNativeApp()) return;
    window.RevenueCat.logoutUser();
}

// ============================================================
// Restore previous purchases
// ============================================================
function revenueCatRestorePurchases() {
    if (!isNativeApp()) return;

    showLoading(currentLanguage === 'en' ? 'Restoring purchases...' : 'Memulihkan pembelian...');
    window.RevenueCat.restorePurchases();
}

// ============================================================
// Callbacks from native RevenueCat SDK
// These are called by the native Android code via evaluateJavascript()
// ============================================================

// Called when premium status is checked or changes
window.onRevenueCatPremiumStatus = function(isPremium) {
    console.log('RevenueCat: Premium status = ' + isPremium);
    localStorage.setItem('isPremium', isPremium ? 'true' : 'false');

    if (typeof updateSubscriptionUI === 'function') {
        updateSubscriptionUI(isPremium, isPremium ? 'active' : 'none');
    }

    // Update the premium UI elements in the app
    if (isPremium) {
        document.body.classList.add('is-premium');
    } else {
        document.body.classList.remove('is-premium');
    }
};

// Called when a purchase completes (from PaywallActivity)
window.onRevenueCatPurchaseComplete = function(success) {
    console.log('RevenueCat: Purchase complete = ' + success);
    hideLoading();

    if (success) {
        localStorage.setItem('isPremium', 'true');
        if (typeof updateSubscriptionUI === 'function') {
            updateSubscriptionUI(true, 'active');
        }
        if (typeof showPaymentSuccessModal === 'function') {
            showPaymentSuccessModal();
        }
    }
};

// Called when subscription status JSON is received
window.onRevenueCatSubscriptionStatus = function(statusData) {
    console.log('RevenueCat: Subscription status:', statusData);

    if (statusData.isPremium) {
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('subscriptionStatus', 'active');
    } else {
        localStorage.setItem('isPremium', 'false');
        localStorage.setItem('subscriptionStatus', statusData.error ? 'error' : 'none');
    }

    if (typeof updateSubscriptionUI === 'function') {
        updateSubscriptionUI(statusData.isPremium, statusData.isPremium ? 'active' : 'none');
    }
};

// Called when RevenueCat login completes
window.onRevenueCatLogin = function(success) {
    console.log('RevenueCat: Login result = ' + success);
    if (success) {
        // After login, check premium status
        checkRevenueCatPremium();
    }
};

// Called when restore purchases completes
window.onRevenueCatRestore = function(success, message) {
    console.log('RevenueCat: Restore result = ' + success + ', message: ' + message);
    hideLoading();

    if (success) {
        alert(currentLanguage === 'en' ?
            'Purchases restored successfully!' :
            'Pembelian berjaya dipulihkan!');
    } else {
        alert(currentLanguage === 'en' ?
            'Could not restore purchases. ' + message :
            'Tidak dapat memulihkan pembelian. ' + message);
    }
};

// ============================================================
// Initialize: Auto-login and check status when the page loads
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    if (!isNativeApp()) {
        console.log('RevenueCat: Not in native app, skipping initialization.');
        return;
    }

    console.log('RevenueCat: Native bridge detected, initializing...');

    // Wait for Firebase auth to be ready, then login to RevenueCat
    var loginAttempted = false;
    var checkInterval = setInterval(function() {
        if (typeof getCurrentUser === 'function') {
            var user = getCurrentUser();
            if (user && user.uid && !loginAttempted) {
                loginAttempted = true;
                revenueCatLogin(user.uid);
                clearInterval(checkInterval);
            }
        }
    }, 1000);

    // Stop checking after 30 seconds
    setTimeout(function() { clearInterval(checkInterval); }, 30000);
});
