package com.personal.fitaicoach.app

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.crashlytics.FirebaseCrashlytics
import timber.log.Timber

class FitAICoachApp : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        try {
            FirebaseApp.initializeApp(this)
            
            // Initialize Firebase Analytics
            val analytics = FirebaseAnalytics.getInstance(this)
            Timber.d("Firebase Analytics initialized: ${analytics.appInstanceId}")
            
            // Initialize Firebase Crashlytics
            val crashlytics = FirebaseCrashlytics.getInstance()
            Timber.d("Firebase Crashlytics initialized")
            
            Timber.d("Firebase initialized successfully for FitAI Coach")
            
        } catch (e: Exception) {
            Timber.e(e, "Failed to initialize Firebase")
        }
    }
}
