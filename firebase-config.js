// Firebase Configuration
// IMPORTANT: Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > Web app

const firebaseConfig = {
    apiKey: "AIzaSyCF-4vvMYedZ7_zBcP_iTRTMM2aoFP5Mw8",
    authDomain: "fitai-coach-ad084.firebaseapp.com",
    projectId: "fitai-coach-ad084",
    storageBucket: "fitai-coach-ad084.firebasestorage.app",
    messagingSenderId: "169684580170",
    appId: "1:169684580170:web:b9b1cfd6894d37128173b3",
    measurementId: "G-GFMVKWYPZF"
};

// Initialize Firebase
let auth, db, storage, analytics;

function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            storage = firebase.storage();
            
            if (firebaseConfig.measurementId) {
                analytics = firebase.analytics();
            }
            
            console.log('Firebase initialized successfully');
            return true;
        } else {
            console.warn('Firebase SDK not loaded. Using localStorage fallback.');
            return false;
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Check if Firebase is configured
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
}
