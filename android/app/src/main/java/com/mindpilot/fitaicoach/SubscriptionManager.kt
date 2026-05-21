package com.mindpilot.fitaicoach

import android.app.Activity
import android.util.Log
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesError
import com.revenuecat.purchases.interfaces.ReceiveCustomerInfoCallback
import com.revenuecat.purchases.interfaces.UpdatedCustomerInfoListener

object SubscriptionManager {

    private const val TAG = "SubscriptionManager"

    interface SubscriptionCallback {
        fun onSubscriptionStatusChanged(isPremium: Boolean, activeEntitlements: List<String>)
        fun onError(errorMessage: String)
    }

    /**
     * Check if the user has the "fitai-coach Pro" entitlement.
     */
    fun isPremium(callback: (Boolean) -> Unit) {
        Purchases.sharedInstance.getCustomerInfo(object : ReceiveCustomerInfoCallback {
            override fun onReceived(customerInfo: CustomerInfo) {
                val entitlement = customerInfo.entitlements[FitAICoachApp.ENTITLEMENT_ID]
                val isActive = entitlement?.isActive == true
                Log.d(TAG, "isPremium check: $isActive")
                callback(isActive)
            }

            override fun onError(error: PurchasesError) {
                Log.e(TAG, "Error checking premium status: ${error.message}")
                callback(false)
            }
        })
    }

    /**
     * Get full customer info including all entitlements, active subscriptions, etc.
     */
    fun getCustomerInfo(
        onSuccess: (CustomerInfo) -> Unit,
        onError: (String) -> Unit
    ) {
        Purchases.sharedInstance.getCustomerInfo(object : ReceiveCustomerInfoCallback {
            override fun onReceived(customerInfo: CustomerInfo) {
                Log.d(TAG, "Customer info received:")
                Log.d(TAG, "  Original App User ID: ${customerInfo.originalAppUserId}")
                Log.d(TAG, "  Active Entitlements: ${customerInfo.entitlements.active.keys}")
                Log.d(TAG, "  Active Subscriptions: ${customerInfo.activeSubscriptions}")
                onSuccess(customerInfo)
            }

            override fun onError(error: PurchasesError) {
                Log.e(TAG, "Error getting customer info: ${error.message}")
                onError(error.message)
            }
        })
    }

    /**
     * Identify the user with a Firebase UID so RevenueCat can track them across devices.
     */
    fun loginUser(firebaseUid: String, onComplete: (Boolean) -> Unit) {
        Purchases.sharedInstance.logIn(
            firebaseUid,
            callback = object : com.revenuecat.purchases.interfaces.LogInCallback {
                override fun onReceived(customerInfo: CustomerInfo, created: Boolean) {
                    Log.d(TAG, "User logged in to RevenueCat: $firebaseUid (created: $created)")
                    onComplete(true)
                }

                override fun onError(error: PurchasesError) {
                    Log.e(TAG, "Error logging in to RevenueCat: ${error.message}")
                    onComplete(false)
                }
            }
        )
    }

    /**
     * Log out the current user from RevenueCat (resets to anonymous).
     */
    fun logoutUser() {
        Purchases.sharedInstance.logOut(object : ReceiveCustomerInfoCallback {
            override fun onReceived(customerInfo: CustomerInfo) {
                Log.d(TAG, "User logged out from RevenueCat")
            }

            override fun onError(error: PurchasesError) {
                Log.e(TAG, "Error logging out from RevenueCat: ${error.message}")
            }
        })
    }

    /**
     * Restore purchases (useful if user reinstalls app or switches devices).
     */
    fun restorePurchases(
        onSuccess: (CustomerInfo) -> Unit,
        onError: (String) -> Unit
    ) {
        Purchases.sharedInstance.restorePurchases(object : ReceiveCustomerInfoCallback {
            override fun onReceived(customerInfo: CustomerInfo) {
                Log.d(TAG, "Purchases restored successfully")
                Log.d(TAG, "  Active Entitlements: ${customerInfo.entitlements.active.keys}")
                onSuccess(customerInfo)
            }

            override fun onError(error: PurchasesError) {
                Log.e(TAG, "Error restoring purchases: ${error.message}")
                onError(error.message)
            }
        })
    }

    /**
     * Listen for real-time customer info updates (e.g., subscription renewal, cancellation).
     */
    fun listenForUpdates(callback: SubscriptionCallback) {
        Purchases.sharedInstance.updatedCustomerInfoListener =
            UpdatedCustomerInfoListener { customerInfo ->
                val isPro = customerInfo.entitlements[FitAICoachApp.ENTITLEMENT_ID]?.isActive == true
                val activeEntitlements = customerInfo.entitlements.active.keys.toList()
                Log.d(TAG, "Customer info updated: isPro=$isPro, entitlements=$activeEntitlements")
                callback.onSubscriptionStatusChanged(isPro, activeEntitlements)
            }
    }

    /**
     * Get a JSON-friendly summary of subscription status for the WebView bridge.
     */
    fun getSubscriptionStatusJson(callback: (String) -> Unit) {
        getCustomerInfo(
            onSuccess = { customerInfo ->
                val isPro = customerInfo.entitlements[FitAICoachApp.ENTITLEMENT_ID]?.isActive == true
                val entitlement = customerInfo.entitlements[FitAICoachApp.ENTITLEMENT_ID]
                val json = buildString {
                    append("{")
                    append("\"isPremium\":$isPro,")
                    append("\"entitlementId\":\"${FitAICoachApp.ENTITLEMENT_ID}\",")
                    append("\"activeSubscriptions\":[${customerInfo.activeSubscriptions.joinToString(",") { "\"$it\"" }}],")
                    append("\"managementUrl\":\"${customerInfo.managementURL ?: ""}\",")
                    if (entitlement != null) {
                        append("\"productId\":\"${entitlement.productIdentifier}\",")
                        append("\"willRenew\":${entitlement.willRenew},")
                        append("\"periodType\":\"${entitlement.periodType}\",")
                        append("\"expirationDate\":\"${entitlement.expirationDate ?: ""}\"")
                    } else {
                        append("\"productId\":\"\",")
                        append("\"willRenew\":false,")
                        append("\"periodType\":\"\",")
                        append("\"expirationDate\":\"\"")
                    }
                    append("}")
                }
                callback(json)
            },
            onError = { error ->
                callback("{\"isPremium\":false,\"error\":\"$error\"}")
            }
        )
    }
}
