package com.mindpilot.fitaicoach

import android.app.Application
import android.util.Log
import com.revenuecat.purchases.LogLevel
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration

class FitAICoachApp : Application() {

    companion object {
        const val TAG = "FitAICoachApp"
        const val REVENUECAT_API_KEY = "goog_lUhGjtmSWLZgtkwdvdbKlsHIQuU"
        const val ENTITLEMENT_ID = "fitai-coach Pro"
    }

    override fun onCreate() {
        super.onCreate()
        initRevenueCat()
    }

    private fun initRevenueCat() {
        Purchases.logLevel = LogLevel.DEBUG

        val configuration = PurchasesConfiguration.Builder(this, REVENUECAT_API_KEY)
            .build()

        Purchases.configure(configuration)

        Log.d(TAG, "RevenueCat SDK initialized successfully")
    }
}
