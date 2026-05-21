let currentLanguage = 'en';
let currentTheme = 'light';
let userData = {};
let workoutPlan = null;
let nutritionPlan = null;
let chatHistory = [];
let progressData = {
    weight: [],
    workouts: [],
    streak: 0
};

const motivationalQuotes = {
    en: [
        "The only bad workout is the one that didn't happen.",
        "Your body can stand almost anything. It's your mind you have to convince.",
        "Success starts with self-discipline.",
        "The pain you feel today will be the strength you feel tomorrow.",
        "Don't wish for it, work for it.",
        "You don't have to be great to start, but you have to start to be great.",
        "The difference between try and triumph is a little umph.",
        "Believe in yourself and all that you are."
    ],
    bm: [
        "Senaman yang terburuk adalah yang tidak dilakukan.",
        "Badan anda boleh tahan hampir apa sahaja. Fikiran anda yang perlu diyakinkan.",
        "Kejayaan bermula dengan disiplin diri.",
        "Kesakitan yang anda rasa hari ini akan menjadi kekuatan esok.",
        "Jangan hanya berharap, berusahalah untuk mencapainya.",
        "Anda tidak perlu hebat untuk bermula, tetapi anda perlu bermula untuk menjadi hebat.",
        "Perbezaan antara cuba dan jayanya adalah sedikit usaha.",
        "Percaya pada diri sendiri dan semua yang anda ada."
    ]
};

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('[data-en]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else if (element.tagName === 'OPTION') {
                element.textContent = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.placeholder = chatInput.getAttribute(`data-${lang}-placeholder`);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also update body class for consistency with landing page
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    
    localStorage.setItem('theme', theme);
    
    const themeSelect = document.getElementById('settings-theme');
    if (themeSelect) {
        themeSelect.value = theme;
    }
}

function startOnboarding() {
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('onboarding-screen').classList.add('active');
}

function nextStep(stepNumber) {
    const currentStep = document.querySelector('.onboarding-step.active');
    const nextStepElement = document.getElementById(`step-${stepNumber}`);
    
    if (validateCurrentStep(currentStep)) {
        currentStep.classList.remove('active');
        nextStepElement.classList.add('active');
        
        const progress = (stepNumber / 3) * 100;
        document.getElementById('onboarding-progress').style.width = `${progress}%`;
    }
}

function prevStep(stepNumber) {
    const currentStep = document.querySelector('.onboarding-step.active');
    const prevStepElement = document.getElementById(`step-${stepNumber}`);
    
    currentStep.classList.remove('active');
    prevStepElement.classList.add('active');
    
    const progress = (stepNumber / 3) * 100;
    document.getElementById('onboarding-progress').style.width = `${progress}%`;
}

function validateCurrentStep(step) {
    const inputs = step.querySelectorAll('input[type="text"], input[type="number"]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value) {
            input.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });
    
    return isValid;
}

async function completeOnboarding() {
    try {
        const currentStep = document.querySelector('.onboarding-step.active');
        if (!validateCurrentStep(currentStep)) {
            return;
        }
        
        userData = {
            name: document.getElementById('user-name').value,
            age: parseInt(document.getElementById('user-age').value),
            gender: document.getElementById('user-gender').value,
            height: parseInt(document.getElementById('user-height').value),
            weight: parseFloat(document.getElementById('user-weight').value),
            activityLevel: document.getElementById('activity-level').value,
            fitnessLevel: document.getElementById('fitness-level').value,
            goal: document.getElementById('user-goal').value,
            dietPreference: document.getElementById('diet-preference').value
        };
        
        // Always save to localStorage first (guaranteed to work)
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Try Firebase save in background (don't block)
        try {
            const user = getCurrentUser();
            if (user && user.uid) {
                saveUserProfile(user.uid, userData).catch(function(err) {
                    console.warn('Firebase save failed, using localStorage:', err);
                });
            }
        } catch (fbError) {
            console.warn('Firebase not available, using localStorage:', fbError);
        }
        
        // Switch screens
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        
        // Initialize dashboard
        initializeDashboard();
        
    } catch (error) {
        console.error('Error in completeOnboarding:', error);
        // Last resort - force switch to dashboard even if something failed
        localStorage.setItem('userData', JSON.stringify(userData));
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        initializeDashboard();
    }
}

async function logout() {
    if (confirm(currentLanguage === 'en' ? 'Are you sure you want to logout?' : 'Adakah anda pasti mahu log keluar?')) {
        await firebaseLogout();
        localStorage.removeItem('userSession');
        window.location.href = 'index.html';
    }
}

function initializeDashboard() {
    try {
        // Set user name display
        const userNameDisplay = document.getElementById('user-name-display');
        if (userNameDisplay) {
            userNameDisplay.textContent = userData.name || 'User';
        }
        
        // Set email display
        const emailDisplay = document.getElementById('logged-in-email');
        if (emailDisplay) {
            const userSession = localStorage.getItem('userSession');
            let email = 'Not set';
            if (userSession) {
                try { email = JSON.parse(userSession).email || email; } catch(e) {}
            }
            emailDisplay.textContent = email;
        }
        
        const goalText = {
            'lose-weight': currentLanguage === 'en' ? 'Lose Weight' : 'Kurangkan Berat',
            'build-muscle': currentLanguage === 'en' ? 'Build Muscle' : 'Bina Otot',
            'get-fit': currentLanguage === 'en' ? 'Get Fit & Healthy' : 'Jadi Cergas & Sihat',
            'flexibility': currentLanguage === 'en' ? 'Improve Flexibility' : 'Tingkatkan Fleksibiliti',
            'endurance': currentLanguage === 'en' ? 'Build Endurance' : 'Bina Daya Tahan'
        };
        
        const userGoalDisplay = document.getElementById('user-goal-display');
        if (userGoalDisplay) {
            userGoalDisplay.textContent = goalText[userData.goal] || 'Get Fit';
        }
        
        const userWeightDisplay = document.getElementById('user-weight-display');
        if (userWeightDisplay) {
            userWeightDisplay.textContent = `${userData.weight || 0} kg`;
        }
        
        const bmr = calculateBMR();
        
        const userBmrDisplay = document.getElementById('user-bmr-display');
        if (userBmrDisplay) {
            userBmrDisplay.textContent = Math.round(bmr) || 0;
        }
        
        const calorieTarget = document.getElementById('calorie-target');
        if (calorieTarget) {
            calorieTarget.textContent = Math.round(bmr) || 0;
        }
        
        const macros = calculateMacros(bmr);
        
        const proteinTarget = document.getElementById('protein-target');
        if (proteinTarget) {
            proteinTarget.textContent = `${macros.protein}g`;
        }
        
        const carbsTarget = document.getElementById('carbs-target');
        if (carbsTarget) {
            carbsTarget.textContent = `${macros.carbs}g`;
        }
        
        const fatsTarget = document.getElementById('fats-target');
        if (fatsTarget) {
            fatsTarget.textContent = `${macros.fats}g`;
        }
        
        const workoutStreak = document.getElementById('workout-streak');
        if (workoutStreak) {
            workoutStreak.textContent = progressData.streak || 0;
        }
        
        const quotes = motivationalQuotes[currentLanguage] || motivationalQuotes['en'];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        const dailyQuote = document.getElementById('daily-quote');
        if (dailyQuote) {
            dailyQuote.textContent = `"${quote}"`;
        }
        
        const settingsName = document.getElementById('settings-name');
        if (settingsName) {
            settingsName.value = userData.name || '';
        }
        
        try {
            initializeWeightChart();
        } catch (chartError) {
            console.warn('Chart initialization failed:', chartError);
        }
        
        // Update tier banner
        try {
            updateTierBanner();
        } catch (tierError) {
            console.warn('Tier banner update failed:', tierError);
        }
        
        // Update premium sections (new features)
        try {
            updatePremiumSections();
        } catch (premError) {
            console.warn('Premium sections update failed:', premError);
        }
        
        // Initialize calendar
        try {
            initializeCalendar();
        } catch (calError) {
            console.warn('Calendar initialization failed:', calError);
        }
        
        // Load saved workout plan if exists
        try {
            const savedPlan = localStorage.getItem('workoutPlan');
            if (savedPlan && !workoutPlan) {
                workoutPlan = JSON.parse(savedPlan);
                displayWorkoutPlan(workoutPlan);
            }
        } catch (planError) {
            console.warn('Could not load saved workout plan:', planError);
        }
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
}

function calculateBMR() {
    let bmr;
    if (userData.gender === 'male') {
        bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
    } else {
        bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161;
    }
    
    const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'very': 1.725,
        'extra': 1.9
    };
    
    bmr *= activityMultipliers[userData.activityLevel] || activityMultipliers[userData.activity] || 1.2;
    
    if (userData.goal === 'lose-weight') {
        bmr *= 0.85;
    } else if (userData.goal === 'build-muscle') {
        bmr *= 1.15;
    }
    
    return bmr;
}

function calculateMacros(calories) {
    let proteinRatio, carbsRatio, fatsRatio;
    
    if (userData.goal === 'build-muscle') {
        proteinRatio = 0.35;
        carbsRatio = 0.40;
        fatsRatio = 0.25;
    } else if (userData.goal === 'lose-weight') {
        proteinRatio = 0.40;
        carbsRatio = 0.30;
        fatsRatio = 0.30;
    } else {
        proteinRatio = 0.30;
        carbsRatio = 0.40;
        fatsRatio = 0.30;
    }
    
    return {
        protein: Math.round((calories * proteinRatio) / 4),
        carbs: Math.round((calories * carbsRatio) / 4),
        fats: Math.round((calories * fatsRatio) / 9)
    };
}

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
}

async function generateWorkoutPlan() {
    const duration = parseInt(document.getElementById('plan-duration').value);
    const equipment = document.getElementById('plan-equipment').value;
    const splitEl = document.getElementById('plan-split');
    const split = splitEl ? splitEl.value : 'full-body';
    const tier = isPremium() ? 'premium' : 'free';
    
    // Free tier restrictions
    if (!isPremium()) {
        if (duration > 7) {
            alert(currentLanguage === 'en' ? 
                'Premium subscription required for plans longer than 7 days! Free plan includes 7-day plans only.' : 
                'Langganan Premium diperlukan untuk pelan lebih dari 7 hari! Pelan percuma termasuk pelan 7 hari sahaja.');
            showSubscription();
            return;
        }
        if (split !== 'full-body') {
            alert(currentLanguage === 'en' ? 
                'Premium subscription required for advanced workout splits! Free plan includes Full Body split only.' : 
                'Langganan Premium diperlukan untuk split senaman lanjutan! Pelan percuma termasuk split Seluruh Badan sahaja.');
            showSubscription();
            document.getElementById('plan-split').value = 'full-body';
            return;
        }
    }
    
    const user = getCurrentUser();
    
    showLoading(currentLanguage === 'en' ? 'Generating your personalized workout plan...' : 'Menjana pelan senaman diperibadikan anda...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        // Use WorkoutDB to generate the plan
        const fitnessLevel = userData.fitnessLevel || userData.level || 'beginner';
        const goal = userData.goal || 'get-fit';
        
        workoutPlan = WorkoutDB.generatePlan({
            duration: duration,
            equipment: equipment,
            split: split,
            fitnessLevel: fitnessLevel,
            goal: goal,
            tier: tier
        });
        
        // Save plan
        try {
            if (user && user.uid) {
                await saveWorkoutPlan(user.uid, workoutPlan);
            } else {
                localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
            }
        } catch (saveErr) {
            console.warn('Could not save workout plan:', saveErr);
            localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
        }
        
        displayWorkoutPlan(workoutPlan);
    } catch (err) {
        console.error('Error generating workout plan:', err);
        alert(currentLanguage === 'en' ? 'Error generating plan. Please try again.' : 'Ralat menjana pelan. Sila cuba lagi.');
    }
    
    hideLoading();
}

function displayWorkoutPlan(plan) {
    const container = document.getElementById('workout-plan-container');
    if (!container) return;
    container.innerHTML = '';
    
    const tier = isPremium() ? 'premium' : 'free';
    const freeExCount = WorkoutDB.getExerciseCount('free');
    const premiumExCount = WorkoutDB.getExerciseCount('premium');
    
    // Plan summary header
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'plan-summary';
    const workoutDays = plan.filter(d => !d.isRest).length;
    const restDays = plan.filter(d => d.isRest).length;
    const hasDeload = plan.some(d => d.isDeload);
    summaryDiv.innerHTML = `
        <div class="plan-summary-stats">
            <div class="plan-stat">
                <span class="plan-stat-value">${plan.length}</span>
                <span class="plan-stat-label">${currentLanguage === 'en' ? 'Total Days' : 'Jumlah Hari'}</span>
            </div>
            <div class="plan-stat">
                <span class="plan-stat-value">${workoutDays}</span>
                <span class="plan-stat-label">${currentLanguage === 'en' ? 'Workout Days' : 'Hari Senaman'}</span>
            </div>
            <div class="plan-stat">
                <span class="plan-stat-value">${restDays}</span>
                <span class="plan-stat-label">${currentLanguage === 'en' ? 'Rest Days' : 'Hari Rehat'}</span>
            </div>
            ${hasDeload ? `<div class="plan-stat"><span class="plan-stat-value">✓</span><span class="plan-stat-label">${currentLanguage === 'en' ? 'Deload Weeks' : 'Minggu Deload'}</span></div>` : ''}
        </div>
        <div class="plan-exercise-count">
            ${currentLanguage === 'en' ? 'Using' : 'Menggunakan'} <strong>${tier === 'premium' ? premiumExCount : freeExCount}</strong> ${currentLanguage === 'en' ? 'exercises from database' : 'senaman dari pangkalan data'}
            ${tier === 'free' ? `<span class="upgrade-hint" onclick="showSubscription()"> — ${currentLanguage === 'en' ? `Upgrade for ${premiumExCount}+ exercises` : `Naik taraf untuk ${premiumExCount}+ senaman`} ⭐</span>` : ''}
        </div>
    `;
    container.appendChild(summaryDiv);
    
    plan.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card' + (day.isRest ? ' rest-day' : '') + (day.isDeload ? ' deload-day' : '');
        
        const dayLabel = currentLanguage === 'en' ? 'Day' : 'Hari';
        const deloadLabel = day.isDeload ? ` <span class="deload-badge">${currentLanguage === 'en' ? 'DELOAD' : 'DELOAD'}</span>` : '';
        const restLabel = day.isRest && day.exercises.length === 0 ? ` — ${currentLanguage === 'en' ? 'Rest Day' : 'Hari Rehat'} 😴` : '';
        const mobilityLabel = day.focusKey === 'mobility' ? ` — ${currentLanguage === 'en' ? 'Active Recovery' : 'Pemulihan Aktif'} 🧘` : '';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <div class="day-title">${dayLabel} ${day.day} - ${day.focus}${deloadLabel}${restLabel}${mobilityLabel}</div>
        `;
        
        dayCard.appendChild(dayHeader);
        
        if (day.exercises.length > 0) {
            const exerciseList = document.createElement('ul');
            exerciseList.className = 'exercise-list';
            
            day.exercises.forEach(exercise => {
                const li = document.createElement('li');
                li.className = 'exercise-item';
                const exName = exercise.name[currentLanguage] || exercise.name.en || exercise.name;
                const setsLabel = currentLanguage === 'en' ? 'sets' : 'set';
                const repsLabel = currentLanguage === 'en' ? 'reps' : 'ulangan';
                const restLabel2 = currentLanguage === 'en' ? 'Rest' : 'Rehat';
                const equipIcon = exercise.equipment === 'gym' ? '🏋️' : exercise.equipment === 'basic' ? '💪' : '🤸';
                
                li.innerHTML = `
                    <div class="exercise-name">${equipIcon} ${exName}</div>
                    <div class="exercise-details">${exercise.sets} ${setsLabel} × ${exercise.reps} ${repsLabel} | ${restLabel2}: ${exercise.rest}</div>
                `;
                exerciseList.appendChild(li);
            });
            
            dayCard.appendChild(exerciseList);
        }
        
        container.appendChild(dayCard);
    });
    
    // Update today's workout preview on home section
    const todayWorkout = document.getElementById('today-workout-content');
    if (todayWorkout && plan.length > 0) {
        const today = plan.find(d => !d.isRest) || plan[0];
        const previewExercises = today.exercises.slice(0, 3);
        todayWorkout.innerHTML = `
            <div class="day-title">${today.name} - ${today.focus}</div>
            <ul class="exercise-list">
                ${previewExercises.map(ex => {
                    const exName = ex.name[currentLanguage] || ex.name.en || ex.name;
                    return `
                    <li class="exercise-item">
                        <div class="exercise-name">${exName}</div>
                        <div class="exercise-details">${ex.sets} sets × ${ex.reps}</div>
                    </li>`;
                }).join('')}
            </ul>
            ${today.exercises.length > 3 ? `<p style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px;">+ ${today.exercises.length - 3} ${currentLanguage === 'en' ? 'more exercises' : 'lagi senaman'}</p>` : ''}
            <button class="btn-primary" style="margin-top:16px;" onclick="showSection('workout')">${currentLanguage === 'en' ? 'View Full Plan' : 'Lihat Pelan Penuh'}</button>
        `;
    }
}

function updateTierBanner() {
    const badge = document.getElementById('workout-tier-badge');
    const text = document.getElementById('workout-tier-text');
    const upgradeBtn = document.getElementById('workout-upgrade-btn');
    const hint = document.getElementById('premium-features-hint');
    
    if (isPremium()) {
        if (badge) { badge.textContent = 'PREMIUM'; badge.className = 'tier-badge premium'; }
        if (text) { text.textContent = currentLanguage === 'en' ? 'All exercises, splits & features unlocked' : 'Semua senaman, split & ciri dibuka'; }
        if (upgradeBtn) { upgradeBtn.style.display = 'none'; }
        if (hint) { hint.style.display = 'none'; }
    } else {
        if (badge) { badge.textContent = 'FREE'; badge.className = 'tier-badge free'; }
        if (text) { text.textContent = currentLanguage === 'en' ? 'Basic exercises & 7-day plans' : 'Senaman asas & pelan 7 hari'; }
        if (upgradeBtn) { upgradeBtn.style.display = ''; }
        if (hint) { hint.style.display = ''; }
    }
}

async function generateNutritionPlan() {
    showLoading(currentLanguage === 'en' ? 'Generating your nutrition plan...' : 'Menjana pelan pemakanan anda...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    nutritionPlan = generateNutritionData();
    displayNutritionPlan(nutritionPlan);
    
    hideLoading();
}

function generateNutritionData() {
    const meals = {
        halal: {
            breakfast: [
                { name: 'Nasi Lemak Sihat', items: ['Brown rice', 'Grilled chicken', 'Cucumber', 'Boiled egg', 'Sambal (less oil)'], calories: 450 },
                { name: 'Roti Canai with Dhal', items: ['Whole wheat roti', 'Protein-rich dhal', 'Banana'], calories: 400 },
                { name: 'Oatmeal with Fruits', items: ['Oats', 'Banana', 'Honey', 'Almonds'], calories: 350 }
            ],
            lunch: [
                { name: 'Ayam Percik with Vegetables', items: ['Grilled chicken percik', 'Mixed vegetables', 'Brown rice'], calories: 550 },
                { name: 'Ikan Bakar Set', items: ['Grilled fish', 'Ulam-ulaman', 'Sambal belacan', 'Rice'], calories: 500 },
                { name: 'Nasi Kerabu', items: ['Blue rice', 'Grilled fish', 'Vegetables', 'Kerisik'], calories: 480 }
            ],
            dinner: [
                { name: 'Sup Ayam', items: ['Chicken soup', 'Vegetables', 'Whole grain bread'], calories: 400 },
                { name: 'Grilled Lamb with Salad', items: ['Lean lamb', 'Mixed salad', 'Olive oil dressing'], calories: 450 },
                { name: 'Tom Yam Soup', items: ['Seafood tom yam', 'Mushrooms', 'Small portion rice'], calories: 380 }
            ]
        },
        vegetarian: {
            breakfast: [
                { name: 'Smoothie Bowl', items: ['Mixed berries', 'Banana', 'Granola', 'Chia seeds'], calories: 350 },
                { name: 'Avocado Toast', items: ['Whole grain bread', 'Avocado', 'Cherry tomatoes', 'Olive oil'], calories: 380 }
            ],
            lunch: [
                { name: 'Buddha Bowl', items: ['Quinoa', 'Chickpeas', 'Roasted vegetables', 'Tahini'], calories: 500 },
                { name: 'Veggie Wrap', items: ['Whole wheat wrap', 'Hummus', 'Mixed vegetables', 'Feta cheese'], calories: 450 }
            ],
            dinner: [
                { name: 'Lentil Curry', items: ['Red lentils', 'Coconut milk', 'Spinach', 'Brown rice'], calories: 420 },
                { name: 'Vegetable Stir-fry', items: ['Tofu', 'Mixed vegetables', 'Soy sauce', 'Rice noodles'], calories: 400 }
            ]
        }
    };
    
    const dietType = userData.diet === 'halal' || userData.diet === 'no-restriction' ? 'halal' : 'vegetarian';
    const mealPlan = meals[dietType];
    
    return {
        breakfast: mealPlan.breakfast[Math.floor(Math.random() * mealPlan.breakfast.length)],
        lunch: mealPlan.lunch[Math.floor(Math.random() * mealPlan.lunch.length)],
        dinner: mealPlan.dinner[Math.floor(Math.random() * mealPlan.dinner.length)]
    };
}

function displayNutritionPlan(plan) {
    const container = document.getElementById('nutrition-plan-container');
    container.innerHTML = '';
    
    const mealIcons = {
        breakfast: '🌅',
        lunch: '☀️',
        dinner: '🌙'
    };
    
    const mealTitles = {
        en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
        bm: { breakfast: 'Sarapan', lunch: 'Makan Tengahari', dinner: 'Makan Malam' }
    };
    
    Object.keys(plan).forEach(mealType => {
        const meal = plan[mealType];
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        
        mealCard.innerHTML = `
            <div class="meal-header">
                <span class="meal-icon">${mealIcons[mealType]}</span>
                <h3 class="meal-title">${mealTitles[currentLanguage][mealType]}</h3>
            </div>
            <h4>${meal.name}</h4>
            <p class="meal-description">${currentLanguage === 'en' ? 'Calories' : 'Kalori'}: ${meal.calories} kcal</p>
            <ul class="meal-items">
                ${meal.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        
        container.appendChild(mealCard);
    });
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (chatHistory.length >= 5 && !isPremium()) {
        alert(currentLanguage === 'en' ? 'Free plan allows 5 messages. Upgrade to Premium for unlimited chat!' : 'Pelan percuma membenarkan 5 mesej. Naik taraf ke Premium untuk sembang tanpa had!');
        showSubscription();
        return;
    }
    
    addChatMessage(message, 'user');
    input.value = '';
    
    chatHistory.push({ role: 'user', content: message });
    
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(response, 'bot');
        chatHistory.push({ role: 'bot', content: response });
    }, 1000);
}

function quickChat(type) {
    const messages = {
        motivation: {
            en: "I need some motivation to keep going!",
            bm: "Saya perlukan motivasi untuk teruskan!"
        },
        tired: {
            en: "I'm feeling too tired to workout today.",
            bm: "Saya rasa terlalu penat untuk bersenam hari ini."
        },
        progress: {
            en: "How am I doing with my fitness goals?",
            bm: "Bagaimana kemajuan saya dengan matlamat kecergasan?"
        }
    };
    
    const message = messages[type][currentLanguage];
    document.getElementById('chat-input').value = message;
    sendMessage();
}

function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
        en: {
            motivation: [
                "You're doing amazing! Every workout counts, no matter how small. Keep pushing forward! 💪",
                "Remember why you started! You've already come so far. Don't give up now!",
                "The hardest part is showing up. You're already winning by being here! 🌟"
            ],
            tired: [
                "It's okay to feel tired! How about a lighter workout today? Even a 15-minute walk counts!",
                "Listen to your body. Rest is important too. Maybe try some gentle stretching instead?",
                "Feeling tired is normal. Would you like me to adjust your plan for today?"
            ],
            progress: [
                `Great question! You've logged ${progressData.workouts.length} workouts so far. Keep it up!`,
                `You're making excellent progress! Your consistency is key to reaching your ${userData.goal} goal.`,
                "You're on the right track! Remember, progress isn't always linear. Trust the process!"
            ],
            general: [
                "I'm here to help! What specific aspect of your fitness journey would you like to discuss?",
                "That's a great question! Let me help you with that.",
                "I understand. Let's work together to find the best solution for you!"
            ]
        },
        bm: {
            motivation: [
                "Anda hebat! Setiap senaman dikira, tidak kira sekecil mana. Teruskan! 💪",
                "Ingat kenapa anda bermula! Anda sudah jauh. Jangan berputus asa!",
                "Bahagian paling susah adalah untuk muncul. Anda sudah menang dengan berada di sini! 🌟"
            ],
            tired: [
                "Tidak mengapa rasa penat! Bagaimana kalau senaman ringan hari ini? 15 minit berjalan pun dikira!",
                "Dengar badan anda. Rehat juga penting. Cuba regangan lembut?",
                "Rasa penat adalah normal. Nak saya laraskan pelan anda untuk hari ini?"
            ],
            progress: [
                `Soalan bagus! Anda sudah log ${progressData.workouts.length} senaman setakat ini. Teruskan!`,
                `Kemajuan anda sangat baik! Konsistensi anda adalah kunci untuk capai matlamat ${userData.goal}.`,
                "Anda di landasan yang betul! Ingat, kemajuan tidak selalunya linear. Percaya pada proses!"
            ],
            general: [
                "Saya di sini untuk membantu! Aspek mana dalam perjalanan kecergasan anda yang ingin dibincangkan?",
                "Soalan yang bagus! Biar saya bantu anda.",
                "Saya faham. Mari kita cari penyelesaian terbaik untuk anda!"
            ]
        }
    };
    
    let responseType = 'general';
    if (lowerMessage.includes('motivat') || lowerMessage.includes('give up') || lowerMessage.includes('berputus')) {
        responseType = 'motivation';
    } else if (lowerMessage.includes('tired') || lowerMessage.includes('penat') || lowerMessage.includes('rest')) {
        responseType = 'tired';
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('kemajuan') || lowerMessage.includes('doing')) {
        responseType = 'progress';
    }
    
    const responseArray = responses[currentLanguage][responseType];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showProgressTab(tabName) {
    document.querySelectorAll('.progress-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`progress-${tabName}`).classList.add('active');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function logProgress() {
    const weight = prompt(currentLanguage === 'en' ? 'Enter your current weight (kg):' : 'Masukkan berat semasa anda (kg):');
    
    if (weight && !isNaN(weight)) {
        progressData.weight.push({
            date: new Date().toISOString(),
            value: parseFloat(weight)
        });
        
        userData.weight = parseFloat(weight);
        document.getElementById('user-weight-display').textContent = `${weight} kg`;
        
        const user = getCurrentUser();
        if (user && user.uid) {
            saveProgressData(user.uid, progressData);
        } else {
            localStorage.setItem('progressData', JSON.stringify(progressData));
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        updateWeightChart();
        updateWeightLog();
        
        alert(currentLanguage === 'en' ? 'Progress logged successfully!' : 'Kemajuan berjaya dilog!');
    }
}

function initializeWeightChart() {
    const canvas = document.getElementById('weight-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    updateWeightChart();
}

function updateWeightChart() {
    const canvas = document.getElementById('weight-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (progressData.weight.length === 0) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(currentLanguage === 'en' ? 'No weight data yet' : 'Belum ada data berat', width / 2, height / 2);
        return;
    }
    
    const weights = progressData.weight.map(w => w.value);
    const maxWeight = Math.max(...weights) + 5;
    const minWeight = Math.min(...weights) - 5;
    const range = maxWeight - minWeight;
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    progressData.weight.forEach((point, index) => {
        const x = padding + (index / (progressData.weight.length - 1 || 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - minWeight) / range) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.stroke();
    
    updateWeightLog();
}

function updateWeightLog() {
    const logList = document.getElementById('weight-log-list');
    if (!logList) return;
    
    logList.innerHTML = '';
    
    progressData.weight.slice().reverse().forEach(entry => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString(currentLanguage === 'en' ? 'en-MY' : 'ms-MY');
        
        logItem.innerHTML = `
            <span>${dateStr}</span>
            <span style="font-weight: 700; color: var(--primary-color);">${entry.value} kg</span>
        `;
        
        logList.appendChild(logItem);
    });
}

async function updateProfile() {
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    
    if (name) userData.name = name;
    if (email) userData.email = email;
    
    const user = getCurrentUser();
    if (user && user.uid) {
        await saveUserProfile(user.uid, userData);
    } else {
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    document.getElementById('user-name-display').textContent = userData.name;
    
    alert(currentLanguage === 'en' ? 'Profile updated successfully!' : 'Profil berjaya dikemaskini!');
}

function showSubscription() {
    document.getElementById('subscription-modal').classList.add('active');
}

function closeSubscription() {
    document.getElementById('subscription-modal').classList.remove('active');
}

function subscribePremium() {
    closeSubscription();

    // Use RevenueCat on native Android, Stripe on web
    if (typeof isNativeApp === 'function' && isNativeApp()) {
        showRevenueCatPaywall();
    } else if (typeof startStripeCheckout === 'function') {
        startStripeCheckout();
    } else {
        alert(currentLanguage === 'en' ? 
            'Payment system is loading. Please try again.' : 
            'Sistem pembayaran sedang dimuatkan. Sila cuba lagi.');
    }
}

function isPremium() {
    return localStorage.getItem('isPremium') === 'true';
}

// ============================================
// Premium Feature Gating
// ============================================
function updatePremiumSections() {
    var premium = isPremium();
    var premiumSections = ['shopping-premium', 'career-premium', 'calendar-premium', 'community-premium'];

    premiumSections.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            if (premium) {
                el.classList.add('unlocked');
            } else {
                el.classList.remove('unlocked');
            }
        }
    });

    // Update upgrade button in navbar
    var upgradeBtn = document.querySelector('.btn-upgrade');
    if (upgradeBtn) {
        if (premium) {
            upgradeBtn.textContent = currentLanguage === 'en' ? '⭐ Premium' : '⭐ Premium';
            upgradeBtn.style.background = 'var(--gradient-primary)';
            upgradeBtn.style.color = '#000';
            upgradeBtn.onclick = null;
        }
    }
}

// ============================================
// Calendar Functions
// ============================================
function initializeCalendar() {
    var calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) return;

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var today = now.getDate();
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday start (0=Mon, 6=Sun)
    var startOffset = (firstDay + 6) % 7;

    calendarBody.innerHTML = '';

    // Empty cells before first day
    for (var i = 0; i < startOffset; i++) {
        var empty = document.createElement('div');
        empty.className = 'calendar-day';
        calendarBody.appendChild(empty);
    }

    // Workout days (simulate some events)
    var eventDays = [];
    if (workoutPlan && workoutPlan.length > 0) {
        for (var d = 0; d < Math.min(workoutPlan.length, daysInMonth); d++) {
            if (!workoutPlan[d].isRest) {
                eventDays.push(d + 1);
            }
        }
    } else {
        // Default events: Mon, Wed, Fri of current week
        for (var d = 1; d <= daysInMonth; d++) {
            var dayOfWeek = new Date(year, month, d).getDay();
            if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
                eventDays.push(d);
            }
        }
    }

    for (var day = 1; day <= daysInMonth; day++) {
        var dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;

        if (day === today) {
            dayEl.classList.add('today');
        }
        if (eventDays.indexOf(day) !== -1) {
            dayEl.classList.add('has-event');
        }

        calendarBody.appendChild(dayEl);
    }
}

function showLoading(text) {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = text;
    overlay.classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Quick synchronous setup first (non-blocking)
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    currentLanguage = savedLanguage;
    setTheme(savedTheme);
    
    // Setup event listeners (lightweight)
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    window.onclick = (event) => {
        const modal = document.getElementById('subscription-modal');
        if (event.target === modal) {
            closeSubscription();
        }
    };
    
    // Defer heavy operations to next tick (non-blocking)
    setTimeout(() => {
        initializeApp();
    }, 0);
});

// Separate async initialization function
async function initializeApp() {
    // Initialize Firebase
    initializeFirebase();
    
    // Check if user already has saved data - skip auth check, go to dashboard
    const savedUserData = localStorage.getItem('userData');
    const savedProgressData = localStorage.getItem('progressData');
    
    if (savedUserData) {
        try {
            userData = JSON.parse(savedUserData);
            document.getElementById('welcome-screen').classList.remove('active');
            document.getElementById('dashboard-screen').classList.add('active');
            initializeDashboard();
        } catch (e) {
            console.error('Error loading saved user data:', e);
        }
    }
    
    if (savedProgressData) {
        try {
            progressData = JSON.parse(savedProgressData);
        } catch (e) {
            console.error('Error loading saved progress data:', e);
        }
    }
    
    // Check authentication in background (don't block UI)
    try {
        onAuthStateChanged(async function(user) {
            if (user) {
                // User is authenticated with Firebase - load data in background
                try {
                    const profile = await loadUserProfile(user.uid);
                    if (profile) {
                        userData = profile;
                    }
                } catch (e) {
                    console.warn('Could not load profile from Firebase:', e);
                }
                
                try {
                    const progress = await loadProgressData(user.uid);
                    if (progress) {
                        progressData = progress;
                    }
                } catch (e) {
                    console.warn('Could not load progress from Firebase:', e);
                }
                
                try {
                    const plan = await loadWorkoutPlan(user.uid);
                    if (plan) {
                        workoutPlan = plan;
                    }
                } catch (e) {
                    console.warn('Could not load workout plan from Firebase:', e);
                }
            }
            // Do NOT redirect to index.html - user may be on onboarding screen
        });
    } catch (e) {
        console.warn('Auth state check failed:', e);
    }
}
