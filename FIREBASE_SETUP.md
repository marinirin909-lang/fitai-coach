# Firebase Setup Guide - FitAI Coach

## 🔥 Panduan Lengkap Setup Firebase (Bahasa Melayu & English)

Ikuti langkah-langkah ini untuk setup Firebase dan launch app anda dengan lengkap.

---

## 📋 Langkah 1: Buat Firebase Project

### 1.1 Pergi ke Firebase Console
- Buka browser dan pergi ke: **https://firebase.google.com**
- Klik **"Get Started"** atau **"Go to Console"**
- Login dengan Google account anda

### 1.2 Create New Project
1. Klik **"Add project"** atau **"Create a project"**
2. **Project name:** `FitAI Coach` (atau nama pilihan anda)
3. Klik **Continue**
4. **Google Analytics:** Pilih **"Enable Google Analytics"** (recommended)
5. Pilih **"Default Account for Firebase"**
6. Klik **"Create project"**
7. Tunggu 30-60 saat untuk project setup
8. Klik **"Continue"** bila siap

---

## 📋 Langkah 2: Setup Authentication

### 2.1 Enable Email/Password Authentication
1. Dari Firebase Console, klik **"Authentication"** di menu kiri
2. Klik **"Get started"**
3. Pergi ke tab **"Sign-in method"**
4. Klik **"Email/Password"**
5. Toggle **"Enable"** untuk Email/Password
6. Klik **"Save"**

### 2.2 Enable Google Sign-In (Optional)
1. Masih di **"Sign-in method"**
2. Klik **"Google"**
3. Toggle **"Enable"**
4. Pilih **Project support email** (email anda)
5. Klik **"Save"**

---

## 📋 Langkah 3: Setup Firestore Database

### 3.1 Create Firestore Database
1. Klik **"Firestore Database"** di menu kiri
2. Klik **"Create database"**
3. **Location:** Pilih **"asia-southeast1 (Singapore)"** - PENTING untuk Malaysia!
4. **Security rules:** Pilih **"Start in production mode"**
5. Klik **"Enable"**
6. Tunggu database dibuat (1-2 minit)

### 3.2 Setup Security Rules
1. Pergi ke tab **"Rules"**
2. Replace dengan rules ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workout plans - authenticated users only
    match /workoutPlans/{planId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Progress data - users can only access their own
    match /progressData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat history - users can only access their own
    match /chatHistory/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Progress photos - users can only access their own
    match /progressPhotos/{photoId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Klik **"Publish"**

---

## 📋 Langkah 4: Setup Cloud Storage

### 4.1 Enable Storage
1. Klik **"Storage"** di menu kiri
2. Klik **"Get started"**
3. **Security rules:** Pilih **"Start in production mode"**
4. Klik **"Next"**
5. **Location:** Pilih **"asia-southeast1 (Singapore)"**
6. Klik **"Done"**

### 4.2 Setup Storage Rules
1. Pergi ke tab **"Rules"**
2. Replace dengan rules ini:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

3. Klik **"Publish"**

---

## 📋 Langkah 5: Get Firebase Configuration

### 5.1 Register Web App
1. Dari Firebase Console, klik **gear icon** (⚙️) di sebelah "Project Overview"
2. Klik **"Project settings"**
3. Scroll ke bawah ke **"Your apps"**
4. Klik **Web icon** `</>`
5. **App nickname:** `FitAI Coach Web`
6. **JANGAN** check "Also set up Firebase Hosting"
7. Klik **"Register app"**

### 5.2 Copy Configuration
1. Anda akan nampak kod seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "fitai-coach.firebaseapp.com",
  projectId: "fitai-coach",
  storageBucket: "fitai-coach.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

2. **COPY semua values ini!**

---

## 📋 Langkah 6: Update Firebase Config File

### 6.1 Open firebase-config.js
1. Buka file: `firebase-config.js` dalam project anda
2. Cari bahagian ini:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 6.2 Replace dengan Firebase Config anda
Paste values dari Firebase Console:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Dari Firebase
    authDomain: "fitai-coach.firebaseapp.com",      // Dari Firebase
    projectId: "fitai-coach",                        // Dari Firebase
    storageBucket: "fitai-coach.appspot.com",       // Dari Firebase
    messagingSenderId: "123456789012",               // Dari Firebase
    appId: "1:123456789012:web:abcdef1234567890",   // Dari Firebase
    measurementId: "G-XXXXXXXXXX"                    // Dari Firebase
};
```

3. **SAVE file** (Ctrl+S atau Cmd+S)

---

## 📋 Langkah 7: Test Firebase Integration

### 7.1 Test Locally
1. Buka `landing.html` dalam browser
2. Buka **Developer Console** (F12)
3. Klik **Console** tab
4. Anda sepatutnya nampak: `"Firebase initialized successfully"`
5. Cuba **Sign Up** dengan email dan password
6. Check Firebase Console > Authentication > Users
7. User baru sepatutnya muncul!

### 7.2 Test Database
1. Sign up atau login
2. Complete onboarding
3. Pergi ke Firebase Console > Firestore Database
4. Anda sepatutnya nampak collection `users` dengan data anda

---

## 📋 Langkah 8: Deploy ke Netlify

### 8.1 Install Netlify CLI
Buka terminal/command prompt:

```bash
npm install -g netlify-cli
```

### 8.2 Login ke Netlify
```bash
netlify login
```
- Browser akan terbuka
- Login dengan GitHub, GitLab, atau email

### 8.3 Deploy Project
```bash
# Navigate ke project folder
cd "c:/Users/User/Desktop/mindpilot-website/AI Personalized Fitness Coach"

# Deploy
netlify deploy --prod
```

Ikut prompts:
- **Create & configure a new site**
- **Team:** Pilih team anda
- **Site name:** `fitai-coach` (atau nama lain)
- **Publish directory:** `.` (current directory)

### 8.4 Get Your Live URL
Selepas deploy, anda akan dapat URL seperti:
```
https://fitai-coach.netlify.app
```

**App anda sudah LIVE! 🎉**

---

## 📋 Langkah 9: Setup Custom Domain (Optional)

### 9.1 Buy Domain
Beli domain dari:
- **Namecheap:** ~$10/year
- **GoDaddy:** ~$15/year  
- **Exabytes.my:** ~RM50/year (Malaysia)

Suggested domains:
- `fitaicoach.com`
- `fitaicoach.my`
- `fitai.coach`

### 9.2 Connect to Netlify
1. Pergi ke Netlify Dashboard
2. Klik site anda
3. **Domain settings** > **Add custom domain**
4. Masukkan domain anda (contoh: `fitaicoach.com`)
5. Klik **Verify**

### 9.3 Update DNS Records
Di domain registrar anda (Namecheap/GoDaddy/etc):

**A Record:**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: Auto
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: fitai-coach.netlify.app
TTL: Auto
```

### 9.4 Enable HTTPS
- Netlify akan automatically enable SSL certificate
- Tunggu 24-48 jam untuk DNS propagation
- SSL certificate akan auto-renew

---

## ✅ Checklist Lengkap

### Firebase Setup:
- [x] Create Firebase project
- [x] Enable Email/Password authentication
- [x] Enable Google Sign-In (optional)
- [x] Create Firestore database (Singapore region)
- [x] Setup Firestore security rules
- [x] Enable Cloud Storage
- [x] Setup Storage security rules
- [x] Get Firebase configuration
- [x] Update firebase-config.js file

### Deployment:
- [x] Install Netlify CLI
- [x] Login to Netlify
- [x] Deploy to Netlify
- [x] Get live URL
- [ ] Buy custom domain (optional)
- [ ] Connect domain to Netlify (optional)
- [ ] Enable HTTPS (automatic)

### Testing:
- [ ] Test signup
- [ ] Test login
- [ ] Test Google Sign-In
- [ ] Test data saving to Firestore
- [ ] Test on mobile device
- [ ] Test all features

---

## 🔧 Troubleshooting

### Error: "Firebase not initialized"
**Solution:** Check `firebase-config.js` - pastikan API keys betul

### Error: "Permission denied"
**Solution:** Check Firestore rules - pastikan rules sudah publish

### Error: "Auth domain not authorized"
**Solution:** 
1. Firebase Console > Authentication > Settings
2. **Authorized domains** > Add domain Netlify anda

### Users tidak save ke Firestore
**Solution:** Check browser console untuk errors, pastikan user authenticated

### Storage upload gagal
**Solution:** Check file size (max 5MB), check Storage rules

---

## 📊 Monitor Your App

### Firebase Console:
- **Authentication:** Tengok berapa users sign up
- **Firestore:** Check data yang disimpan
- **Storage:** Monitor file uploads
- **Analytics:** User behavior (jika enabled)

### Netlify Dashboard:
- **Deploy logs:** Check deployment status
- **Analytics:** Page views, bandwidth
- **Functions:** Monitor serverless functions (jika ada)

---

## 💰 Cost Estimate

### Firebase Free Tier (Spark Plan):
- **Authentication:** 50,000 MAU (Monthly Active Users)
- **Firestore:** 1GB storage, 50K reads/day, 20K writes/day
- **Storage:** 5GB storage, 1GB download/day
- **Perfect for:** 0-1000 users

### Netlify Free Tier:
- **Bandwidth:** 100GB/month
- **Build minutes:** 300/month
- **Perfect for:** 0-10,000 visitors/month

**Total Cost to Start: RM0 (FREE!)** 🎉

---

## 🎯 Next Steps

Selepas setup Firebase + Netlify:

1. ✅ Test semua features
2. ✅ Invite beta testers (10-20 orang)
3. ✅ Collect feedback
4. ✅ Fix bugs
5. ✅ Launch publicly!
6. ✅ Start marketing (TikTok, Instagram, Facebook)

---

## 📞 Support

Jika ada masalah:

1. **Firebase Docs:** https://firebase.google.com/docs
2. **Netlify Docs:** https://docs.netlify.com
3. **Stack Overflow:** Search error messages
4. **Firebase Support:** https://firebase.google.com/support

---

**Tahniah! FitAI Coach anda sudah ready untuk launch! 🚀**

**Your app is now:**
- ✅ Fully functional with Firebase backend
- ✅ Deployed on Netlify
- ✅ Accessible worldwide
- ✅ Secure with authentication
- ✅ Scalable to thousands of users
- ✅ FREE to start!

**Selamat maju jaya! 🎉**
