package com.mindpilot.fitaicoach

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    companion object {
        const val TAG = "MainActivity"
    }

    private var revenueCatBridge: RevenueCatBridge? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Get the Capacitor WebView and attach the RevenueCat JavaScript bridge
        bridge?.webView?.let { webView ->
            revenueCatBridge = RevenueCatBridge(this, webView)
            webView.addJavascriptInterface(revenueCatBridge!!, RevenueCatBridge.BRIDGE_NAME)
            Log.d(TAG, "RevenueCat JavaScript bridge attached to WebView")
        }

        // Listen for real-time subscription updates
        SubscriptionManager.listenForUpdates(object : SubscriptionManager.SubscriptionCallback {
            override fun onSubscriptionStatusChanged(isPremium: Boolean, activeEntitlements: List<String>) {
                Log.d(TAG, "Subscription status changed: isPremium=$isPremium")
                bridge?.webView?.let { webView ->
                    runOnUiThread {
                        webView.evaluateJavascript(
                            "if(window.onRevenueCatPremiumStatus) window.onRevenueCatPremiumStatus($isPremium);",
                            null
                        )
                    }
                }
            }

            override fun onError(errorMessage: String) {
                Log.e(TAG, "Subscription listener error: $errorMessage")
            }
        })
    }

    @Deprecated("Use registerForActivityResult instead")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        when (requestCode) {
            RevenueCatBridge.PAYWALL_REQUEST_CODE -> {
                revenueCatBridge?.onPaywallResult(resultCode)
            }
            RevenueCatBridge.CUSTOMER_CENTER_REQUEST_CODE -> {
                // Customer Center closed — refresh subscription status
                revenueCatBridge?.checkPremiumStatus()
            }
        }
    }
}
