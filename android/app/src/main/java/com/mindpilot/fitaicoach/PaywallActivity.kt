package com.mindpilot.fitaicoach

import android.app.Activity
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialog
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialogOptions
import com.revenuecat.purchases.ui.revenuecatui.PaywallListener

class PaywallActivity : ComponentActivity() {

    companion object {
        const val TAG = "PaywallActivity"
        const val RESULT_PURCHASED = 100
        const val RESULT_CANCELLED = 101
        const val RESULT_ERROR = 102
    }

    @OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            PaywallDialog(
                PaywallDialogOptions.Builder()
                    .setDismissRequest {
                        Log.d(TAG, "Paywall dismissed")
                        setResult(RESULT_CANCELLED)
                        finish()
                    }
                    .setListener(object : PaywallListener {
                        override fun onPurchaseCompleted(
                            customerInfo: com.revenuecat.purchases.CustomerInfo,
                            storeTransaction: com.revenuecat.purchases.models.StoreTransaction
                        ) {
                            Log.d(TAG, "Purchase completed: ${storeTransaction.productIds}")
                            val isPro = customerInfo.entitlements[FitAICoachApp.ENTITLEMENT_ID]?.isActive == true
                            Log.d(TAG, "Is Pro after purchase: $isPro")
                            setResult(RESULT_PURCHASED)
                            finish()
                        }

                        override fun onRestoreCompleted(
                            customerInfo: com.revenuecat.purchases.CustomerInfo
                        ) {
                            Log.d(TAG, "Restore completed")
                            val isPro = customerInfo.entitlements[FitAICoachApp.ENTITLEMENT_ID]?.isActive == true
                            if (isPro) {
                                setResult(RESULT_PURCHASED)
                                finish()
                            }
                        }

                        override fun onPurchaseError(error: com.revenuecat.purchases.PurchasesError) {
                            Log.e(TAG, "Purchase error: ${error.message}")
                            setResult(RESULT_ERROR)
                            finish()
                        }

                        override fun onPurchaseCancelled() {
                            Log.d(TAG, "Purchase cancelled by user")
                            setResult(RESULT_CANCELLED)
                            finish()
                        }
                    })
                    .build()
            )
        }
    }
}
