# Language Setup Guide - FitAI Coach Landing Page

## ✅ Apa Yang Telah Dibuat

Saya telah tambah **Language Toggle** (EN/BM) pada landing page anda!

---

## 📂 Files Yang Dibuat/Updated

### **1. landing-translations.js** ✅
- Complete translations untuk English & Bahasa Melayu
- Semua text pada landing page
- Navigation, Hero, Features, Pricing, Testimonials, Footer, Modals
- Function `switchLanguage()` untuk tukar bahasa
- Auto-save language preference ke localStorage

### **2. landing.html** ✅
- Added language toggle buttons (EN/BM) dalam navigation
- Added `data-i18n` attributes untuk auto-translation
- Included `landing-translations.js` script

### **3. landing-styles.css** ✅
- Styling untuk language toggle buttons
- Active state styling
- Hover effects
- Responsive design

---

## 🎯 Cara Ia Berfungsi

### **Language Toggle Buttons:**
```html
<div class="language-toggle">
    <button class="lang-btn active" data-lang="en" onclick="switchLanguage('en')">EN</button>
    <button class="lang-btn" data-lang="bm" onclick="switchLanguage('bm')">BM</button>
</div>
```

### **Auto-Translation:**
- Semua text dengan `data-i18n` attribute akan auto-translate
- Language preference saved ke localStorage
- Page akan remember user's language choice

---

## 🚀 Deploy Ke Netlify

Sekarang deploy files yang updated:

```bash
cd "c:/Users/User/Desktop/mindpilot-website/AI Personalized Fitness Coach"
netlify deploy --prod
```

---

## ✅ Apa Yang Akan Berlaku

Selepas deploy:

1. **Language Toggle** akan muncul dalam navigation bar
2. User boleh klik **EN** atau **BM** untuk tukar bahasa
3. **Semua text** akan tukar automatically:
   - Navigation links
   - Hero section
   - Features
   - How It Works
   - Pricing
   - Testimonials
   - CTA section
   - Footer
   - Login/Signup modals

4. **Language preference saved** - bila user refresh page, bahasa yang dipilih akan kekal

---

## 📝 Translations Included

### **English (EN):**
- All navigation items
- Hero title & subtitle
- 6 feature cards
- 3 how-it-works steps
- 2 pricing plans (Free & Premium)
- 3 testimonials
- CTA section
- Footer links
- Login/Signup modals

### **Bahasa Melayu (BM):**
- Semua navigation items
- Hero title & subtitle
- 6 feature cards
- 3 langkah how-it-works
- 2 pricing plans (Percuma & Premium)
- 3 testimonials
- CTA section
- Footer links
- Login/Signup modals

---

## 🎨 Design

Language toggle buttons:
- **Position:** Navigation bar (between links and login button)
- **Style:** Gold background when active
- **Responsive:** Works on mobile, tablet, desktop
- **Smooth transitions:** Fade effect when switching

---

## 🔧 Technical Details

### **How Translation Works:**
1. User clicks EN or BM button
2. `switchLanguage(lang)` function called
3. Language saved to localStorage
4. All elements with `data-i18n` attribute updated
5. Active button state updated

### **Translation Function:**
```javascript
function t(key, lang = 'en') {
    return translations[lang][key] || key;
}
```

### **Auto-Load on Page Load:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    updatePageLanguage();
    updateLanguageButtons();
});
```

---

## ✅ Testing

Selepas deploy, test:

1. **Open landing page**
2. **Click BM button** - semua text tukar ke Bahasa Melayu
3. **Click EN button** - semua text tukar ke English
4. **Refresh page** - language preference kekal
5. **Test on mobile** - language toggle responsive

---

## 📊 What's Translated

**Total Translations:** 100+ text strings

**Sections Covered:**
- ✅ Navigation (5 items)
- ✅ Hero Section (7 items)
- ✅ Features (12 items)
- ✅ How It Works (6 items)
- ✅ Pricing (24 items)
- ✅ Testimonials (9 items)
- ✅ CTA Section (3 items)
- ✅ Footer (20 items)
- ✅ Login Modal (8 items)
- ✅ Signup Modal (8 items)

---

## 🎉 Result

Your landing page sekarang:
- ✅ Fully bilingual (EN/BM)
- ✅ Professional language toggle
- ✅ Smooth transitions
- ✅ Saves user preference
- ✅ Works on all devices
- ✅ SEO-friendly (lang attribute updated)

---

**Deploy sekarang dan test language toggle! 🚀**

**Command:**
```bash
netlify deploy --prod
```
