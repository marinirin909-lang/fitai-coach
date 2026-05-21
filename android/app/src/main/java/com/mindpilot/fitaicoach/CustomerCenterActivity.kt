package com.mindpilot.fitaicoach

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.customercenter.CustomerCenter

class CustomerCenterActivity : ComponentActivity() {

    companion object {
        const val TAG = "CustomerCenterActivity"
    }

    @OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            CustomerCenter(
                modifier = Modifier.fillMaxSize(),
                onDismiss = {
                    Log.d(TAG, "Customer Center dismissed")
                    finish()
                }
            )
        }
    }
}
