# Vercel Deployment Guide - FitAI Coach

## 🚀 Deploy FitAI Coach ke Vercel

Panduan lengkap untuk deploy app anda ke Vercel (alternative to Netlify).

---

## ✅ Kenapa Vercel?

- ✅ **Free tier generous** - Unlimited bandwidth
- ✅ **Super fast** - Edge network global
- ✅ **Easy deployment** - Git integration automatic
- ✅ **Great for static sites** - Perfect untuk FitAI Coach
- ✅ **Automatic HTTPS** - SSL certificate free
- ✅ **Preview deployments** - Test before production

---

## 📋 Langkah 1: Install Vercel CLI

### **Windows/Mac/Linux:**
```bash
npm install -g vercel
```

Atau guna **yarn**:
```bash
yarn global add vercel
```

---

## 📋 Langkah 2: Login ke Vercel

```bash
vercel login
```

Pilih salah satu:
- **Email** - Vercel akan email magic link
- **GitHub** - Login dengan GitHub account
- **GitLab** - Login dengan GitLab account
- **Bitbucket** - Login dengan Bitbucket account

**Recommended:** Guna GitHub untuk easy Git integration!

---

## 📋 Langkah 3: Deploy Project

### **Navigate to project folder:**
```bash
cd "c:/Users/User/Desktop/mindpilot-website/AI Personalized Fitness Coach"
```

### **Deploy:**
```bash
vercel
```

### **Follow prompts:**
1. **Set up and deploy?** → Yes
2. **Which scope?** → Pilih your account
3. **Link to existing project?** → No (first time)
4. **What's your project's name?** → `fitai-coach` (atau nama lain)
5. **In which directory is your code located?** → `./` (current directory)
6. **Want to override the settings?** → No

**Vercel akan:**
- ✅ Upload files
- ✅ Build project
- ✅ Deploy to production
- ✅ Give you live URL

---

## 📋 Langkah 4: Get Your Live URL

Selepas deploy, anda akan dapat URL seperti:
```
https://fitai-coach.vercel.app
```

atau

```
https://fitai-coach-username.vercel.app
```

**App anda sudah LIVE! 🎉**

---

## 🔄 Update/Redeploy

Bila anda buat changes:

```bash
cd "c:/Users/User/Desktop/mindpilot-website/AI Personalized Fitness Coach"
vercel --prod
```

Atau just:
```bash
vercel
```

Vercel akan auto-detect changes dan deploy!

---

## 🌐 Setup Custom Domain (Optional)

### **Langkah 1: Buy Domain**
Beli domain dari:
- **Namecheap** - ~$10/year
- **GoDaddy** - ~$15/year
- **Exabytes.my** - ~RM50/year (Malaysia)

### **Langkah 2: Add Domain di Vercel**
```bash
vercel domains add fitaicoach.com
```

Atau via **Vercel Dashboard:**
1. Go to project settings
2. Click **Domains**
3. Add your domain
4. Follow DNS setup instructions

### **Langkah 3: Update DNS**
Di domain registrar anda, add:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Wait 24-48 hours** untuk DNS propagation.

---

## 📂 Project Structure

Vercel akan serve files dari root directory:

```
/
├── landing.html          → Front page (/)
├── index.html            → Main app (/index.html)
├── styles.css            → Main app styles
├── landing-styles.css    → Landing page styles
├── app.js                → Main app logic
├── landing-script.js     → Landing page logic
├── firebase-config.js    → Firebase setup
├── firebase-auth.js      → Authentication
├── firebase-database.js  → Database functions
├── landing-translations.js → Language translations
├── logo.png              → Logo image
├── vercel.json           → Vercel config
└── README.md             → Documentation
```

---

## ⚙️ Vercel Configuration

File `vercel.json` sudah dibuat dengan:

### **Routes:**
- `/` → Redirect to `landing.html` (front page)
- `/*` → Serve static files

### **Headers:**
- Security headers (X-Frame-Options, XSS Protection, etc.)
- Cache headers untuk static assets (JS, CSS, images)

### **Builds:**
- Static file serving
- No build step needed (pure HTML/CSS/JS)

---

## 🎯 Features Selepas Deploy

### **Landing Page:**
- ✅ URL: `https://fitai-coach.vercel.app/`
- ✅ Theme toggle (Dark/Light mode)
- ✅ Language toggle (EN/BM)
- ✅ Login/Signup modals
- ✅ All sections working

### **Main App:**
- ✅ URL: `https://fitai-coach.vercel.app/index.html`
- ✅ Firebase authentication
- ✅ Firestore database
- ✅ Theme toggle
- ✅ Language toggle
- ✅ All features working

---

## 🔧 Vercel CLI Commands

### **Deploy to production:**
```bash
vercel --prod
```

### **Deploy preview (staging):**
```bash
vercel
```

### **List deployments:**
```bash
vercel ls
```

### **View logs:**
```bash
vercel logs
```

### **Remove deployment:**
```bash
vercel rm <deployment-url>
```

### **Link to existing project:**
```bash
vercel link
```

---

## 📊 Vercel Dashboard

Access via: **https://vercel.com/dashboard**

### **Features:**
- 📈 **Analytics** - Page views, visitors, performance
- 🚀 **Deployments** - History of all deploys
- ⚙️ **Settings** - Domain, environment variables, etc.
- 📝 **Logs** - Real-time deployment logs
- 🔒 **Security** - HTTPS, headers, etc.

---

## 💰 Pricing

### **Hobby (Free) Plan:**
- ✅ Unlimited deployments
- ✅ Unlimited bandwidth
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Perfect for: Personal projects, 0-10K visitors/month

### **Pro Plan ($20/month):**
- ✅ Everything in Hobby
- ✅ Unlimited bandwidth
- ✅ Advanced analytics
- ✅ Password protection
- ✅ Perfect for: Professional projects, 10K+ visitors/month

**Start with Hobby (FREE)!** 🎉

---

## 🔥 Firebase + Vercel Stack

Your app sekarang guna:
- ✅ **Vercel** - Frontend hosting (HTML/CSS/JS)
- ✅ **Firebase Auth** - User authentication
- ✅ **Firestore** - Database
- ✅ **Firebase Storage** - File uploads

**Perfect combination!** 🚀

---

## 🎯 Deployment Checklist

Before deploy, pastikan:
- ✅ Firebase config updated (`firebase-config.js`)
- ✅ Firestore rules published
- ✅ Storage rules published
- ✅ All files saved
- ✅ Logo image (`logo.png`) exists
- ✅ `vercel.json` configured

---

## 🚀 Quick Deploy Steps

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Navigate to project
cd "c:/Users/User/Desktop/mindpilot-website/AI Personalized Fitness Coach"

# 4. Deploy
vercel --prod

# 5. Done! Get your URL
```

**That's it! App live dalam 2 minit! 🎉**

---

## 🔄 Git Integration (Recommended)

### **Setup Git + Vercel:**

1. **Create GitHub repo**
2. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/fitai-coach.git
   git push -u origin main
   ```

3. **Import to Vercel:**
   - Go to Vercel Dashboard
   - Click **"New Project"**
   - Import from GitHub
   - Select your repo
   - Deploy!

4. **Auto-deploy on push:**
   - Every `git push` → Auto-deploy to Vercel
   - Preview deployments for branches
   - Production deploy on `main` branch

---

## 📝 Environment Variables (If Needed)

Kalau anda mahu hide Firebase keys:

### **Add to Vercel:**
```bash
vercel env add FIREBASE_API_KEY
vercel env add FIREBASE_PROJECT_ID
# ... etc
```

### **Update firebase-config.js:**
```javascript
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    // ... etc
};
```

**Note:** For static sites, keys akan exposed anyway. Firebase security rules protect your data!

---

## ✅ Vercel vs Netlify

| Feature | Vercel | Netlify |
|---------|--------|---------|
| Free bandwidth | Unlimited | 100GB/month |
| Build minutes | Unlimited | 300/month |
| Deployment speed | Very fast | Fast |
| Edge network | Global | Global |
| Git integration | Excellent | Excellent |
| CLI | Excellent | Good |
| Best for | Next.js, Static | Static, JAMstack |

**Both are excellent!** Pilih yang anda suka. 😊

---

## 🎉 Summary

Your FitAI Coach app sekarang:
- ✅ Ready untuk deploy ke Vercel
- ✅ `vercel.json` configured
- ✅ Landing page as front page
- ✅ Theme toggle working
- ✅ Language toggle working
- ✅ Firebase integrated
- ✅ Production ready!

---

**Deploy sekarang! 🚀**

```bash
vercel --prod
```

**Your app akan live di:**
```
https://fitai-coach.vercel.app
```

**Selamat maju jaya! 🎉**
