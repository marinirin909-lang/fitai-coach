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
    const currentStep = document.querySelector('.onboarding-step.active');
    if (!validateCurrentStep(currentStep)) return;
    
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
    
    const user = getCurrentUser();
    
    if (user && user.uid) {
        // Save to Firebase
        await saveUserProfile(user.uid, userData);
    } else {
        // Fallback to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    await initializeDashboard();
    updateLanguage();
}

async function logout() {
    if (confirm(currentLanguage === 'en' ? 'Are you sure you want to logout?' : 'Adakah anda pasti mahu log keluar?')) {
        await firebaseLogout();
        localStorage.removeItem('userSession');
        window.location.href = 'landing.html';
    }
}

async function initializeDashboard() {
    const user = getCurrentUser();
    
    if (user && user.uid) {
        // Firebase user
        const profile = await loadUserProfile(user.uid);
        if (profile && profile.name) {
            userData.name = profile.name;
        } else if (user.displayName) {
            userData.name = user.displayName;
        }
        
        document.getElementById('user-name-display').textContent = userData.name || 'User';
        
        const emailDisplay = document.getElementById('logged-in-email');
        if (emailDisplay) {
            emailDisplay.textContent = user.email || userData.email || 'Not set';
        }
    } else {
        // LocalStorage fallback
        document.getElementById('user-name-display').textContent = userData.name;
        
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            const session = JSON.parse(userSession);
            const emailDisplay = document.getElementById('logged-in-email');
            if (emailDisplay) {
                emailDisplay.textContent = session.email || userData.email || 'Not set';
            }
        }
    }
    
    const goalText = {
        'lose-weight': currentLanguage === 'en' ? 'Lose Weight' : 'Kurangkan Berat',
        'build-muscle': currentLanguage === 'en' ? 'Build Muscle' : 'Bina Otot',
        'get-fit': currentLanguage === 'en' ? 'Get Fit & Healthy' : 'Jadi Cergas & Sihat',
        'flexibility': currentLanguage === 'en' ? 'Improve Flexibility' : 'Tingkatkan Fleksibiliti',
        'endurance': currentLanguage === 'en' ? 'Build Endurance' : 'Bina Daya Tahan'
    };
    document.getElementById('user-goal-display').textContent = goalText[userData.goal];
    
    document.getElementById('user-weight-display').textContent = `${userData.weight} kg`;
    
    const bmr = calculateBMR();
    document.getElementById('user-bmr-display').textContent = Math.round(bmr);
    document.getElementById('calorie-target').textContent = Math.round(bmr);
    
    const macros = calculateMacros(bmr);
    document.getElementById('protein-target').textContent = `${macros.protein}g`;
    document.getElementById('carbs-target').textContent = `${macros.carbs}g`;
    document.getElementById('fats-target').textContent = `${macros.fats}g`;
    
    document.getElementById('workout-streak').textContent = progressData.streak;
    
    const quote = motivationalQuotes[currentLanguage][Math.floor(Math.random() * motivationalQuotes[currentLanguage].length)];
    document.getElementById('daily-quote').textContent = `"${quote}"`;
    
    document.getElementById('settings-name').value = userData.name;
    
    initializeWeightChart();
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
    
    bmr *= activityMultipliers[userData.activity];
    
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
    if (!isPremium() && workoutDuration > 7) {
        alert(currentLanguage === 'en' ? 'Premium subscription required for plans longer than 7 days!' : 'Langganan Premium diperlukan untuk pelan lebih dari 7 hari!');
        showSubscription();
        return;
    }
    
    const user = getCurrentUser();
    
    showLoading(currentLanguage === 'en' ? 'Generating your personalized workout plan...' : 'Menjana pelan senaman diperibadikan anda...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const duration = parseInt(document.getElementById('plan-duration').value);
    const equipment = document.getElementById('plan-equipment').value;
    
    workoutPlan = generateWorkoutPlanData(duration, equipment);
    
    if (user && user.uid) {
        await saveWorkoutPlan(user.uid, workoutPlan);
    } else {
        localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    }
    
    displayWorkoutPlan(workoutPlan);
    
    hideLoading();
}

function generateWorkoutPlanData(duration, equipment) {
    const exercises = {
        none: {
            strength: ['Push-ups', 'Squats', 'Lunges', 'Plank', 'Mountain Climbers', 'Burpees', 'Jumping Jacks', 'High Knees'],
            cardio: ['Running in place', 'Jump rope', 'High knees', 'Burpees', 'Mountain climbers'],
            flexibility: ['Yoga stretches', 'Dynamic stretches', 'Leg swings', 'Arm circles']
        },
        basic: {
            strength: ['Dumbbell curls', 'Shoulder press', 'Goblet squats', 'Dumbbell rows', 'Chest press', 'Tricep extensions'],
            cardio: ['Jump rope', 'Resistance band cardio', 'Kettlebell swings'],
            flexibility: ['Resistance band stretches', 'Yoga with bands']
        },
        gym: {
            strength: ['Bench press', 'Deadlifts', 'Squats', 'Pull-ups', 'Lat pulldowns', 'Leg press', 'Cable rows'],
            cardio: ['Treadmill', 'Elliptical', 'Rowing machine', 'Stair climber'],
            flexibility: ['Foam rolling', 'Stretching machines', 'Yoga']
        }
    };
    
    const plan = [];
    const equipmentExercises = exercises[equipment];
    
    for (let day = 1; day <= duration; day++) {
        const dayPlan = {
            day: day,
            name: `Day ${day}`,
            focus: day % 3 === 1 ? 'Strength' : day % 3 === 2 ? 'Cardio' : 'Flexibility',
            exercises: []
        };
        
        const focusType = dayPlan.focus.toLowerCase();
        const exercisePool = equipmentExercises[focusType] || equipmentExercises.strength;
        
        const numExercises = userData.level === 'beginner' ? 4 : userData.level === 'intermediate' ? 6 : 8;
        
        for (let i = 0; i < numExercises; i++) {
            const exercise = exercisePool[i % exercisePool.length];
            const sets = userData.level === 'beginner' ? 3 : userData.level === 'intermediate' ? 4 : 5;
            const reps = focusType === 'cardio' ? '30-60 sec' : userData.level === 'beginner' ? '8-10' : userData.level === 'intermediate' ? '10-12' : '12-15';
            
            dayPlan.exercises.push({
                name: exercise,
                sets: sets,
                reps: reps,
                rest: '60 sec'
            });
        }
        
        plan.push(dayPlan);
    }
    
    return plan;
}

function displayWorkoutPlan(plan) {
    const container = document.getElementById('workout-plan-container');
    container.innerHTML = '';
    
    plan.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <div class="day-title">${currentLanguage === 'en' ? 'Day' : 'Hari'} ${day.day} - ${day.focus}</div>
        `;
        
        const exerciseList = document.createElement('ul');
        exerciseList.className = 'exercise-list';
        
        day.exercises.forEach(exercise => {
            const li = document.createElement('li');
            li.className = 'exercise-item';
            li.innerHTML = `
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-details">${exercise.sets} ${currentLanguage === 'en' ? 'sets' : 'set'} × ${exercise.reps} ${currentLanguage === 'en' ? 'reps' : 'ulangan'} | ${currentLanguage === 'en' ? 'Rest' : 'Rehat'}: ${exercise.rest}</div>
            `;
            exerciseList.appendChild(li);
        });
        
        dayCard.appendChild(dayHeader);
        dayCard.appendChild(exerciseList);
        container.appendChild(dayCard);
    });
    
    const todayWorkout = document.getElementById('today-workout-content');
    if (plan.length > 0) {
        const today = plan[0];
        todayWorkout.innerHTML = `
            <div class="day-title">${today.name} - ${today.focus}</div>
            <ul class="exercise-list">
                ${today.exercises.slice(0, 3).map(ex => `
                    <li class="exercise-item">
                        <div class="exercise-name">${ex.name}</div>
                        <div class="exercise-details">${ex.sets} sets × ${ex.reps} reps</div>
                    </li>
                `).join('')}
            </ul>
            <button class="btn-primary" onclick="showSection('workout')">${currentLanguage === 'en' ? 'View Full Plan' : 'Lihat Pelan Penuh'}</button>
        `;
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
    alert(currentLanguage === 'en' ? 
        'Premium subscription coming soon! This will integrate with Stripe/RevenueCat for RM29/month.' : 
        'Langganan Premium akan datang! Ini akan disepadukan dengan Stripe/RevenueCat untuk RM29/bulan.');
    
    localStorage.setItem('isPremium', 'true');
    
    document.getElementById('subscription-badge').innerHTML = '<span>Premium Plan</span>';
    document.getElementById('subscription-badge').className = 'status-badge premium';
    
    closeSubscription();
}

function isPremium() {
    return localStorage.getItem('isPremium') === 'true';
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

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    initializeFirebase();
    
    // Check authentication
    onAuthStateChanged(async function(user) {
        if (!user) {
            // Check localStorage fallback
            const userSession = localStorage.getItem('userSession');
            if (!userSession) {
                window.location.href = 'landing.html';
                return;
            }
            
            try {
                const session = JSON.parse(userSession);
                if (!session.isLoggedIn) {
                    window.location.href = 'landing.html';
                    return;
                }
            } catch (error) {
                console.error('Invalid session:', error);
                window.location.href = 'landing.html';
                return;
            }
        } else {
            // User is authenticated with Firebase
            // Load user data from Firestore
            const profile = await loadUserProfile(user.uid);
            if (profile) {
                userData = profile;
            }
            
            // Load progress data
            const progress = await loadProgressData(user.uid);
            if (progress) {
                progressData = progress;
            }
            
            // Load workout plan
            const plan = await loadWorkoutPlan(user.uid);
            if (plan) {
                workoutPlan = plan;
            }
        }
    });
    
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedUserData = localStorage.getItem('userData');
    const savedProgressData = localStorage.getItem('progressData');
    
    currentLanguage = savedLanguage;
    setTheme(savedTheme);
    
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        initializeDashboard();
    }
    
    if (savedProgressData) {
        progressData = JSON.parse(savedProgressData);
    }
    
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
});
