package com.mindpilot.fitaicoach

import android.app.Activity
import android.content.Intent
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView

/**
 * JavaScript bridge that exposes RevenueCat functionality to the WebView.
 * Methods annotated with @JavascriptInterface can be called from JavaScript via:
 *   window.RevenueCat.methodName(args)
 */
class RevenueCatBridge(
    private val activity: Activity,
    private val webView: WebView
) {

    companion object {
        const val TAG = "RevenueCatBridge"
        const val BRIDGE_NAME = "RevenueCat"
        const val PAYWALL_REQUEST_CODE = 1001
        const val CUSTOMER_CENTER_REQUEST_CODE = 1002
    }

    /**
     * Show the RevenueCat Paywall UI.
     * Called from JS: window.RevenueCat.showPaywall()
     */
    @JavascriptInterface
    fun showPaywall() {
        Log.d(TAG, "showPaywall() called from JavaScript")
        activity.runOnUiThread {
            val intent = Intent(activity, PaywallActivity::class.java)
            activity.startActivityForResult(intent, PAYWALL_REQUEST_CODE)
        }
    }

    /**
     * Show the RevenueCat Customer Center UI.
     * Called from JS: window.RevenueCat.showCustomerCenter()
     */
    @JavascriptInterface
    fun showCustomerCenter() {
        Log.d(TAG, "showCustomerCenter() called from JavaScript")
        activity.runOnUiThread {
            val intent = Intent(activity, CustomerCenterActivity::class.java)
            activity.startActivityForResult(intent, CUSTOMER_CENTER_REQUEST_CODE)
        }
    }

    /**
     * Check if the user has the Pro entitlement.
     * Called from JS: window.RevenueCat.checkPremiumStatus()
     * Result is delivered via: window.onRevenueCatPremiumStatus(isPremium)
     */
    @JavascriptInterface
    fun checkPremiumStatus() {
        Log.d(TAG, "checkPremiumStatus() called from JavaScript")
        SubscriptionManager.isPremium { isPremium ->
            activity.runOnUiThread {
                webView.evaluateJavascript(
                    "if(window.onRevenueCatPremiumStatus) window.onRevenueCatPremiumStatus($isPremium);",
                    null
                )
            }
        }
    }

    /**
     * Get full subscription status as JSON.
     * Called from JS: window.RevenueCat.getSubscriptionStatus()
     * Result is delivered via: window.onRevenueCatSubscriptionStatus(jsonString)
     */
    @JavascriptInterface
    fun getSubscriptionStatus() {
        Log.d(TAG, "getSubscriptionStatus() called from JavaScript")
        SubscriptionManager.getSubscriptionStatusJson { json ->
            activity.runOnUiThread {
                webView.evaluateJavascript(
                    "if(window.onRevenueCatSubscriptionStatus) window.onRevenueCatSubscriptionStatus($json);",
                    null
                )
            }
        }
    }

    /**
     * Identify the user with their Firebase UID.
     * Called from JS: window.RevenueCat.loginUser(firebaseUid)
     * Result is delivered via: window.onRevenueCatLogin(success)
     */
    @JavascriptInterface
    fun loginUser(firebaseUid: String) {
        Log.d(TAG, "loginUser() called from JavaScript with UID: $firebaseUid")
        SubscriptionManager.loginUser(firebaseUid) { success ->
            activity.runOnUiThread {
                webView.evaluateJavascript(
                    "if(window.onRevenueCatLogin) window.onRevenueCatLogin($success);",
                    null
                )
            }
        }
    }

    /**
     * Log out the current user from RevenueCat.
     * Called from JS: window.RevenueCat.logoutUser()
     */
    @JavascriptInterface
    fun logoutUser() {
        Log.d(TAG, "logoutUser() called from JavaScript")
        SubscriptionManager.logoutUser()
    }

    /**
     * Restore previous purchases.
     * Called from JS: window.RevenueCat.restorePurchases()
     * Result is delivered via: window.onRevenueCatRestore(success, message)
     */
    @JavascriptInterface
    fun restorePurchases() {
        Log.d(TAG, "restorePurchases() called from JavaScript")
        SubscriptionManager.restorePurchases(
            onSuccess = { customerInfo ->
                val isPro = customerInfo.entitlements[FitAICoachApp.ENTITLEMENT_ID]?.isActive == true
                activity.runOnUiThread {
                    webView.evaluateJavascript(
                        "if(window.onRevenueCatRestore) window.onRevenueCatRestore(true, 'Purchases restored successfully');",
                        null
                    )
                    // Also update premium status
                    webView.evaluateJavascript(
                        "if(window.onRevenueCatPremiumStatus) window.onRevenueCatPremiumStatus($isPro);",
                        null
                    )
                }
            },
            onError = { error ->
                activity.runOnUiThread {
                    webView.evaluateJavascript(
                        "if(window.onRevenueCatRestore) window.onRevenueCatRestore(false, '${error.replace("'", "\\'")}');",
                        null
                    )
                }
            }
        )
    }

    /**
     * Called from the Activity when PaywallActivity returns a result.
     */
    fun onPaywallResult(resultCode: Int) {
        when (resultCode) {
            PaywallActivity.RESULT_PURCHASED -> {
                Log.d(TAG, "Paywall result: PURCHASED")
                SubscriptionManager.isPremium { isPremium ->
                    activity.runOnUiThread {
                        webView.evaluateJavascript(
                            "if(window.onRevenueCatPurchaseComplete) window.onRevenueCatPurchaseComplete(true);",
                            null
                        )
                        webView.evaluateJavascript(
                            "if(window.onRevenueCatPremiumStatus) window.onRevenueCatPremiumStatus($isPremium);",
                            null
                        )
                    }
                }
            }
            PaywallActivity.RESULT_CANCELLED -> {
                Log.d(TAG, "Paywall result: CANCELLED")
                activity.runOnUiThread {
                    webView.evaluateJavascript(
                        "if(window.onRevenueCatPurchaseComplete) window.onRevenueCatPurchaseComplete(false);",
                        null
                    )
                }
            }
            PaywallActivity.RESULT_ERROR -> {
                Log.d(TAG, "Paywall result: ERROR")
                activity.runOnUiThread {
                    webView.evaluateJavascript(
                        "if(window.onRevenueCatPurchaseComplete) window.onRevenueCatPurchaseComplete(false);",
                        null
                    )
                }
            }
        }
    }
}
