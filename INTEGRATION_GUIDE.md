# FitAI Coach - Integration & Deployment Guide

## 🚀 Complete Step-by-Step Development Plan

This guide provides detailed instructions for integrating real AI services, payment systems, and deploying the FitAI Coach application.

---

## 📋 Table of Contents

1. [AI Integration](#ai-integration)
2. [Payment Integration](#payment-integration)
3. [Backend Setup](#backend-setup)
4. [Deployment](#deployment)
5. [Marketing & Launch](#marketing--launch)

---

## 🤖 AI Integration

### A. Grok API Integration (Recommended for Malaysia)

#### Step 1: Get API Access
1. Visit [x.ai](https://x.ai) and sign up for Grok API access
2. Generate your API key from the developer dashboard
3. Note: Grok offers competitive pricing for Southeast Asian markets

#### Step 2: Implement Workout Plan Generation

Create a new file `api-integration.js`:

```javascript
// api-integration.js

const GROK_API_KEY = 'YOUR_GROK_API_KEY'; // Store in environment variable for production
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

async function generateAIWorkoutPlan(userData, duration, equipment) {
    const prompt = `
You are an expert fitness coach. Create a detailed ${duration}-day workout plan with the following specifications:

User Profile:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Height: ${userData.height}cm
- Weight: ${userData.weight}kg
- Fitness Level: ${userData.level}
- Goal: ${userData.goal}
- Activity Level: ${userData.activity}
- Equipment Available: ${equipment}

Requirements:
1. Provide exercises suitable for ${equipment} equipment
2. Scale difficulty for ${userData.level} level
3. Focus on ${userData.goal}
4. Include warm-up and cool-down
5. Provide sets, reps, and rest times
6. Rotate between strength, cardio, and flexibility

Format the response as a JSON array with this structure:
[
  {
    "day": 1,
    "name": "Day 1",
    "focus": "Strength",
    "exercises": [
      {
        "name": "Exercise name",
        "sets": 3,
        "reps": "10-12",
        "rest": "60 sec",
        "description": "Brief form tips"
      }
    ]
  }
]
`;

    try {
        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional fitness coach specializing in personalized workout plans. Always respond with valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const workoutPlan = JSON.parse(data.choices[0].message.content);
        
        return workoutPlan;
    } catch (error) {
        console.error('Error generating workout plan:', error);
        // Fallback to rule-based generation
        return generateWorkoutPlanData(duration, equipment);
    }
}

async function generateAINutritionPlan(userData, calories, macros) {
    const prompt = `
Create a daily meal plan for a Malaysian user with these specifications:

User Profile:
- Goal: ${userData.goal}
- Daily Calories: ${calories}
- Macros: ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fats}g fats
- Dietary Preference: ${userData.diet}

Requirements:
1. Include Malaysian/Southeast Asian dishes
2. Ensure ${userData.diet} compliance
3. Provide 3 meals (breakfast, lunch, dinner)
4. Include calorie and macro breakdown
5. Use locally available ingredients

Format as JSON:
{
  "breakfast": {
    "name": "Meal name",
    "items": ["ingredient 1", "ingredient 2"],
    "calories": 400,
    "protein": 20,
    "carbs": 45,
    "fats": 15
  },
  "lunch": {...},
  "dinner": {...}
}
`;

    try {
        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a nutrition expert specializing in Malaysian and halal cuisine. Always respond with valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 1500
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error('Error generating nutrition plan:', error);
        return generateNutritionData();
    }
}

async function getAIChatResponse(userMessage, chatHistory, userData) {
    const systemPrompt = `
You are FitAI Coach, a friendly and motivating fitness coach assistant. 

User Context:
- Name: ${userData.name}
- Goal: ${userData.goal}
- Fitness Level: ${userData.level}
- Current Weight: ${userData.weight}kg

Guidelines:
1. Be encouraging and supportive
2. Provide actionable fitness advice
3. Reference their specific goals
4. Keep responses concise (2-3 sentences)
5. Use a mix of English and simple Bahasa Melayu when appropriate
6. Be culturally sensitive to Malaysian context
`;

    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(-10), // Last 10 messages for context
            { role: 'user', content: userMessage }
        ];

        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: messages,
                temperature: 0.9,
                max_tokens: 200
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting chat response:', error);
        return generateAIResponse(userMessage);
    }
}
```

#### Step 3: Update app.js to use AI functions

```javascript
// In app.js, replace the existing functions:

async function generateWorkoutPlan() {
    const duration = parseInt(document.getElementById('plan-duration').value);
    const equipment = document.getElementById('plan-equipment').value;
    
    if (duration > 7 && !isPremium()) {
        alert(currentLanguage === 'en' ? 'Premium feature!' : 'Ciri Premium!');
        showSubscription();
        return;
    }
    
    showLoading(currentLanguage === 'en' ? 'AI is creating your personalized plan...' : 'AI sedang cipta pelan anda...');
    
    // Use AI generation
    workoutPlan = await generateAIWorkoutPlan(userData, duration, equipment);
    displayWorkoutPlan(workoutPlan);
    
    hideLoading();
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (chatHistory.length >= 5 && !isPremium()) {
        alert('Upgrade to Premium for unlimited chat!');
        showSubscription();
        return;
    }
    
    addChatMessage(message, 'user');
    input.value = '';
    
    chatHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.innerHTML = '<div class="message-avatar">🤖</div><div class="message-content"><p>Typing...</p></div>';
    document.getElementById('chat-messages').appendChild(typingDiv);
    
    // Get AI response
    const response = await getAIChatResponse(message, chatHistory, userData);
    
    // Remove typing indicator
    typingDiv.remove();
    
    addChatMessage(response, 'bot');
    chatHistory.push({ role: 'assistant', content: response });
}
```

### B. Exercise Image Generation (Stable Diffusion)

#### Using Replicate API

```javascript
// Add to api-integration.js

const REPLICATE_API_KEY = 'YOUR_REPLICATE_API_KEY';

async function generateExerciseImage(exerciseName) {
    const prompt = `Professional fitness instruction photo: person demonstrating proper form for ${exerciseName}, side view, clean gym background, anatomical muscle highlights, instructional style, high quality, realistic`;
    
    try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
                input: {
                    prompt: prompt,
                    negative_prompt: 'blurry, low quality, distorted, cartoon',
                    width: 768,
                    height: 768
                }
            })
        });

        const prediction = await response.json();
        
        // Poll for completion
        let imageUrl = await pollForImage(prediction.id);
        return imageUrl;
    } catch (error) {
        console.error('Error generating image:', error);
        return null;
    }
}

async function pollForImage(predictionId) {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`
            }
        });
        
        const prediction = await response.json();
        
        if (prediction.status === 'succeeded') {
            return prediction.output[0];
        } else if (prediction.status === 'failed') {
            throw new Error('Image generation failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
    }
    
    throw new Error('Image generation timeout');
}
```

---

## 💳 Payment Integration

### Option 1: Stripe (Recommended)

#### Step 1: Setup Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification
3. Get API keys (publishable and secret)

#### Step 2: Create Backend (Node.js/Express)

Create `server.js`:

```javascript
const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Create checkout session
app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'fpx'], // FPX for Malaysian banks
        line_items: [
            {
                price_data: {
                    currency: 'myr',
                    product_data: {
                        name: 'FitAI Coach Premium',
                        description: 'Monthly subscription with unlimited features'
                    },
                    unit_amount: 2900, // RM29.00
                    recurring: {
                        interval: 'month'
                    }
                },
                quantity: 1
            }
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/index.html`,
        customer_email: req.body.email
    });

    res.json({ id: session.id });
});

// Webhook to handle subscription events
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, 'YOUR_WEBHOOK_SECRET');
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle subscription events
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // Activate premium for user
            console.log('Subscription activated:', session.customer_email);
            break;
        case 'customer.subscription.deleted':
            // Deactivate premium
            break;
    }

    res.json({received: true});
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

#### Step 3: Frontend Integration

```javascript
// Add to app.js

const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');

async function subscribePremium() {
    const email = userData.email || prompt('Enter your email:');
    
    if (!email) return;
    
    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            alert(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Payment failed. Please try again.');
    }
}
```

### Option 2: RevenueCat (Mobile-First)

```javascript
// Add RevenueCat SDK
<script src="https://cdn.revenuecat.com/purchases-js/4.0.0/purchases.min.js"></script>

// Initialize
Purchases.configure({
    apiKey: "YOUR_REVENUECAT_PUBLIC_KEY",
    appUserID: userData.email // or unique user ID
});

async function subscribePremium() {
    try {
        const offerings = await Purchases.getOfferings();
        const premiumPackage = offerings.current.monthly;
        
        const purchaserInfo = await Purchases.purchasePackage(premiumPackage);
        
        if (purchaserInfo.entitlements.active.premium) {
            localStorage.setItem('isPremium', 'true');
            updatePremiumUI();
            alert('Welcome to Premium! 🎉');
        }
    } catch (error) {
        if (error.userCancelled) {
            console.log('User cancelled purchase');
        } else {
            alert('Purchase failed: ' + error.message);
        }
    }
}
```

---

## 🗄️ Backend Setup (Firebase)

### Step 1: Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Create new project: "FitAI Coach"
3. Enable Authentication, Firestore, and Analytics

### Step 2: Add Firebase to Your App

```html
<!-- Add to index.html before </body> -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics-compat.js"></script>

<script>
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fitai-coach.firebaseapp.com",
    projectId: "fitai-coach",
    storageBucket: "fitai-coach.appspot.com",
    messagingSenderId: "123456789",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();
</script>
```

### Step 3: Implement Authentication

```javascript
// Add to app.js

// Google Sign-In
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Load user data from Firestore
        await loadUserData(user.uid);
        
        analytics.logEvent('login', { method: 'google' });
    } catch (error) {
        console.error('Sign-in error:', error);
    }
}

// Email/Password Sign-Up
async function signUpWithEmail(email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;
        
        // Save initial user data
        await saveUserData(user.uid, userData);
        
        analytics.logEvent('sign_up', { method: 'email' });
    } catch (error) {
        console.error('Sign-up error:', error);
    }
}

// Save user data to Firestore
async function saveUserData(userId, data) {
    await db.collection('users').doc(userId).set({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

// Load user data from Firestore
async function loadUserData(userId) {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
        userData = doc.data();
        initializeDashboard();
    }
}

// Save workout plan
async function saveWorkoutPlan(userId, plan) {
    await db.collection('workoutPlans').add({
        userId: userId,
        plan: plan,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Track analytics events
function trackEvent(eventName, params) {
    analytics.logEvent(eventName, params);
}
```

---

## 🌐 Deployment

### Option 1: Netlify (Easiest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Follow prompts:
# - Build command: (leave empty for static site)
# - Publish directory: . (current directory)
```

**Custom Domain Setup:**
1. Go to Netlify dashboard
2. Domain settings → Add custom domain
3. Update DNS records as instructed

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Follow prompts
```

### Option 3: Traditional Hosting

**For cPanel/Shared Hosting:**
1. Compress all files into a ZIP
2. Upload to public_html folder
3. Extract files
4. Access via your domain

**Recommended Hosts for Malaysia:**
- Hostinger Malaysia
- Exabytes
- Shinjiru
- ServerFreak

---

## 📱 Mobile App Development (Phase 2)

### Using Flutter

```dart
// main.dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(FitAICoachApp());

class FitAICoachApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitAI Coach',
      home: WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: WebView(
          initialUrl: 'https://your-deployed-url.com',
          javascriptMode: JavascriptMode.unrestricted,
        ),
      ),
    );
  }
}
```

---

## 📊 Marketing & Launch Strategy

### Pre-Launch (2 weeks before)

**Week 1:**
- Create social media accounts (Instagram, TikTok, Facebook)
- Design logo and branding materials
- Prepare launch content (10 posts)
- Set up Google Analytics and Facebook Pixel

**Week 2:**
- Beta testing with 20-30 users
- Collect testimonials
- Create demo videos
- Prepare press release

### Launch Day

**Checklist:**
- [ ] Deploy to production
- [ ] Test all features
- [ ] Enable analytics
- [ ] Post on social media
- [ ] Send to beta testers
- [ ] Submit to Product Hunt
- [ ] Post in Malaysian fitness groups

### Post-Launch (First Month)

**Week 1-2:**
- Daily social media posts
- Respond to all feedback
- Fix critical bugs
- Run TikTok ads (RM100/day budget)

**Week 3-4:**
- Influencer outreach (5-10 micro-influencers)
- Content marketing (blog posts, videos)
- Email marketing campaign
- Optimize based on analytics

### Pricing Strategy for Malaysia

**Introductory Offer:**
- First month: RM19 (35% off)
- Regular: RM29/month
- Annual: RM290/year (save RM58)

**Promotional Campaigns:**
- Ramadan special
- New Year fitness challenge
- Referral program (RM10 credit)

---

## 📈 Success Metrics

### Track These KPIs:

**User Acquisition:**
- Daily active users (DAU)
- Monthly active users (MAU)
- Sign-up conversion rate
- Cost per acquisition (CPA)

**Engagement:**
- Average session duration
- Workout plans generated
- Chat messages sent
- Return rate (7-day, 30-day)

**Revenue:**
- Free to Premium conversion rate
- Monthly recurring revenue (MRR)
- Churn rate
- Lifetime value (LTV)

**Target Goals (First 3 Months):**
- 1,000 sign-ups
- 100 premium subscribers
- RM2,900 MRR
- 20% free-to-premium conversion

---

## 🔧 Maintenance & Updates

### Weekly Tasks:
- Monitor error logs
- Review user feedback
- Update content (quotes, exercises)
- Check API usage and costs

### Monthly Tasks:
- Add new features
- Update exercise database
- Refresh meal suggestions
- Performance optimization

### Quarterly Tasks:
- Major feature releases
- UI/UX improvements
- Marketing campaign refresh
- Competitor analysis

---

## 📞 Support & Resources

### Useful Links:
- Grok API Docs: https://docs.x.ai
- Stripe Malaysia: https://stripe.com/my
- Firebase Docs: https://firebase.google.com/docs
- Netlify Docs: https://docs.netlify.com

### Community:
- Malaysian Developer Community
- Fitness Tech Facebook Groups
- Startup Malaysia Slack

---

**Ready to build the next big fitness app in Malaysia! 🇲🇾💪**
