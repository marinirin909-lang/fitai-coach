/* FitAI Coach v2 — app logic
   Single-file client. Data lives in localStorage and, for signed-in users,
   syncs to Firestore at users/{uid}/app/state. Premium status is read from
   users/{uid} (written only by Cloud Functions after a verified purchase). */
(function () {
  "use strict";

  // =====================================================================
  // CONFIG — check these after deploying functions (Firebase console > Functions shows each URL)
  // =====================================================================
  var CONFIG = {
    version: "2.0.0",
    fn: {
      aiCoach: "https://aicoach-ow42qa5fnq-uc.a.run.app",
      deleteAccount: "https://deleteaccount-ow42qa5fnq-uc.a.run.app",
      checkout: "https://createcheckoutsession-ow42qa5fnq-uc.a.run.app",
      portal: "https://createportalsession-ow42qa5fnq-uc.a.run.app"
    },
    webPriceLabel: { en: "RM39 / month", bm: "RM39 / bulan" },
    // RevenueCat public SDK key for iOS (starts with appl_). Leave empty until the iOS plugin is installed.
    revenueCatIosKey: "",
    supportEmail: "privacyfitaicoach@hotmail.com",
    privacyUrl: "privacy-policy.html",
    termsUrl: "terms-and-conditions.html",
    minAge: 16,
    freeMaxPlanDays: 7
  };

  // =====================================================================
  // i18n
  // =====================================================================
  var T = {
    en: {
      tagline: "Your plan, your pace.",
      gateIntro: "Workouts built around your equipment, meals that fit Malaysian kitchens, and a coach you can ask anything.",
      signIn: "Sign in", signUp: "Create account", email: "Email", password: "Password", name: "Your name",
      forgot: "Forgot password?", resetSent: "Password reset email sent. Check your inbox.",
      haveAccount: "Already have an account?", noAccount: "New to FitAI Coach?",
      guest: "Try without an account", guestNote: "Guest data stays on this device. AI Coach and sync need an account.",
      pwHint: "At least 8 characters",
      step: "Step", next: "Continue", back: "Back", finish: "Build my plan",
      aboutYou: "About you", age: "Age", gender: "Sex", male: "Male", female: "Female",
      height: "Height (cm)", weight: "Weight (kg)", targetWeight: "Target weight (kg, optional)",
      howActive: "How active are you?", level: "Training experience",
      act_sedentary: "Mostly sitting", act_sedentary_d: "Desk job, little exercise",
      act_light: "Lightly active", act_light_d: "Exercise 1–3 days a week",
      act_moderate: "Active", act_moderate_d: "Exercise 3–5 days a week",
      act_very: "Very active", act_very_d: "Hard training 6–7 days",
      lvl_beginner: "Beginner", lvl_intermediate: "Intermediate", lvl_advanced: "Advanced",
      goalDiet: "Goal and diet", goal: "Main goal",
      goal_lose: "Lose fat", goal_muscle: "Build muscle", goal_fit: "Get fitter", goal_endurance: "Endurance",
      diet: "Diet", diet_halal: "Halal", diet_vegetarian: "Vegetarian", diet_vegan: "Vegan", diet_any: "No restriction",
      consent: "I understand FitAI Coach gives general fitness guidance, not medical advice, and I will check with a doctor before starting if I have a health condition, injury or am pregnant.",
      ageError: "You must be at least {n} to use FitAI Coach.",
      fillAll: "Fill in every field to continue.",
      tabHome: "Today", tabTrain: "Train", tabEat: "Eat", tabCoach: "Coach", tabProgress: "Progress",
      morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening",
      eaten: "eaten", ofTarget: "of {n} kcal", workoutRing: "Workout", caloriesRing: "Calories",
      sessionDone: "Done today", sessionTodo: "Not started", restDay: "Rest day",
      todaySession: "Today's session", startSession: "Start session", openSession: "Open session",
      noPlan: "No training plan yet", noPlanBody: "Answer three questions and get a plan that matches your equipment and level.",
      createPlan: "Create plan", streak: "day streak", workouts: "workouts", weightChange: "kg change",
      logWeight: "Log weight", save: "Save", cancel: "Cancel", saved: "Saved",
      planSetup: "Build your plan", split: "Split", duration: "Length", equipment: "Equipment",
      eq_none: "No equipment", eq_basic: "Dumbbells and bands", eq_gym: "Full gym",
      days: "{n} days", generate: "Generate plan", regenerate: "New plan",
      planDay: "Day {n}", exercises: "{n} exercises", sets: "sets", reps: "reps", rest: "rest",
      completeSession: "Finish session", sessionComplete: "Session logged. Nice work.",
      startRest: "Rest timer", stop: "Stop", restOver: "Rest over",
      planEnded: "Plan finished", planEndedBody: "You completed every day of this plan. Build the next one.",
      premiumOnly: "Premium", premiumSplit: "This split is part of Premium.",
      premiumLength: "Free plans run up to 7 days.",
      eatTitle: "Today's meals", targets: "Daily targets", protein: "Protein", carbs: "Carbs", fat: "Fat",
      breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
      markEaten: "Mark eaten", eatenDone: "Eaten", swap: "Swap", portion: "Portion ×{n}",
      water: "Water", glasses: "{n} of 8 glasses",
      coachTitle: "Coach", coachIntro: "Ask about training, food, recovery or motivation. Replies are AI-generated and may be wrong; this is not medical advice.",
      askPlaceholder: "Ask your coach…", send: "Send", report: "Report", copy: "Copy", copied: "Copied",
      reported: "Thanks. This reply was reported for review.",
      q1: "What should I eat before training?", q2: "I missed 3 days. How do I restart?", q3: "Is my calorie target right?", q4: "Knee-friendly leg exercises",
      coachNeedsAccount: "AI Coach needs an account so your messages stay private and synced.",
      limitReached: "You've used today's {n} free messages. Premium raises the limit to 100 a day.",
      aiError: "Coach couldn't reply. Check your connection and try again.",
      remaining: "{n} messages left today",
      progressTitle: "Progress", weightTrend: "Weight", bmi: "BMI", thisMonth: "This month",
      history: "Recent sessions", noWeights: "Log your weight a few times to see your trend.",
      noHistory: "Finished sessions appear here.",
      settings: "Settings", profile: "Profile", editProfile: "Edit profile", language: "Language", theme: "Appearance",
      th_system: "System", th_light: "Light", th_dark: "Dark",
      subscription: "Subscription", free: "Free plan", premium: "Premium", upgrade: "Upgrade to Premium", upgradeShort: "Go Premium",
      restore: "Restore purchases", manage: "Manage subscription",
      legal: "Legal and support", privacy: "Privacy policy", terms: "Terms of use", contact: "Contact support",
      disclaimer: "Health disclaimer",
      disclaimerBody: "FitAI Coach provides general fitness and nutrition information for healthy adults. It does not diagnose, treat or prevent any condition. Stop exercising and seek medical help if you feel chest pain, dizziness or shortness of breath. Speak to a doctor before changing your diet or training if you have a medical condition, injury, or are pregnant.",
      account: "Account", signOut: "Sign out", deleteAccount: "Delete account", createAccount: "Create an account",
      deleteTitle: "Delete your account?", deleteBody: "This permanently removes your profile, plans, logs and chat history, and cancels any web subscription. App Store and Google Play subscriptions must be cancelled in the store.",
      typeDelete: "Type DELETE to confirm", deleteNow: "Delete permanently", deleted: "Account deleted.",
      resetGuest: "Erase data on this device", resetGuestBody: "This removes all guest data stored on this device.",
      paywallTitle: "FitAI Coach Premium", paywallSub: "Everything in Free, plus:",
      perk1: "Plans up to 90 days with deload weeks", perk2: "All splits: upper/lower, push/pull/legs, 5-day",
      perk3: "Full exercise library and progressions", perk4: "100 AI Coach messages a day",
      perk5: "Mobility sessions on rest days",
      subscribe: "Subscribe", autoRenew: "Subscription renews automatically each month until cancelled. Cancel any time in your account settings at least 24 hours before renewal. Payment is charged to your account on confirmation.",
      iosSoon: "In-app subscription on iPhone is not available in this version.",
      storeNotReady: "Store billing isn't ready. Try again in a moment.",
      paySuccess: "Payment received. Premium unlocks within a minute.",
      signedOut: "Signed out.", offline: "You're offline. Changes are saved on this device.",
      version: "Version", close: "Close", errorGeneric: "Something went wrong. Try again.",
      authErr_invalid: "Email or password is incorrect.", authErr_inuse: "That email already has an account. Sign in instead.",
      authErr_weak: "Use at least 8 characters.", authErr_email: "Enter a valid email address.",
      authErr_net: "No connection. Check your internet and try again."
    },
    bm: {
      tagline: "Pelan anda, rentak anda.",
      gateIntro: "Senaman ikut peralatan anda, menu sesuai dapur Malaysia, dan jurulatih yang boleh ditanya apa sahaja.",
      signIn: "Log masuk", signUp: "Cipta akaun", email: "E-mel", password: "Kata laluan", name: "Nama anda",
      forgot: "Lupa kata laluan?", resetSent: "E-mel set semula kata laluan dihantar. Semak peti masuk anda.",
      haveAccount: "Sudah ada akaun?", noAccount: "Baru dengan FitAI Coach?",
      guest: "Cuba tanpa akaun", guestNote: "Data tetamu disimpan dalam peranti ini sahaja. Jurulatih AI dan penyegerakan perlukan akaun.",
      pwHint: "Sekurang-kurangnya 8 aksara",
      step: "Langkah", next: "Teruskan", back: "Kembali", finish: "Bina pelan saya",
      aboutYou: "Tentang anda", age: "Umur", gender: "Jantina", male: "Lelaki", female: "Perempuan",
      height: "Tinggi (cm)", weight: "Berat (kg)", targetWeight: "Berat sasaran (kg, pilihan)",
      howActive: "Seberapa aktif anda?", level: "Pengalaman latihan",
      act_sedentary: "Banyak duduk", act_sedentary_d: "Kerja pejabat, kurang bersenam",
      act_light: "Sedikit aktif", act_light_d: "Bersenam 1–3 hari seminggu",
      act_moderate: "Aktif", act_moderate_d: "Bersenam 3–5 hari seminggu",
      act_very: "Sangat aktif", act_very_d: "Latihan berat 6–7 hari",
      lvl_beginner: "Permulaan", lvl_intermediate: "Pertengahan", lvl_advanced: "Mahir",
      goalDiet: "Matlamat dan diet", goal: "Matlamat utama",
      goal_lose: "Turun lemak", goal_muscle: "Bina otot", goal_fit: "Lebih cergas", goal_endurance: "Daya tahan",
      diet: "Diet", diet_halal: "Halal", diet_vegetarian: "Vegetarian", diet_vegan: "Vegan", diet_any: "Tiada sekatan",
      consent: "Saya faham FitAI Coach memberi panduan kecergasan umum, bukan nasihat perubatan, dan saya akan berjumpa doktor dahulu jika ada masalah kesihatan, kecederaan atau sedang hamil.",
      ageError: "Anda mesti berumur sekurang-kurangnya {n} tahun untuk menggunakan FitAI Coach.",
      fillAll: "Lengkapkan semua ruangan untuk teruskan.",
      tabHome: "Hari ini", tabTrain: "Latihan", tabEat: "Makan", tabCoach: "Jurulatih", tabProgress: "Kemajuan",
      morning: "Selamat pagi", afternoon: "Selamat petang", evening: "Selamat malam",
      eaten: "dimakan", ofTarget: "daripada {n} kcal", workoutRing: "Senaman", caloriesRing: "Kalori",
      sessionDone: "Selesai hari ini", sessionTodo: "Belum mula", restDay: "Hari rehat",
      todaySession: "Sesi hari ini", startSession: "Mula sesi", openSession: "Buka sesi",
      noPlan: "Belum ada pelan latihan", noPlanBody: "Jawab tiga soalan dan dapatkan pelan yang sepadan dengan peralatan dan tahap anda.",
      createPlan: "Cipta pelan", streak: "hari berturut", workouts: "senaman", weightChange: "kg perubahan",
      logWeight: "Rekod berat", save: "Simpan", cancel: "Batal", saved: "Disimpan",
      planSetup: "Bina pelan anda", split: "Pembahagian", duration: "Tempoh", equipment: "Peralatan",
      eq_none: "Tiada peralatan", eq_basic: "Dumbbell dan band", eq_gym: "Gim penuh",
      days: "{n} hari", generate: "Jana pelan", regenerate: "Pelan baharu",
      planDay: "Hari {n}", exercises: "{n} senaman", sets: "set", reps: "ulangan", rest: "rehat",
      completeSession: "Tamatkan sesi", sessionComplete: "Sesi direkod. Bagus!",
      startRest: "Pemasa rehat", stop: "Henti", restOver: "Rehat tamat",
      planEnded: "Pelan selesai", planEndedBody: "Anda telah melengkapkan setiap hari dalam pelan ini. Bina pelan seterusnya.",
      premiumOnly: "Premium", premiumSplit: "Pembahagian ini sebahagian daripada Premium.",
      premiumLength: "Pelan percuma sehingga 7 hari.",
      eatTitle: "Menu hari ini", targets: "Sasaran harian", protein: "Protein", carbs: "Karbohidrat", fat: "Lemak",
      breakfast: "Sarapan", lunch: "Makan tengah hari", dinner: "Makan malam", snack: "Snek",
      markEaten: "Tanda dimakan", eatenDone: "Dimakan", swap: "Tukar", portion: "Hidangan ×{n}",
      water: "Air", glasses: "{n} daripada 8 gelas",
      coachTitle: "Jurulatih", coachIntro: "Tanya tentang latihan, makanan, pemulihan atau motivasi. Jawapan dijana AI dan mungkin salah; ini bukan nasihat perubatan.",
      askPlaceholder: "Tanya jurulatih anda…", send: "Hantar", report: "Laporkan", copy: "Salin", copied: "Disalin",
      reported: "Terima kasih. Jawapan ini telah dilaporkan untuk semakan.",
      q1: "Apa patut saya makan sebelum latihan?", q2: "Saya terlepas 3 hari. Macam mana nak mula semula?", q3: "Betulkah sasaran kalori saya?", q4: "Senaman kaki yang mesra lutut",
      coachNeedsAccount: "Jurulatih AI perlukan akaun supaya mesej anda kekal peribadi dan disegerakkan.",
      limitReached: "Anda telah guna {n} mesej percuma hari ini. Premium menaikkan had kepada 100 sehari.",
      aiError: "Jurulatih tidak dapat membalas. Semak sambungan dan cuba lagi.",
      remaining: "Baki {n} mesej hari ini",
      progressTitle: "Kemajuan", weightTrend: "Berat", bmi: "BMI", thisMonth: "Bulan ini",
      history: "Sesi terkini", noWeights: "Rekod berat beberapa kali untuk melihat trend anda.",
      noHistory: "Sesi yang selesai akan dipaparkan di sini.",
      settings: "Tetapan", profile: "Profil", editProfile: "Sunting profil", language: "Bahasa", theme: "Paparan",
      th_system: "Sistem", th_light: "Cerah", th_dark: "Gelap",
      subscription: "Langganan", free: "Pelan percuma", premium: "Premium", upgrade: "Naik taraf ke Premium", upgradeShort: "Naik taraf",
      restore: "Pulihkan pembelian", manage: "Urus langganan",
      legal: "Undang-undang dan sokongan", privacy: "Dasar privasi", terms: "Terma penggunaan", contact: "Hubungi sokongan",
      disclaimer: "Penafian kesihatan",
      disclaimerBody: "FitAI Coach memberi maklumat kecergasan dan pemakanan umum untuk orang dewasa yang sihat. Ia tidak mendiagnosis, merawat atau mencegah sebarang penyakit. Berhenti bersenam dan dapatkan bantuan perubatan jika anda sakit dada, pening atau sesak nafas. Berjumpa doktor sebelum mengubah diet atau latihan jika anda mempunyai masalah kesihatan, kecederaan atau sedang hamil.",
      account: "Akaun", signOut: "Log keluar", deleteAccount: "Padam akaun", createAccount: "Cipta akaun",
      deleteTitle: "Padam akaun anda?", deleteBody: "Ini akan membuang profil, pelan, rekod dan sejarah sembang anda secara kekal, serta membatalkan langganan web. Langganan App Store dan Google Play perlu dibatalkan di kedai masing-masing.",
      typeDelete: "Taip DELETE untuk mengesahkan", deleteNow: "Padam secara kekal", deleted: "Akaun dipadam.",
      resetGuest: "Padam data dalam peranti ini", resetGuestBody: "Ini akan membuang semua data tetamu dalam peranti ini.",
      paywallTitle: "FitAI Coach Premium", paywallSub: "Semua dalam Percuma, ditambah:",
      perk1: "Pelan sehingga 90 hari dengan minggu deload", perk2: "Semua pembahagian: atas/bawah, tolak/tarik/kaki, 5 hari",
      perk3: "Pustaka senaman penuh dan progresi", perk4: "100 mesej Jurulatih AI sehari",
      perk5: "Sesi mobiliti pada hari rehat",
      subscribe: "Langgan", autoRenew: "Langganan diperbaharui secara automatik setiap bulan sehingga dibatalkan. Batalkan bila-bila masa dalam tetapan akaun sekurang-kurangnya 24 jam sebelum pembaharuan. Bayaran dicaj ke akaun anda selepas pengesahan.",
      iosSoon: "Langganan dalam aplikasi untuk iPhone belum tersedia dalam versi ini.",
      storeNotReady: "Sistem bayaran kedai belum sedia. Cuba sebentar lagi.",
      paySuccess: "Bayaran diterima. Premium akan dibuka dalam masa seminit.",
      signedOut: "Telah log keluar.", offline: "Anda di luar talian. Perubahan disimpan dalam peranti ini.",
      version: "Versi", close: "Tutup", errorGeneric: "Ada masalah. Cuba lagi.",
      authErr_invalid: "E-mel atau kata laluan salah.", authErr_inuse: "E-mel itu sudah mempunyai akaun. Sila log masuk.",
      authErr_weak: "Guna sekurang-kurangnya 8 aksara.", authErr_email: "Masukkan alamat e-mel yang sah.",
      authErr_net: "Tiada sambungan. Semak internet anda dan cuba lagi."
    }
  };

  // =====================================================================
  // Icons (inline, stroke-based)
  // =====================================================================
  var ICON = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
    dumbbell: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
    flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    alert: '<path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17.5v.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    scale: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9a6 6 0 0 1 8 0l-3 4"/>'
  };
  function icon(name, cls) {
    return '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICON[name] || '') + '</svg>';
  }

  // =====================================================================
  // Utilities
  // =====================================================================
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function dateKey(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function parseKey(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return dateKey(d); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function round(v, p) { var f = Math.pow(10, p || 0); return Math.round(v * f) / f; }
  function fmtDate(k, opts) {
    try { return parseKey(k).toLocaleDateString(state.settings.lang === "bm" ? "ms-MY" : "en-MY", opts || { day: "numeric", month: "short" }); }
    catch (e) { return k; }
  }

  // =====================================================================
  // State
  // =====================================================================
  var DEFAULT_STATE = function () {
    return {
      v: 2,
      updatedAt: 0,
      profile: null,
      consent: null,
      plan: null,
      sessions: {},      // dateKey -> { day, done: [idx], completed: bool, focus }
      weights: [],       // [{ d, kg }]
      meals: {},         // dateKey -> { picks: {breakfast: idx...}, eaten: {breakfast: true} }
      water: {},         // dateKey -> n
      chat: [],          // [{ role, content, ts }]
      settings: { lang: (navigator.language || "en").toLowerCase().indexOf("ms") === 0 ? "bm" : "en", theme: "system" }
    };
  };

  var session = {
    user: null,          // firebase user
    guest: false,
    premium: false,
    subStatus: "none",
    online: navigator.onLine,
    tab: "home",
    trainDay: null,
    unsubUser: null,
    aiRemaining: null
  };
  var state = DEFAULT_STATE();

  function storeKey() { return "fitai.v2." + (session.user ? session.user.uid : "guest"); }
  function loadLocal() {
    try {
      var raw = localStorage.getItem(storeKey());
      if (raw) {
        var s = JSON.parse(raw);
        state = Object.assign(DEFAULT_STATE(), s);
        state.settings = Object.assign(DEFAULT_STATE().settings, s.settings || {});
        return true;
      }
    } catch (e) { console.warn("local load failed", e); }
    state = DEFAULT_STATE();
    // Carry over UI preferences from the device
    try { var pref = JSON.parse(localStorage.getItem("fitai.prefs") || "{}"); Object.assign(state.settings, pref); } catch (e) {}
    return false;
  }

  var syncTimer = null;
  function save() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(storeKey(), JSON.stringify(state)); } catch (e) { console.warn(e); }
    try { localStorage.setItem("fitai.prefs", JSON.stringify(state.settings)); } catch (e) {}
    if (session.user && fb.db) {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(pushRemote, 1200);
    }
  }
  function pushRemote() {
    if (!session.user || !fb.db) return;
    var payload = JSON.parse(JSON.stringify(state));
    payload.chat = payload.chat.slice(-60);
    fb.db.collection("users").doc(session.user.uid).collection("app").doc("state")
      .set(payload).catch(function (e) { console.warn("sync failed", e); });
  }
  function pullRemote() {
    if (!session.user || !fb.db) return Promise.resolve();
    return fb.db.collection("users").doc(session.user.uid).collection("app").doc("state").get()
      .then(function (snap) {
        if (snap.exists) {
          var remote = snap.data();
          if (!state.updatedAt || (remote.updatedAt || 0) > state.updatedAt) {
            state = Object.assign(DEFAULT_STATE(), remote);
            state.settings = Object.assign(DEFAULT_STATE().settings, remote.settings || {});
            localStorage.setItem(storeKey(), JSON.stringify(state));
          } else {
            pushRemote();
          }
        } else if (state.profile) {
          pushRemote();
        }
      })
      .catch(function (e) { console.warn("pull failed", e); });
  }

  function t(key, vars) {
    var s = (T[state.settings.lang] || T.en)[key];
    if (s == null) s = T.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function L(obj) { return obj ? (obj[state.settings.lang] || obj.en || "") : ""; }

  // =====================================================================
  // UI helpers
  // =====================================================================
  var root = null;
  function toast(msg, ms) {
    var el = document.createElement("div");
    el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, ms || 2600);
  }
  function loading(on) {
    var el = $("#loader");
    if (on && !el) {
      el = document.createElement("div"); el.id = "loader"; el.className = "loader";
      el.innerHTML = '<div class="spinner" role="progressbar" aria-label="Loading"></div>';
      document.body.appendChild(el);
    } else if (!on && el) el.remove();
  }
  function sheet(html, opts) {
    closeSheet();
    var scrim = document.createElement("div");
    scrim.className = "scrim"; scrim.id = "scrim";
    scrim.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' +
      '<div class="grabber"></div>' +
      '<div class="sheet-head"><h2 class="t-title">' + esc(opts && opts.title || "") + '</h2>' +
      '<button class="icon-btn" data-close aria-label="' + esc(t("close")) + '">' + icon("close") + '</button></div>' +
      html + '</div>';
    scrim.addEventListener("click", function (e) {
      if (e.target === scrim || e.target.closest("[data-close]")) closeSheet();
    });
    document.body.appendChild(scrim);
    var first = scrim.querySelector("input, button:not([data-close])");
    if (first && opts && opts.focus) first.focus();
    return scrim;
  }
  function closeSheet() { var s = $("#scrim"); if (s) s.remove(); stopRestTimer(); }
  function applyTheme() {
    var th = state.settings.theme;
    if (th === "system") th = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", th);
    document.documentElement.setAttribute("lang", state.settings.lang === "bm" ? "ms" : "en");
    var meta = $('meta[name="theme-color"]'); if (meta) meta.content = th === "dark" ? "#0d1412" : "#f2f4f3";
  }

  var fb = { auth: null, db: null };
  var restTimer = null;
  function stopRestTimer() { if (restTimer) { clearInterval(restTimer); restTimer = null; } }

  // =====================================================================
  // Fitness maths
  // =====================================================================
  var ACT = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };
  function targets(p) {
    p = p || state.profile;
    if (!p) return null;
    var bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.gender === "male" ? 5 : -161);
    var tdee = bmr * (ACT[p.activity] || 1.375);
    var kcal = tdee;
    if (p.goal === "lose") kcal = tdee - 450;
    if (p.goal === "muscle") kcal = tdee + 250;
    var floor = p.gender === "male" ? 1500 : 1200;
    kcal = Math.max(floor, Math.round(kcal / 10) * 10);
    var proteinPerKg = p.goal === "lose" || p.goal === "muscle" ? 1.8 : 1.4;
    var protein = Math.round(p.weight * proteinPerKg);
    var fat = Math.round((kcal * 0.27) / 9);
    var carbs = Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal: kcal, protein: protein, carbs: carbs, fat: fat };
  }
  function bmi(p) { p = p || state.profile; if (!p) return null; var h = p.height / 100; return round(currentWeight() / (h * h), 1); }
  function currentWeight() {
    if (state.weights.length) return state.weights[state.weights.length - 1].kg;
    return state.profile ? state.profile.weight : 0;
  }
  function goalToDb(g) { return { lose: "lose-weight", muscle: "build-muscle", fit: "get-fit", endurance: "endurance" }[g] || "get-fit"; }

  // =====================================================================
  // Meal library (per-serving values; portions scale to the user's target)
  // =====================================================================
  var M = function (en, bm, items, kcal, p, c, f, tags) {
    return { name: { en: en, bm: bm }, items: items, kcal: kcal, p: p, c: c, f: f, tags: tags };
  };
  // tags: h = halal-friendly, v = vegetarian, vg = vegan
  var MEALS = {
    breakfast: [
      M("Nasi lemak, lighter", "Nasi lemak versi ringan", { en: "Brown rice, boiled egg, cucumber, ikan bilis, sambal (less oil)", bm: "Nasi perang, telur rebus, timun, ikan bilis, sambal kurang minyak" }, 480, 20, 62, 16, ["h"]),
      M("Roti canai with dhal", "Roti canai dengan dhal", { en: "1 roti canai, dhal, teh O kosong", bm: "1 roti canai, dhal, teh O kosong" }, 420, 13, 55, 16, ["h", "v"]),
      M("Overnight oats", "Oat semalaman", { en: "Oats, low-fat milk, banana, chia seeds", bm: "Oat, susu rendah lemak, pisang, biji chia" }, 380, 16, 60, 9, ["h", "v"]),
      M("Half-boiled eggs and toast", "Telur separuh masak dan roti", { en: "2 eggs, 2 slices wholemeal bread, kaya (thin)", bm: "2 biji telur, 2 keping roti mil penuh, kaya (nipis)" }, 400, 20, 44, 15, ["h", "v"]),
      M("Tofu scramble wrap", "Balutan tauhu hancur", { en: "Firm tofu, spinach, wholemeal wrap, chilli", bm: "Tauhu keras, bayam, roti balut mil penuh, cili" }, 390, 22, 40, 14, ["h", "v", "vg"]),
      M("Soy milk and peanut butter toast", "Susu soya dan roti kacang", { en: "Unsweetened soy milk, wholemeal toast, peanut butter, banana", bm: "Susu soya tanpa gula, roti mil penuh, mentega kacang, pisang" }, 430, 18, 52, 16, ["h", "v", "vg"])
    ],
    lunch: [
      M("Nasi campur, balanced plate", "Nasi campur seimbang", { en: "Half plate vegetables, grilled chicken, 1 cup rice", bm: "Separuh pinggan sayur, ayam bakar, 1 cawan nasi" }, 560, 38, 62, 15, ["h"]),
      M("Ikan bakar set", "Set ikan bakar", { en: "Grilled fish, ulam, air asam, 1 cup rice", bm: "Ikan bakar, ulam, air asam, 1 cawan nasi" }, 520, 40, 58, 12, ["h"]),
      M("Chicken rice, roasted", "Nasi ayam panggang", { en: "Skinless roasted chicken, plain rice, cucumber, soup", bm: "Ayam panggang tanpa kulit, nasi kosong, timun, sup" }, 580, 36, 70, 14, ["h"]),
      M("Mee hailam with tofu", "Mee hailam dengan tauhu", { en: "Wholemeal noodles, tofu, choy sum, egg", bm: "Mi mil penuh, tauhu, sawi, telur" }, 510, 26, 66, 15, ["h", "v"]),
      M("Chickpea and vegetable curry", "Kari kacang kuda dan sayur", { en: "Chickpeas, pumpkin, long beans, brown rice", bm: "Kacang kuda, labu, kacang panjang, nasi perang" }, 540, 20, 82, 13, ["h", "v", "vg"]),
      M("Tempeh rice bowl", "Mangkuk nasi tempe", { en: "Tempeh, kangkung, brown rice, sambal", bm: "Tempe, kangkung, nasi perang, sambal" }, 550, 28, 66, 18, ["h", "v", "vg"])
    ],
    dinner: [
      M("Sup ayam and vegetables", "Sup ayam dan sayur", { en: "Chicken soup, carrots, potato, 1/2 cup rice", bm: "Sup ayam, lobak merah, kentang, 1/2 cawan nasi" }, 450, 34, 48, 11, ["h"]),
      M("Steamed fish with ginger", "Ikan kukus halia", { en: "Steamed fish, stir-fried broccoli, 1/2 cup rice", bm: "Ikan kukus, brokoli goreng ringan, 1/2 cawan nasi" }, 430, 38, 40, 11, ["h"]),
      M("Grilled chicken salad", "Salad ayam bakar", { en: "Chicken breast, mixed greens, corn, olive oil dressing", bm: "Dada ayam, sayur campur, jagung, sos minyak zaitun" }, 420, 40, 26, 16, ["h"]),
      M("Dhal with chapati", "Dhal dengan capati", { en: "Lentil dhal, 2 chapati, cucumber raita", bm: "Dhal kacang, 2 capati, raita timun" }, 460, 20, 66, 12, ["h", "v"]),
      M("Tofu and vegetable stir-fry", "Tauhu dan sayur goreng", { en: "Firm tofu, mixed vegetables, garlic, 1/2 cup rice", bm: "Tauhu keras, sayur campur, bawang putih, 1/2 cawan nasi" }, 420, 24, 44, 15, ["h", "v", "vg"])
    ],
    snack: [
      M("Greek yoghurt and fruit", "Yogurt Greek dan buah", { en: "Plain Greek yoghurt, papaya", bm: "Yogurt Greek kosong, betik" }, 180, 15, 20, 4, ["h", "v"]),
      M("Kacang and apple", "Kacang dan epal", { en: "Handful of peanuts, 1 apple", bm: "Segenggam kacang tanah, 1 biji epal" }, 220, 8, 22, 12, ["h", "v", "vg"]),
      M("Boiled eggs", "Telur rebus", { en: "2 boiled eggs", bm: "2 biji telur rebus" }, 150, 13, 1, 10, ["h", "v"]),
      M("Edamame", "Edamame", { en: "1 cup steamed edamame", bm: "1 cawan edamame kukus" }, 190, 17, 14, 8, ["h", "v", "vg"])
    ]
  };
  var SLOTS = ["breakfast", "lunch", "dinner", "snack"];
  var SPLIT_SHARE = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 };
  function dietTag() {
    var d = state.profile ? state.profile.diet : "halal";
    return d === "vegan" ? "vg" : d === "vegetarian" ? "v" : d === "halal" ? "h" : null;
  }
  function mealOptions(slot) {
    var tag = dietTag();
    var list = MEALS[slot].filter(function (m) { return !tag || m.tags.indexOf(tag) >= 0; });
    return list.length ? list : MEALS[slot];
  }
  function dayMeals(k) {
    k = k || dateKey();
    if (!state.meals[k]) {
      var seed = parseKey(k).getDate();
      var picks = {};
      SLOTS.forEach(function (s, i) { picks[s] = (seed + i) % mealOptions(s).length; });
      state.meals[k] = { picks: picks, eaten: {} };
    }
    return state.meals[k];
  }
  function mealFor(slot, k) {
    var opts = mealOptions(slot);
    var m = opts[dayMeals(k).picks[slot] % opts.length];
    var tg = targets();
    var scale = tg ? clamp(round((tg.kcal * SPLIT_SHARE[slot]) / m.kcal, 1), 0.6, 1.8) : 1;
    return { meal: m, scale: scale, kcal: Math.round(m.kcal * scale), p: Math.round(m.p * scale), c: Math.round(m.c * scale), f: Math.round(m.f * scale) };
  }
  function eatenTotals(k) {
    var dm = dayMeals(k), tot = { kcal: 0, p: 0, c: 0, f: 0 };
    SLOTS.forEach(function (s) {
      if (dm.eaten[s]) { var m = mealFor(s, k); tot.kcal += m.kcal; tot.p += m.p; tot.c += m.c; tot.f += m.f; }
    });
    return tot;
  }

  // =====================================================================
  // Training plan
  // =====================================================================
  function planDayFor(k) {
    var plan = state.plan;
    if (!plan || !plan.days) return null;
    var idx = daysBetween(plan.start, k || dateKey());
    if (idx < 0 || idx >= plan.days.length) return null;
    return { index: idx, day: plan.days[idx] };
  }
  function planFinished() {
    return state.plan && daysBetween(state.plan.start, dateKey()) >= state.plan.days.length;
  }
  function buildPlan(opts) {
    var tier = session.premium ? "premium" : "free";
    var days = WorkoutDB.generatePlan({
      duration: opts.duration, equipment: opts.equipment, split: opts.split,
      fitnessLevel: state.profile.level, goal: goalToDb(state.profile.goal), tier: tier
    });
    state.plan = { start: dateKey(), split: opts.split, duration: opts.duration, equipment: opts.equipment, tier: tier, days: days };
    save();
  }
  function sessionLog(k) { return state.sessions[k] || null; }
  function workoutDates() {
    return Object.keys(state.sessions).filter(function (k) { return state.sessions[k].completed; }).sort();
  }
  function streak() {
    // Consecutive days up to today where the user trained or the plan scheduled rest.
    var n = 0, k = dateKey();
    var todayLog = sessionLog(k);
    if (!(todayLog && todayLog.completed)) k = addDays(k, -1);
    for (var i = 0; i < 400; i++) {
      var log = sessionLog(k), pd = planDayFor(k);
      if (log && log.completed) n++;
      else if (pd && pd.day.isRest && n > 0) { /* rest days keep the streak alive */ }
      else break;
      k = addDays(k, -1);
    }
    return n;
  }

  // =====================================================================
  // Platform + billing bridge
  // =====================================================================
  var Cap = window.Capacitor;
  var platform = Cap && Cap.getPlatform ? Cap.getPlatform() : "web";
  var isNative = platform === "android" || platform === "ios";
  function rcPlugin() { return Cap && Cap.Plugins && Cap.Plugins.Purchases; }
  function hasAndroidBridge() { return typeof window.RevenueCat !== "undefined"; }

  var rcConfigured = false;
  function rcConfigure() {
    var P = rcPlugin();
    if (!P || rcConfigured || platform !== "ios" || !CONFIG.revenueCatIosKey) return Promise.resolve(!!rcConfigured);
    return P.configure({ apiKey: CONFIG.revenueCatIosKey }).then(function () { rcConfigured = true; return true; })
      .catch(function (e) { console.warn("RC configure", e); return false; });
  }
  function billingLogin(uid) {
    if (hasAndroidBridge()) { try { window.RevenueCat.loginUser(uid); } catch (e) {} return; }
    rcConfigure().then(function (ok) { if (ok) rcPlugin().logIn({ appUserID: uid }).then(readRcEntitlement).catch(function () {}); });
  }
  function billingLogout() {
    if (hasAndroidBridge()) { try { window.RevenueCat.logoutUser(); } catch (e) {} return; }
    if (rcConfigured) rcPlugin().logOut().catch(function () {});
  }
  function readRcEntitlement(res) {
    var info = res && (res.customerInfo || res);
    var active = info && info.entitlements && info.entitlements.active;
    if (active && Object.keys(active).length) setPremiumLocal(true);
  }
  // Android native bridge callbacks (RevenueCatBridge.kt). The server webhook is the source of truth;
  // these only make the UI react instantly after a purchase.
  window.onRevenueCatPremiumStatus = function (isP) { if (isP) setPremiumLocal(true); };
  window.onRevenueCatPurchaseComplete = function (ok, msg) {
    loading(false);
    if (ok) { setPremiumLocal(true); closeSheet(); toast(t("paySuccess")); }
    else if (msg) toast(msg, 4000);
  };
  window.onRevenueCatSubscriptionStatus = function (s) { if (s && s.isPremium) setPremiumLocal(true); };
  window.onRevenueCatLogin = function (ok) { if (ok && hasAndroidBridge()) window.RevenueCat.checkPremiumStatus(); };
  window.onRevenueCatRestore = function (ok, msg) { loading(false); toast(ok ? t("saved") : (msg || t("errorGeneric"))); };

  function setPremiumLocal(v) {
    if (session.premium === v) return;
    session.premium = v;
    render();
  }

  function startPurchase() {
    if (!session.user) { closeSheet(); showAuth("signup"); return; }
    if (platform === "android") {
      if (hasAndroidBridge()) { loading(true); window.RevenueCat.showPaywall(); setTimeout(function () { loading(false); }, 1500); }
      else toast(t("storeNotReady"));
      return;
    }
    if (platform === "ios") {
      rcConfigure().then(function (ok) {
        if (!ok) { toast(t("iosSoon"), 4000); return; }
        var P = rcPlugin();
        loading(true);
        P.getOfferings().then(function (o) {
          var pkg = o && o.current && o.current.availablePackages && o.current.availablePackages[0];
          if (!pkg) throw new Error("no package");
          return P.purchasePackage({ aPackage: pkg });
        }).then(function (r) { loading(false); readRcEntitlement(r); toast(t("paySuccess")); closeSheet(); })
          .catch(function (e) { loading(false); if (!(e && e.userCancelled)) toast(t("storeNotReady")); });
      });
      return;
    }
    // Web: Stripe Checkout (never used inside the native apps)
    callFn(CONFIG.fn.checkout, {}).then(function (d) {
      if (d && d.url) window.location.href = d.url; else toast(t("errorGeneric"));
    }).catch(function () { toast(t("errorGeneric")); });
  }
  function restorePurchases() {
    if (hasAndroidBridge()) { loading(true); window.RevenueCat.restorePurchases(); return; }
    rcConfigure().then(function (ok) {
      if (!ok) { toast(t("storeNotReady")); return; }
      loading(true);
      rcPlugin().restorePurchases().then(function (r) { loading(false); readRcEntitlement(r); toast(t("saved")); })
        .catch(function () { loading(false); toast(t("errorGeneric")); });
    });
  }
  function manageSubscription() {
    if (hasAndroidBridge()) { window.RevenueCat.showCustomerCenter(); return; }
    if (platform === "android") { window.open("https://play.google.com/store/account/subscriptions?package=com.personal.fitaicoach.app", "_blank"); return; }
    if (platform === "ios") { window.open("https://apps.apple.com/account/subscriptions", "_blank"); return; }
    callFn(CONFIG.fn.portal, {}).then(function (d) { if (d && d.url) window.location.href = d.url; })
      .catch(function (e) { toast(e.message || t("errorGeneric")); });
  }

  // =====================================================================
  // Firebase
  // =====================================================================
  function initFirebase() {
    try {
      if (typeof firebase === "undefined" || typeof firebaseConfig === "undefined") return false;
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      fb.auth = firebase.auth();
      // Android WebView: sessionStorage can be unavailable; keep the session in local storage.
      fb.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function () {});
      fb.db = firebase.firestore();
      try { fb.db.enablePersistence({ synchronizeTabs: true }).catch(function () {}); } catch (e) {}
      return true;
    } catch (e) { console.warn("firebase init", e); return false; }
  }
  function callFn(url, body) {
    if (!session.user) return Promise.reject(new Error(t("coachNeedsAccount")));
    return session.user.getIdToken().then(function (tok) {
      return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: JSON.stringify(body || {}) });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) { var err = new Error(d.error || ("HTTP " + r.status)); err.status = r.status; err.data = d; throw err; }
        return d;
      });
    });
  }
  function authError(e) {
    var c = (e && e.code) || "";
    if (/wrong-password|user-not-found|invalid-credential|invalid-login/.test(c)) return t("authErr_invalid");
    if (/email-already-in-use/.test(c)) return t("authErr_inuse");
    if (/weak-password/.test(c)) return t("authErr_weak");
    if (/invalid-email/.test(c)) return t("authErr_email");
    if (/network/.test(c)) return t("authErr_net");
    return t("errorGeneric");
  }
  function watchPremium(uid) {
    if (session.unsubUser) session.unsubUser();
    session.unsubUser = fb.db.collection("users").doc(uid).onSnapshot(function (snap) {
      var d = snap.exists ? snap.data() : {};
      session.subStatus = d.subscriptionStatus || "none";
      var p = !!d.isPremium;
      if (p !== session.premium) { session.premium = p; render(); }
    }, function (e) { console.warn("premium watch", e); });
  }

  // =====================================================================
  // Rendering root
  // =====================================================================
  function render() {
    applyTheme();
    if (!session.user && !session.guest) return renderGate();
    if (!state.profile || !state.consent) return renderOnboarding();
    renderShell();
  }

  // ---------- Gate: welcome / sign in / sign up ----------
  var gateMode = "welcome";
  function showAuth(mode) { gateMode = mode; if (session.guest) { session.guest = false; } renderGate(); }
  function renderGate() {
    var welcome = gateMode === "welcome";
    var signup = gateMode === "signup";
    root.innerHTML =
      '<div class="gate"><div class="gate-inner">' +
        '<div class="gate-hero">' +
          '<div class="brand"><span class="brand-mark">' + icon("bolt") + '</span>FitAI Coach</div>' +
          '<h1 class="t-display">' + esc(welcome ? t("tagline") : signup ? t("signUp") : t("signIn")) + '</h1>' +
          (welcome ? '<p>' + esc(t("gateIntro")) + '</p>' : '') +
        '</div>' +
        (welcome ?
          '<div class="stack">' +
            '<button class="btn btn-primary btn-block" data-go="signup">' + esc(t("signUp")) + '</button>' +
            '<button class="btn btn-ghost btn-block" data-go="signin">' + esc(t("signIn")) + '</button>' +
            '<button class="link-btn" data-guest style="width:100%">' + esc(t("guest")) + '</button>' +
            '<p class="t-micro" style="text-align:center">' + esc(t("guestNote")) + '</p>' +
          '</div>'
        :
          '<form id="authForm" novalidate>' +
            (signup ? '<label class="field"><span>' + esc(t("name")) + '</span><input class="input" name="name" autocomplete="name" required></label>' : '') +
            '<label class="field"><span>' + esc(t("email")) + '</span><input class="input" type="email" name="email" autocomplete="email" inputmode="email" required></label>' +
            '<label class="field"><span>' + esc(t("password")) + '</span><input class="input" type="password" name="password" minlength="8" autocomplete="' + (signup ? "new-password" : "current-password") + '" required>' +
              (signup ? '<small class="t-micro">' + esc(t("pwHint")) + '</small>' : '') + '</label>' +
            '<div class="error-text" id="authErr" role="alert"></div>' +
            '<button class="btn btn-primary btn-block" type="submit" style="margin-top:8px">' + esc(signup ? t("signUp") : t("signIn")) + '</button>' +
            (!signup ? '<button class="link-btn" type="button" data-forgot style="margin-top:8px">' + esc(t("forgot")) + '</button>' : '') +
          '</form>' +
          '<div class="divider"></div>' +
          '<p class="t-small muted">' + esc(signup ? t("haveAccount") : t("noAccount")) + ' <button class="link-btn" data-go="' + (signup ? "signin" : "signup") + '">' + esc(signup ? t("signIn") : t("signUp")) + '</button></p>' +
          '<button class="link-btn" data-go="welcome">' + esc(t("back")) + '</button>'
        ) +
        '<div class="row" style="margin-top:28px;justify-content:center">' + langSeg() + '</div>' +
      '</div></div>';

    root.onclick = function (e) {
      var go = e.target.closest("[data-go]"); if (go) { gateMode = go.getAttribute("data-go"); return renderGate(); }
      if (e.target.closest("[data-guest]")) { session.guest = true; loadLocal(); return render(); }
      var lang = e.target.closest("[data-lang]"); if (lang) { state.settings.lang = lang.getAttribute("data-lang"); save(); return renderGate(); }
      if (e.target.closest("[data-forgot]")) {
        var em = $("#authForm [name=email]").value.trim();
        if (!em) { $("#authErr").textContent = t("authErr_email"); return; }
        fb.auth.sendPasswordResetEmail(em).then(function () { toast(t("resetSent"), 3500); })
          .catch(function (er) { $("#authErr").textContent = authError(er); });
      }
    };
    var form = $("#authForm");
    if (form) form.onsubmit = function (e) {
      e.preventDefault();
      var f = new FormData(form), em = String(f.get("email") || "").trim(), pw = String(f.get("password") || "");
      var nm = String(f.get("name") || "").trim();
      var errEl = $("#authErr"); errEl.textContent = "";
      if (!fb.auth) { errEl.textContent = t("authErr_net"); return; }
      if (signup && pw.length < 8) { errEl.textContent = t("authErr_weak"); return; }
      loading(true);
      var p = signup ? fb.auth.createUserWithEmailAndPassword(em, pw).then(function (cred) {
        // Carry guest data into the new account
        var guestRaw = localStorage.getItem("fitai.v2.guest");
        if (guestRaw) { localStorage.setItem("fitai.v2." + cred.user.uid, guestRaw); localStorage.removeItem("fitai.v2.guest"); }
        pendingName = nm;
        return cred.user.updateProfile({ displayName: nm }).catch(function () {});
      }) : fb.auth.signInWithEmailAndPassword(em, pw);
      p.then(function () { loading(false); }).catch(function (er) { loading(false); errEl.textContent = authError(er); });
    };
  }
  var pendingName = "";
  function langSeg() {
    return '<div class="seg" role="group" aria-label="Language" style="width:200px">' +
      '<button type="button" data-lang="en" aria-pressed="' + (state.settings.lang === "en") + '">English</button>' +
      '<button type="button" data-lang="bm" aria-pressed="' + (state.settings.lang === "bm") + '">Melayu</button></div>';
  }

  // ---------- Onboarding (also used for "Edit profile") ----------
  var draft = null, obStep = 1;
  function choiceList(name, options, value) {
    return '<div class="choice-list" role="radiogroup">' + options.map(function (o) {
      return '<button type="button" class="choice" role="radio" data-pick="' + name + '" data-val="' + o.v + '" aria-pressed="' + (value === o.v) + '" aria-checked="' + (value === o.v) + '">' +
        '<div><strong>' + esc(o.l) + '</strong>' + (o.d ? '<small>' + esc(o.d) + '</small>' : '') + '</div></button>';
    }).join("") + '</div>';
  }
  function segPick(name, options, value) {
    return '<div class="seg" role="radiogroup">' + options.map(function (o) {
      return '<button type="button" role="radio" data-pick="' + name + '" data-val="' + o.v + '" aria-pressed="' + (value === o.v) + '" aria-checked="' + (value === o.v) + '">' + esc(o.l) + '</button>';
    }).join("") + '</div>';
  }
  function profileStepHtml(step) {
    var d = draft;
    if (step === 1) return '<h2 class="t-title">' + esc(t("aboutYou")) + '</h2><div style="margin-top:18px">' +
      '<label class="field"><span>' + esc(t("name")) + '</span><input class="input" data-f="name" value="' + esc(d.name || "") + '" autocomplete="given-name"></label>' +
      '<div class="field"><span>' + esc(t("gender")) + '</span>' + segPick("gender", [{ v: "male", l: t("male") }, { v: "female", l: t("female") }], d.gender) + '</div>' +
      '<div class="grid-3 field">' +
        '<label><span class="t-small" style="font-weight:600">' + esc(t("age")) + '</span><input class="input num" data-f="age" type="number" inputmode="numeric" min="' + CONFIG.minAge + '" max="90" value="' + esc(d.age || "") + '"></label>' +
        '<label><span class="t-small" style="font-weight:600">' + esc(t("height")) + '</span><input class="input num" data-f="height" type="number" inputmode="numeric" min="120" max="230" value="' + esc(d.height || "") + '"></label>' +
        '<label><span class="t-small" style="font-weight:600">' + esc(t("weight")) + '</span><input class="input num" data-f="weight" type="number" inputmode="decimal" step="0.1" min="30" max="250" value="' + esc(d.weight || "") + '"></label>' +
      '</div>' +
      '<label class="field"><span>' + esc(t("targetWeight")) + '</span><input class="input num" data-f="targetWeight" type="number" inputmode="decimal" step="0.1" min="30" max="250" value="' + esc(d.targetWeight || "") + '"></label>' +
      '</div>';
    if (step === 2) return '<h2 class="t-title">' + esc(t("howActive")) + '</h2><div style="margin-top:18px">' +
      choiceList("activity", ["sedentary", "light", "moderate", "very"].map(function (a) { return { v: a, l: t("act_" + a), d: t("act_" + a + "_d") }; }), d.activity) +
      '<div class="field" style="margin-top:22px"><span>' + esc(t("level")) + '</span>' +
      segPick("level", ["beginner", "intermediate", "advanced"].map(function (l) { return { v: l, l: t("lvl_" + l) }; }), d.level) + '</div></div>';
    return '<h2 class="t-title">' + esc(t("goalDiet")) + '</h2><div style="margin-top:18px">' +
      '<div class="field"><span>' + esc(t("goal")) + '</span>' +
      choiceList("goal", ["lose", "muscle", "fit", "endurance"].map(function (g) { return { v: g, l: t("goal_" + g) }; }), d.goal) + '</div>' +
      '<div class="field"><span>' + esc(t("diet")) + '</span>' +
      segPick("diet", ["halal", "vegetarian", "vegan", "any"].map(function (g) { return { v: g, l: t("diet_" + g) }; }), d.diet) + '</div>' +
      (state.consent ? '' : '<label class="check" style="margin-top:20px"><input type="checkbox" id="consent"' + (d._consent ? " checked" : "") + '><span>' + esc(t("consent")) + '</span></label>') +
      '</div>';
  }
  function readDraftInputs(scope) {
    $$("[data-f]", scope).forEach(function (i) { draft[i.getAttribute("data-f")] = i.value; });
    var c = $("#consent", scope); if (c) draft._consent = c.checked;
  }
  function validStep(step) {
    var d = draft;
    if (step === 1) {
      if (!String(d.name || "").trim() || !d.gender || !d.age || !d.height || !d.weight) return t("fillAll");
      if (+d.age < CONFIG.minAge) return t("ageError", { n: CONFIG.minAge });
      if (+d.height < 120 || +d.height > 230 || +d.weight < 30 || +d.weight > 250) return t("fillAll");
    }
    if (step === 2 && (!d.activity || !d.level)) return t("fillAll");
    if (step === 3) {
      if (!d.goal || !d.diet) return t("fillAll");
      if (!state.consent && !d._consent) return t("consent");
    }
    return "";
  }
  function commitDraft() {
    var d = draft;
    var prevWeight = state.profile ? state.profile.weight : null;
    state.profile = {
      name: String(d.name).trim().slice(0, 40), gender: d.gender, age: +d.age, height: +d.height, weight: +d.weight,
      targetWeight: d.targetWeight ? +d.targetWeight : null, activity: d.activity, level: d.level, goal: d.goal, diet: d.diet
    };
    if (!state.consent) state.consent = { health: true, at: new Date().toISOString() };
    if (prevWeight == null || prevWeight !== state.profile.weight) logWeight(state.profile.weight, true);
    state.meals = {}; // re-pick meals for the new diet/targets
    save();
  }
  function renderOnboarding() {
    if (!draft) draft = Object.assign({ name: pendingName || (session.user && session.user.displayName) || "", level: "beginner", diet: "halal", activity: "light", goal: "fit" }, state.profile || {});
    root.innerHTML = '<div class="gate"><div class="gate-inner" id="ob">' +
      '<div class="progress-dots" aria-label="' + esc(t("step")) + ' ' + obStep + '/3">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= obStep ? "on" : "") + '"></i>'; }).join("") + '</div>' +
      profileStepHtml(obStep) +
      '<div class="error-text" id="obErr" role="alert"></div>' +
      '<div class="row" style="margin-top:18px">' +
        (obStep > 1 ? '<button class="btn btn-ghost" data-back>' + esc(t("back")) + '</button>' : '') +
        '<button class="btn btn-primary" style="flex:1" data-next>' + esc(obStep < 3 ? t("next") : t("finish")) + '</button>' +
      '</div></div></div>';
    bindProfileForm(root, function () {
      if (obStep < 3) { obStep++; renderOnboarding(); window.scrollTo(0, 0); return; }
      commitDraft(); draft = null; obStep = 1; session.tab = "train"; render(); openPlanSetup();
    }, function () { obStep--; renderOnboarding(); });
  }
  function bindProfileForm(scope, onNext, onBack) {
    scope.onclick = function (e) {
      var pick = e.target.closest("[data-pick]");
      if (pick) {
        readDraftInputs(scope);
        draft[pick.getAttribute("data-pick")] = pick.getAttribute("data-val");
        $$('[data-pick="' + pick.getAttribute("data-pick") + '"]', scope).forEach(function (b) {
          var on = b === pick; b.setAttribute("aria-pressed", on); b.setAttribute("aria-checked", on);
        });
        return;
      }
      if (e.target.closest("[data-back]")) { readDraftInputs(scope); onBack(); return; }
      if (e.target.closest("[data-next]")) {
        readDraftInputs(scope);
        var step = +(scope.getAttribute("data-step") || obStep);
        var err = validStep(step);
        if (err) { $("#obErr", scope).textContent = err; return; }
        onNext();
      }
    };
  }
  function openEditProfile() {
    draft = Object.assign({}, state.profile);
    var step = 1;
    function paint() {
      var s = sheet('<div id="pf" data-step="' + step + '">' + profileStepHtml(step) +
        '<div class="error-text" id="obErr" role="alert"></div><div class="row" style="margin-top:14px">' +
        (step > 1 ? '<button class="btn btn-ghost" data-back>' + esc(t("back")) + '</button>' : '') +
        '<button class="btn btn-primary" style="flex:1" data-next>' + esc(step < 3 ? t("next") : t("save")) + '</button></div></div>', { title: t("editProfile") });
      bindProfileForm($("#pf", s), function () {
        if (step < 3) { step++; paint(); return; }
        commitDraft(); draft = null; closeSheet(); toast(t("saved")); render();
      }, function () { step--; paint(); });
    }
    paint();
  }

  // =====================================================================
  // Shell
  // =====================================================================
  var TABS = [
    { id: "home", icon: "home", label: "tabHome" },
    { id: "train", icon: "dumbbell", label: "tabTrain" },
    { id: "eat", icon: "bowl", label: "tabEat" },
    { id: "coach", icon: "chat", label: "tabCoach" },
    { id: "progress", icon: "chart", label: "tabProgress" }
  ];
  function renderShell() {
    var initial = (state.profile.name || "?").trim().charAt(0).toUpperCase();
    root.innerHTML =
      '<div class="app">' +
        '<nav class="tabbar" aria-label="Main">' + TABS.map(function (tb) {
          return '<button class="tab" data-tab="' + tb.id + '"' + (session.tab === tb.id ? ' aria-current="page"' : '') + '>' + icon(tb.icon) + '<span>' + esc(t(tb.label)) + '</span></button>';
        }).join("") + '</nav>' +
        '<div class="app-body">' +
          '<header class="topbar"><div class="brand"><span class="brand-mark">' + icon("bolt") + '</span>FitAI Coach</div>' +
            '<div class="row">' + (session.premium ? '<span class="pro-chip">' + esc(t("premium")) + '</span>' : '<button class="pro-chip" data-paywall>' + esc(t("upgradeShort")) + '</button>') +
            '<button class="avatar-btn" data-settings aria-label="' + esc(t("settings")) + '">' + esc(initial) + '</button></div></header>' +
          '<main class="view" id="view"></main>' +
        '</div>' +
      '</div>';
    root.onclick = shellClick;
    renderTab();
  }
  function shellClick(e) {
    var tab = e.target.closest("[data-tab]");
    if (tab) { session.tab = tab.getAttribute("data-tab"); renderShell(); window.scrollTo(0, 0); return; }
    if (e.target.closest("[data-settings]")) return openSettings();
    if (e.target.closest("[data-paywall]")) return openPaywall();
    var act = e.target.closest("[data-act]");
    if (act && ACTIONS[act.getAttribute("data-act")]) ACTIONS[act.getAttribute("data-act")](act, e);
  }
  function renderTab() {
    var v = $("#view"); if (!v) return;
    ({ home: viewHome, train: viewTrain, eat: viewEat, coach: viewCoach, progress: viewProgress }[session.tab] || viewHome)(v);
  }
  var ACTIONS = {};

  // ---------- Home ----------
  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? t("morning") : h < 18 ? t("afternoon") : t("evening");
  }
  function ringSvg(calPct, movePct) {
    var R1 = 72, R2 = 54, C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2;
    return '<svg viewBox="0 0 168 168" aria-hidden="true">' +
      '<circle class="track" cx="84" cy="84" r="' + R1 + '" stroke-width="14" fill="none"/>' +
      '<circle class="arc arc-cal" cx="84" cy="84" r="' + R1 + '" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="' + C1 + '" stroke-dashoffset="' + C1 + '" data-to="' + (C1 * (1 - clamp(calPct, 0, 1))) + '"/>' +
      '<circle class="track" cx="84" cy="84" r="' + R2 + '" stroke-width="12" fill="none"/>' +
      '<circle class="arc arc-move" cx="84" cy="84" r="' + R2 + '" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="' + C2 + '" stroke-dashoffset="' + C2 + '" data-to="' + (C2 * (1 - clamp(movePct, 0, 1))) + '"/>' +
      '</svg>';
  }
  function sessionProgress(k) {
    var pd = planDayFor(k);
    if (!pd) return { pct: 0, label: t("noPlan") };
    if (pd.day.isRest && !pd.day.exercises.length) return { pct: 1, label: t("restDay"), rest: true };
    var log = sessionLog(k);
    if (log && log.completed) return { pct: 1, label: t("sessionDone") };
    var done = log ? log.done.length : 0;
    return { pct: pd.day.exercises.length ? done / pd.day.exercises.length : 0, label: done ? done + "/" + pd.day.exercises.length : t("sessionTodo") };
  }
  function viewHome(v) {
    var k = dateKey(), tg = targets(), eaten = eatenTotals(k), sp = sessionProgress(k), pd = planDayFor(k);
    var wDates = workoutDates();
    var startW = state.weights.length ? state.weights[0].kg : state.profile.weight;
    var change = round(currentWeight() - startW, 1);
    var sessionCard;
    if (!state.plan || planFinished()) {
      sessionCard = '<div class="card empty"><div class="icon-wrap">' + icon("dumbbell") + '</div><h3 class="t-head">' +
        esc(state.plan ? t("planEnded") : t("noPlan")) + '</h3><p>' + esc(state.plan ? t("planEndedBody") : t("noPlanBody")) + '</p>' +
        '<button class="btn btn-primary" data-act="planSetup">' + esc(t("createPlan")) + '</button></div>';
    } else {
      var d = pd.day;
      sessionCard = '<div class="card next-session"><div>' +
        '<div class="row" style="gap:8px;margin-bottom:8px"><span class="tag ' + (d.isRest ? "plain" : "") + '">' + esc(t("planDay", { n: d.day })) + '</span>' +
        (sp.pct >= 1 && !sp.rest ? '<span class="tag sun">' + icon("check") + esc(t("sessionDone")) + '</span>' : '') + '</div>' +
        '<h3 class="t-head">' + esc(d.isRest && !d.exercises.length ? t("restDay") : focusLabel(d)) + '</h3>' +
        '<p class="t-small muted" style="margin:4px 0 0">' + (d.exercises.length ? esc(t("exercises", { n: d.exercises.length })) + ', ~' + estMinutes(d) + ' min' : esc(t("restDay"))) + '</p></div>' +
        (d.exercises.length ? '<button class="btn ' + (sp.pct >= 1 ? "btn-ghost" : "btn-primary") + '" data-act="openToday">' + esc(sp.pct > 0 ? t("openSession") : t("startSession")) + '</button>' : '') +
        '</div>';
    }
    v.innerHTML =
      '<section class="section" style="margin-top:8px"><p class="muted" style="margin:0">' + esc(fmtDate(k, { weekday: "long", day: "numeric", month: "long" })) + '</p>' +
        '<h1 class="t-display" style="margin-top:4px">' + esc(greeting()) + ', ' + esc(state.profile.name.split(" ")[0]) + '</h1></section>' +
      '<section class="section card"><div class="today">' +
        '<div class="ring">' + ringSvg(eaten.kcal / tg.kcal, sp.pct) +
          '<div class="ring-center"><b class="num">' + Math.max(0, tg.kcal - eaten.kcal) + '</b><span>kcal ' + (state.settings.lang === "bm" ? "lagi" : "left") + '</span></div></div>' +
        '<div class="legend">' +
          '<div class="legend-item"><i style="background:var(--pandan)"></i><div><b class="num">' + eaten.kcal + '</b><small>' + esc(t("caloriesRing")) + ', ' + esc(t("ofTarget", { n: tg.kcal })) + '</small></div></div>' +
          '<div class="legend-item"><i style="background:var(--sunrise)"></i><div><b>' + esc(sp.label) + '</b><small>' + esc(t("workoutRing")) + '</small></div></div>' +
        '</div></div></section>' +
      '<section class="section"><div class="section-head"><h2 class="t-head">' + esc(t("todaySession")) + '</h2></div>' + sessionCard + '</section>' +
      '<section class="section grid-3">' +
        '<div class="stat sun"><b class="num">' + streak() + '</b><small>' + esc(t("streak")) + '</small></div>' +
        '<div class="stat"><b class="num">' + wDates.length + '</b><small>' + esc(t("workouts")) + '</small></div>' +
        '<div class="stat"><b class="num">' + (change > 0 ? "+" : "") + change + '</b><small>' + esc(t("weightChange")) + '</small></div>' +
      '</section>' +
      '<section class="section"><button class="btn btn-soft btn-block" data-act="logWeight">' + icon("scale") + esc(t("logWeight")) + '</button></section>';
    requestAnimationFrame(function () {
      $$(".arc", v).forEach(function (a) { a.style.strokeDashoffset = a.getAttribute("data-to"); });
    });
  }
  function focusLabel(d) {
    var map = {
      "Full Body": { en: "Full body", bm: "Seluruh badan" }, "Active Recovery": { en: "Active recovery", bm: "Pemulihan aktif" },
      Upper: { en: "Upper body", bm: "Badan atas" }, Lower: { en: "Lower body", bm: "Badan bawah" },
      Push: { en: "Push", bm: "Tolak" }, Pull: { en: "Pull", bm: "Tarik" }, Legs: { en: "Legs", bm: "Kaki" },
      Chest: { en: "Chest", bm: "Dada" }, Back: { en: "Back", bm: "Belakang" }, Shoulders: { en: "Shoulders", bm: "Bahu" }, Arms: { en: "Arms", bm: "Lengan" }
    };
    return map[d.focus] ? L(map[d.focus]) : d.focus;
  }
  function estMinutes(d) {
    var secs = 0;
    d.exercises.forEach(function (x) { var r = parseInt(x.rest, 10) || 60; secs += x.sets * (40 + r); });
    return Math.max(10, Math.round(secs / 60 / 5) * 5);
  }
  function logWeight(kg, silent) {
    var k = dateKey();
    state.weights = state.weights.filter(function (w) { return w.d !== k; });
    state.weights.push({ d: k, kg: round(kg, 1) });
    state.weights.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    if (!silent) save();
  }
  ACTIONS.logWeight = function () {
    var s = sheet('<label class="field"><span>' + esc(t("weight")) + '</span><input class="input num" id="wIn" type="number" inputmode="decimal" step="0.1" min="30" max="250" value="' + currentWeight() + '"></label>' +
      '<button class="btn btn-primary btn-block" id="wSave" style="margin-top:16px">' + esc(t("save")) + '</button>', { title: t("logWeight"), focus: true });
    $("#wSave", s).onclick = function () {
      var kg = parseFloat($("#wIn", s).value);
      if (!(kg >= 30 && kg <= 250)) { $("#wIn", s).focus(); return; }
      logWeight(kg); state.profile.weight = round(kg, 1); save(); closeSheet(); toast(t("saved")); renderTab();
    };
  };
  ACTIONS.planSetup = function () { openPlanSetup(); };
  ACTIONS.openToday = function () { session.tab = "train"; session.trainDay = null; renderShell(); };

  // ---------- Train ----------
  function openPlanSetup() {
    var opts = { split: (state.plan && state.plan.split) || "full-body", duration: session.premium ? 28 : 7, equipment: (state.plan && state.plan.equipment) || "none" };
    var splits = ["full-body", "upper-lower", "push-pull-legs", "bro-split"];
    var durations = [7, 14, 28, 56, 90];
    function paint() {
      var s = sheet(
        '<div class="field"><span>' + esc(t("equipment")) + '</span>' +
          choiceList("equipment", ["none", "basic", "gym"].map(function (e) { return { v: e, l: t("eq_" + e) }; }), opts.equipment) + '</div>' +
        '<div class="field"><span>' + esc(t("split")) + '</span><div class="choice-list">' + splits.map(function (sp) {
          var locked = !session.premium && sp !== "full-body";
          return '<button type="button" class="choice" data-pick="split" data-val="' + sp + '" aria-pressed="' + (opts.split === sp) + '"><div style="flex:1"><strong>' +
            esc(L(WorkoutDB.splits[sp].name)) + '</strong>' + (WorkoutDB.splits[sp].daysPerWeek ? '<small>' + WorkoutDB.splits[sp].daysPerWeek + (state.settings.lang === "bm" ? " hari seminggu" : " days a week") + '</small>' : '') + '</div>' +
            (locked ? '<span class="tag sun">' + esc(t("premiumOnly")) + '</span>' : '') + '</button>';
        }).join("") + '</div></div>' +
        '<div class="field"><span>' + esc(t("duration")) + '</span><div class="seg">' + durations.map(function (dn) {
          return '<button type="button" data-pick="duration" data-val="' + dn + '" aria-pressed="' + (opts.duration === dn) + '">' + dn + (state.settings.lang === "bm" ? "h" : "d") + '</button>';
        }).join("") + '</div>' + (!session.premium ? '<small class="t-micro">' + esc(t("premiumLength")) + '</small>' : '') + '</div>' +
        '<button class="btn btn-primary btn-block" data-gen style="margin-top:20px">' + esc(t("generate")) + '</button>',
        { title: t("planSetup") });
      s.querySelector(".sheet").onclick = function (e) {
        var p = e.target.closest("[data-pick]");
        if (p) {
          var key = p.getAttribute("data-pick"), val = p.getAttribute("data-val");
          if (key === "split" && !session.premium && val !== "full-body") { toast(t("premiumSplit")); return openPaywall(); }
          if (key === "duration" && !session.premium && +val > CONFIG.freeMaxPlanDays) { toast(t("premiumLength")); return openPaywall(); }
          opts[key] = key === "duration" ? +val : val; paint(); return;
        }
        if (e.target.closest("[data-gen]")) {
          buildPlan(opts); closeSheet(); session.tab = "train"; session.trainDay = null; renderShell(); toast(t("saved"));
        }
      };
    }
    paint();
  }
  function viewTrain(v) {
    if (!state.plan) {
      v.innerHTML = '<section class="section"><h1 class="t-display">' + esc(t("tabTrain")) + '</h1></section>' +
        '<div class="card empty"><div class="icon-wrap">' + icon("dumbbell") + '</div><h3 class="t-head">' + esc(t("noPlan")) + '</h3><p>' + esc(t("noPlanBody")) + '</p>' +
        '<button class="btn btn-primary" data-act="planSetup">' + esc(t("createPlan")) + '</button></div>';
      return;
    }
    var today = dateKey();
    var todayIdx = clamp(daysBetween(state.plan.start, today), 0, state.plan.days.length - 1);
    var sel = session.trainDay == null ? todayIdx : session.trainDay;
    var day = state.plan.days[sel];
    var k = addDays(state.plan.start, sel);
    var log = sessionLog(k) || { done: [] };
    var isFuture = k > today;
    // strip around the selected day
    var from = Math.max(0, sel - 3), to = Math.min(state.plan.days.length, from + 14);
    var strip = '';
    for (var i = from; i < to; i++) {
      var dk = addDays(state.plan.start, i), dd = state.plan.days[i], lg = sessionLog(dk);
      strip += '<button class="day-pill' + (lg && lg.completed ? " is-done" : "") + (dd.isRest ? " is-rest" : "") + '" data-act="pickDay" data-i="' + i + '" aria-pressed="' + (i === sel) + '">' +
        '<small>' + esc(parseKey(dk).toLocaleDateString(state.settings.lang === "bm" ? "ms-MY" : "en-MY", { weekday: "short" })) + '</small><b class="num">' + parseKey(dk).getDate() + '</b>' +
        '<small>' + esc(dd.isRest ? t("restDay").split(" ")[0] : t("planDay", { n: dd.day })) + '</small></button>';
    }
    var exHtml = day.exercises.length ? '<div class="list">' + day.exercises.map(function (x, idx) {
      var done = log.done.indexOf(idx) >= 0;
      return '<button class="list-item' + (done ? " done" : "") + '" data-act="toggleEx" data-i="' + idx + '"' + (isFuture ? " disabled" : "") + ' aria-pressed="' + done + '">' +
        '<span class="tick">' + icon("check") + '</span><span class="grow"><span class="title">' + esc(L(x.name)) + '</span>' +
        '<span class="sub num" style="display:block">' + x.sets + ' ' + esc(t("sets")) + ' × ' + esc(x.reps) + ', ' + esc(t("rest")) + ' ' + esc(x.rest) + '</span></span></button>';
    }).join("") + '</div>' : '<div class="card empty"><div class="icon-wrap">' + icon("calendar") + '</div><h3 class="t-head">' + esc(t("restDay")) + '</h3><p>' +
      esc(state.settings.lang === "bm" ? "Berjalan ringan atau regangan 10 minit membantu pemulihan." : "A light walk or 10 minutes of stretching helps recovery.") + '</p></div>';

    v.innerHTML =
      '<section class="section row between" style="margin-top:8px"><div><h1 class="t-display">' + esc(focusLabel(day.isRest && !day.exercises.length ? { focus: t("restDay") } : day)) + '</h1>' +
        '<p class="muted" style="margin:4px 0 0">' + esc(t("planDay", { n: day.day })) + ' / ' + state.plan.days.length + (day.isDeload ? ", deload" : "") + '</p></div>' +
        '<button class="btn btn-ghost btn-sm" data-act="planSetup">' + esc(t("regenerate")) + '</button></section>' +
      '<section class="section"><div class="day-strip" id="strip">' + strip + '</div></section>' +
      '<section class="section">' + exHtml + '</section>' +
      (day.exercises.length && !isFuture ? '<section class="section row">' +
        '<button class="btn btn-ghost" data-act="restTimer" data-sec="' + (parseInt(day.exercises[0].rest, 10) || 60) + '">' + icon("timer") + esc(t("startRest")) + '</button>' +
        (log.completed ? '<span class="tag" style="margin-left:auto">' + icon("check") + esc(t("sessionDone")) + '</span>' :
          '<button class="btn btn-primary" style="flex:1" data-act="completeSession">' + esc(t("completeSession")) + '</button>') + '</section>' : '');
    var pressed = $('#strip [aria-pressed="true"]', v);
    if (pressed) pressed.scrollIntoView({ inline: "center", block: "nearest" });
  }
  ACTIONS.pickDay = function (el) { session.trainDay = +el.getAttribute("data-i"); renderTab(); };
  function selectedTrainKey() {
    var todayIdx = clamp(daysBetween(state.plan.start, dateKey()), 0, state.plan.days.length - 1);
    var sel = session.trainDay == null ? todayIdx : session.trainDay;
    return { k: addDays(state.plan.start, sel), day: state.plan.days[sel] };
  }
  ACTIONS.toggleEx = function (el) {
    var s = selectedTrainKey(), idx = +el.getAttribute("data-i");
    var log = state.sessions[s.k] || (state.sessions[s.k] = { day: s.day.day, focus: s.day.focus, done: [], completed: false });
    var at = log.done.indexOf(idx);
    if (at >= 0) log.done.splice(at, 1); else log.done.push(idx);
    if (log.done.length === s.day.exercises.length && !log.completed) { log.completed = true; log.minutes = estMinutes(s.day); toast(t("sessionComplete")); }
    save(); renderTab();
  };
  ACTIONS.completeSession = function () {
    var s = selectedTrainKey();
    var log = state.sessions[s.k] || (state.sessions[s.k] = { day: s.day.day, focus: s.day.focus, done: [] });
    log.done = s.day.exercises.map(function (_, i) { return i; });
    log.completed = true; log.minutes = estMinutes(s.day);
    save(); toast(t("sessionComplete")); renderTab();
  };
  ACTIONS.restTimer = function (el) {
    var total = +el.getAttribute("data-sec") || 60, left = total;
    var s = sheet('<div class="timer num" id="tm">' + left + 's</div><div class="seg" style="margin-top:16px">' +
      [45, 60, 90, 120].map(function (n) { return '<button data-sec="' + n + '" aria-pressed="' + (n === total) + '">' + n + 's</button>'; }).join("") + '</div>' +
      '<button class="btn btn-ghost btn-block" data-close style="margin-top:16px">' + esc(t("stop")) + '</button>', { title: t("startRest") });
    function run() {
      stopRestTimer();
      restTimer = setInterval(function () {
        left--; var tm = $("#tm"); if (tm) tm.textContent = Math.max(0, left) + "s";
        if (left <= 0) { stopRestTimer(); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); toast(t("restOver")); closeSheet(); }
      }, 1000);
    }
    s.querySelector(".seg").onclick = function (e) {
      var b = e.target.closest("[data-sec]"); if (!b) return;
      total = left = +b.getAttribute("data-sec"); $("#tm").textContent = left + "s";
      $$(".seg button", s).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); run();
    };
    run();
  };

  // ---------- Eat ----------
  function viewEat(v) {
    var k = dateKey(), tg = targets(), tot = eatenTotals(k), dm = dayMeals(k), water = state.water[k] || 0;
    function bar(label, val, max) {
      return '<div><div class="row between t-small"><span>' + esc(label) + '</span><span class="num muted">' + val + ' / ' + max + ' g</span></div>' +
        '<div class="bar"><i style="width:' + Math.round(clamp(val / max, 0, 1) * 100) + '%"></i></div></div>';
    }
    v.innerHTML =
      '<section class="section" style="margin-top:8px"><h1 class="t-display">' + esc(t("eatTitle")) + '</h1>' +
        '<p class="muted" style="margin:4px 0 0">' + esc(t("diet_" + state.profile.diet)) + ', <span class="num">' + tot.kcal + ' / ' + tg.kcal + '</span> kcal</p></section>' +
      '<section class="section card"><h2 class="t-head" style="margin-bottom:12px">' + esc(t("targets")) + '</h2><div class="macro-bars">' +
        bar(t("protein"), tot.p, tg.protein) + bar(t("carbs"), tot.c, tg.carbs) + bar(t("fat"), tot.f, tg.fat) + '</div></section>' +
      '<section class="section">' + SLOTS.map(function (slot) {
        var m = mealFor(slot, k), eaten = !!dm.eaten[slot];
        return '<div class="card meal">' +
          '<div><span class="t-micro">' + esc(t(slot)) + '</span><h3 class="t-head" style="margin-top:2px">' + esc(L(m.meal.name)) + '</h3>' +
          '<p class="meal-items">' + esc(L(m.meal.items)) + '</p></div>' +
          '<div style="text-align:right"><b class="num" style="font-size:18px">' + m.kcal + '</b><div class="t-micro">kcal</div></div>' +
          '<div class="macros num" style="grid-column:1/-1"><span>P ' + m.p + 'g</span><span>C ' + m.c + 'g</span><span>F ' + m.f + 'g</span>' +
            (m.scale !== 1 ? '<span>' + esc(t("portion", { n: m.scale })) + '</span>' : '') + '</div>' +
          '<div class="row" style="grid-column:1/-1;margin-top:6px">' +
            '<button class="btn btn-sm ' + (eaten ? "btn-soft" : "btn-primary") + '" data-act="eat" data-slot="' + slot + '" aria-pressed="' + eaten + '">' + (eaten ? icon("check") + esc(t("eatenDone")) : esc(t("markEaten"))) + '</button>' +
            '<button class="btn btn-sm btn-ghost" data-act="swap" data-slot="' + slot + '"' + (eaten ? " disabled" : "") + '>' + icon("swap") + esc(t("swap")) + '</button></div>' +
          '</div>';
      }).join("") + '</section>' +
      '<section class="section card"><div class="row between" style="margin-bottom:12px"><h2 class="t-head">' + esc(t("water")) + '</h2><span class="t-small muted num">' + esc(t("glasses", { n: water })) + '</span></div>' +
        '<div class="water">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
          return '<button data-act="water" data-n="' + n + '" class="' + (n <= water ? "on" : "") + '" aria-label="' + n + '"></button>';
        }).join("") + '</div></section>' +
      '<p class="t-micro" style="margin-top:18px">' + esc(state.settings.lang === "bm" ? "Nilai kalori dan makro ialah anggaran." : "Calorie and macro values are estimates.") + '</p>';
  }
  ACTIONS.eat = function (el) {
    var dm = dayMeals(), slot = el.getAttribute("data-slot");
    dm.eaten[slot] = !dm.eaten[slot]; save(); renderTab();
  };
  ACTIONS.swap = function (el) {
    var dm = dayMeals(), slot = el.getAttribute("data-slot");
    dm.picks[slot] = (dm.picks[slot] + 1) % mealOptions(slot).length; save(); renderTab();
  };
  ACTIONS.water = function (el) {
    var k = dateKey(), n = +el.getAttribute("data-n");
    state.water[k] = (state.water[k] === n) ? n - 1 : n; save(); renderTab();
  };

  // ---------- Coach ----------
  var aiBusy = false;
  function viewCoach(v) {
    if (!session.user) {
      v.innerHTML = '<section class="section"><h1 class="t-display">' + esc(t("coachTitle")) + '</h1></section>' +
        '<div class="card empty"><div class="icon-wrap">' + icon("chat") + '</div><p>' + esc(t("coachNeedsAccount")) + '</p>' +
        '<button class="btn btn-primary" data-act="toSignup">' + esc(t("createAccount")) + '</button></div>';
      return;
    }
    var msgs = state.chat.slice(-60);
    v.innerHTML =
      '<section class="section" style="margin-top:8px"><h1 class="t-display">' + esc(t("coachTitle")) + '</h1>' +
        '<p class="t-small muted" style="margin:6px 0 0;max-width:60ch">' + esc(t("coachIntro")) + '</p></section>' +
      '<section class="section"><div class="chat" id="chat">' +
        (msgs.length ? msgs.map(function (m, i) { return bubble(m, state.chat.length - msgs.length + i); }).join("") :
          '<div class="chips" style="flex-wrap:wrap">' + ["q1", "q2", "q3", "q4"].map(function (q) {
            return '<button class="chip" data-act="quickAsk" data-q="' + q + '">' + esc(t(q)) + '</button>';
          }).join("") + '</div>') +
        (aiBusy ? '<div class="bubble assistant typing" aria-label="…"><span></span><span></span><span></span></div>' : '') +
      '</div>' +
      (session.aiRemaining != null ? '<p class="t-micro" style="margin-top:10px">' + esc(t("remaining", { n: session.aiRemaining })) + '</p>' : '') +
      '<form class="composer" id="composer"><input id="ask" maxlength="1000" placeholder="' + esc(t("askPlaceholder")) + '" aria-label="' + esc(t("askPlaceholder")) + '" autocomplete="off"' + (aiBusy ? " disabled" : "") + '>' +
      '<button class="btn btn-primary" aria-label="' + esc(t("send")) + '"' + (aiBusy ? " disabled" : "") + '>' + icon("send") + '</button></form></section>';
    $("#composer", v).onsubmit = function (e) { e.preventDefault(); var q = $("#ask").value.trim(); if (q) ask(q); };
    var last = $("#chat", v).lastElementChild; if (last && msgs.length) last.scrollIntoView({ block: "end" });
  }
  function bubble(m, i) {
    var tools = m.role === "assistant" && !m.local ? '<div class="bubble-tools"><button data-act="copyMsg" data-i="' + i + '">' + icon("copy") + esc(t("copy")) + '</button>' +
      '<button data-act="reportMsg" data-i="' + i + '"' + (m.reported ? " disabled" : "") + '>' + icon("flag") + esc(m.reported ? t("reported").split(".")[0] : t("report")) + '</button></div>' : '';
    return '<div class="bubble ' + m.role + '">' + esc(m.content) + tools + '</div>';
  }
  function ask(q) {
    if (aiBusy) return;
    state.chat.push({ role: "user", content: q, ts: Date.now() });
    aiBusy = true; save(); renderTab();
    var tg = targets(), p = state.profile;
    var profile = { name: p.name, age: p.age, sex: p.gender, heightCm: p.height, weightKg: currentWeight(), targetWeightKg: p.targetWeight,
      activity: p.activity, level: p.level, goal: p.goal, diet: p.diet, dailyKcal: tg.kcal, proteinG: tg.protein,
      todaySession: (planDayFor(dateKey()) || {}).day ? focusLabel(planDayFor(dateKey()).day) : null, workoutsLogged: workoutDates().length };
    var history = state.chat.filter(function (m) { return !m.local; }).slice(-12).map(function (m) { return { role: m.role, content: m.content }; });
    callFn(CONFIG.fn.aiCoach, { messages: history, profile: profile, lang: state.settings.lang })
      .then(function (d) {
        state.chat.push({ role: "assistant", content: d.reply || t("aiError"), ts: Date.now() });
        session.aiRemaining = d.remaining;
      })
      .catch(function (e) {
        var msg = e.status === 429 ? t("limitReached", { n: (e.data && e.data.limit) || 5 }) : t("aiError");
        state.chat.push({ role: "assistant", content: msg, ts: Date.now(), local: true });
        if (e.status === 429 && !session.premium) setTimeout(openPaywall, 600);
      })
      .then(function () { aiBusy = false; save(); if (session.tab === "coach") renderTab(); });
  }
  ACTIONS.quickAsk = function (el) { ask(t(el.getAttribute("data-q"))); };
  ACTIONS.toSignup = function () { showAuth("signup"); };
  ACTIONS.copyMsg = function (el) {
    var m = state.chat[+el.getAttribute("data-i")]; if (!m) return;
    (navigator.clipboard ? navigator.clipboard.writeText(m.content) : Promise.reject()).then(function () { toast(t("copied")); }).catch(function () {});
  };
  ACTIONS.reportMsg = function (el) {
    var i = +el.getAttribute("data-i"), m = state.chat[i]; if (!m || m.reported) return;
    var prev = state.chat[i - 1];
    var reasons = state.settings.lang === "bm" ? ["Tidak selamat", "Tidak tepat", "Menyinggung", "Lain-lain"] : ["Unsafe", "Inaccurate", "Offensive", "Other"];
    var s = sheet('<div class="choice-list">' + reasons.map(function (r) { return '<button class="choice" data-reason="' + esc(r) + '"><strong>' + esc(r) + '</strong></button>'; }).join("") + '</div>', { title: t("report") });
    s.querySelector(".choice-list").onclick = function (e) {
      var b = e.target.closest("[data-reason]"); if (!b) return;
      fb.db.collection("aiReports").add({ uid: session.user.uid, reply: m.content.slice(0, 4900), prompt: prev ? prev.content.slice(0, 1000) : "",
        reason: b.getAttribute("data-reason"), lang: state.settings.lang, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
        .then(function () { m.reported = true; save(); closeSheet(); toast(t("reported")); renderTab(); })
        .catch(function () { toast(t("errorGeneric")); });
    };
  };

  // ---------- Progress ----------
  function weightChart(ws) {
    var W = 600, H = 180, pad = 26;
    var vals = ws.map(function (w) { return w.kg; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (max - min < 2) { min -= 1; max += 1; }
    var x = function (i) { return pad + (i * (W - pad * 2)) / Math.max(1, ws.length - 1); };
    var y = function (kg) { return H - pad - ((kg - min) / (max - min)) * (H - pad * 2); };
    var pts = ws.map(function (w, i) { return x(i).toFixed(1) + "," + y(w.kg).toFixed(1); });
    var area = "M" + x(0) + "," + (H - pad) + " L" + pts.join(" L") + " L" + x(ws.length - 1) + "," + (H - pad) + " Z";
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(t("weightTrend")) + '">' +
      '<line class="gd" x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y(max) + '" y2="' + y(max) + '"/>' +
      '<line class="gd" x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y(min) + '" y2="' + y(min) + '"/>' +
      '<path class="ar" d="' + area + '" opacity=".6"/><polyline class="ln" points="' + pts.join(" ") + '"/>' +
      '<text x="' + pad + '" y="' + (y(max) - 6) + '">' + round(max, 1) + '</text><text x="' + pad + '" y="' + (y(min) + 16) + '">' + round(min, 1) + '</text></svg>';
  }
  function monthGrid() {
    var now = new Date(), y = now.getFullYear(), mo = now.getMonth();
    var first = new Date(y, mo, 1), daysIn = new Date(y, mo + 1, 0).getDate();
    var offset = (first.getDay() + 6) % 7; // Monday first
    var dows = state.settings.lang === "bm" ? ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var html = dows.map(function (d) { return '<div class="dow">' + d + '</div>'; }).join("");
    for (var i = 0; i < offset; i++) html += '<div class="d o"></div>';
    var today = dateKey();
    for (var d = 1; d <= daysIn; d++) {
      var k = dateKey(new Date(y, mo, d)), lg = sessionLog(k);
      html += '<div class="d' + (lg && lg.completed ? " w" : "") + (k === today ? " t" : "") + ' num">' + d + '</div>';
    }
    return '<div class="month">' + html + '</div>';
  }
  function viewProgress(v) {
    var ws = state.weights.slice(-30), b = bmi();
    var hist = workoutDates().slice(-8).reverse();
    var bmiNote = b < 18.5 ? (state.settings.lang === "bm" ? "Kurang berat" : "Underweight") : b < 23 ? (state.settings.lang === "bm" ? "Sihat (piawaian Asia)" : "Healthy (Asian cut-offs)") : b < 27.5 ? (state.settings.lang === "bm" ? "Berlebihan berat" : "Overweight") : (state.settings.lang === "bm" ? "Obes" : "Obese");
    v.innerHTML =
      '<section class="section" style="margin-top:8px"><h1 class="t-display">' + esc(t("progressTitle")) + '</h1></section>' +
      '<section class="section card"><div class="row between"><h2 class="t-head">' + esc(t("weightTrend")) + '</h2><button class="btn btn-soft btn-sm" data-act="logWeight">' + icon("plus") + esc(t("logWeight")) + '</button></div>' +
        (ws.length >= 2 ? '<div style="margin-top:12px">' + weightChart(ws) + '</div>' : '<p class="muted t-small">' + esc(t("noWeights")) + '</p>') +
        '<div class="grid-3" style="margin-top:12px">' +
          '<div><b class="num" style="font-size:20px">' + currentWeight() + '</b><div class="t-micro">kg</div></div>' +
          '<div><b class="num" style="font-size:20px">' + (state.profile.targetWeight || "–") + '</b><div class="t-micro">' + (state.settings.lang === "bm" ? "sasaran kg" : "target kg") + '</div></div>' +
          '<div><b class="num" style="font-size:20px">' + b + '</b><div class="t-micro">' + esc(t("bmi")) + ', ' + esc(bmiNote) + '</div></div>' +
        '</div></section>' +
      '<section class="section card"><div class="row between" style="margin-bottom:12px"><h2 class="t-head">' + esc(t("thisMonth")) + '</h2><span class="tag sun num">' + streak() + ' ' + esc(t("streak")) + '</span></div>' + monthGrid() + '</section>' +
      '<section class="section"><h2 class="t-head" style="margin-bottom:12px">' + esc(t("history")) + '</h2>' +
        (hist.length ? '<div class="list">' + hist.map(function (k) {
          var lg = state.sessions[k];
          return '<div class="list-item"><span class="tick" style="background:var(--pandan);border-color:var(--pandan);color:var(--pandan-ink)">' + '<svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px;stroke-width:3" aria-hidden="true">' + ICON.check + '</svg>' + '</span>' +
            '<span class="grow"><span class="title">' + esc(focusLabel({ focus: lg.focus })) + '</span><span class="sub" style="display:block">' + esc(fmtDate(k, { weekday: "short", day: "numeric", month: "short" })) + (lg.minutes ? ", ~" + lg.minutes + " min" : "") + '</span></span></div>';
        }).join("") + '</div>' : '<p class="muted t-small">' + esc(t("noHistory")) + '</p>') + '</section>';
  }

  // =====================================================================
  // Settings
  // =====================================================================
  function openSettings() {
    var u = session.user;
    var subLabel = session.premium ? t("premium") : t("free");
    var s = sheet(
      '<div class="list">' +
        '<div class="settings-row"><div><div style="font-weight:700">' + esc(state.profile.name) + '</div><div class="t-micro">' + esc(u ? u.email : t("guest")) + '</div></div>' +
        '<button class="btn btn-ghost btn-sm" data-s="edit">' + esc(t("editProfile")) + '</button></div>' +
      '</div>' +
      '<h3 class="t-head" style="margin:22px 0 10px">' + esc(t("language")) + '</h3>' + langSeg() +
      '<h3 class="t-head" style="margin:22px 0 10px">' + esc(t("theme")) + '</h3>' +
        '<div class="seg">' + ["system", "light", "dark"].map(function (th) { return '<button data-theme-set="' + th + '" aria-pressed="' + (state.settings.theme === th) + '">' + esc(t("th_" + th)) + '</button>'; }).join("") + '</div>' +
      '<h3 class="t-head" style="margin:22px 0 10px">' + esc(t("subscription")) + '</h3><div class="list">' +
        '<div class="settings-row"><span>' + esc(subLabel) + '</span>' + (session.premium ? '<span class="tag sun">' + icon("star") + esc(t("premium")) + '</span>' : '<button class="btn btn-primary btn-sm" data-s="upgrade">' + esc(t("upgrade")) + '</button>') + '</div>' +
        (u && isNative ? '<button class="settings-row" data-s="restore"><span>' + esc(t("restore")) + '</span>' + icon("chevron") + '</button>' : '') +
        (u && (session.premium || isNative) ? '<button class="settings-row" data-s="manage"><span>' + esc(t("manage")) + '</span>' + icon("chevron") + '</button>' : '') +
      '</div>' +
      '<h3 class="t-head" style="margin:22px 0 10px">' + esc(t("legal")) + '</h3><div class="list">' +
        '<button class="settings-row" data-s="disclaimer"><span>' + esc(t("disclaimer")) + '</span>' + icon("chevron") + '</button>' +
        '<a class="settings-row" href="' + CONFIG.privacyUrl + '" style="color:inherit;text-decoration:none"><span>' + esc(t("privacy")) + '</span>' + icon("chevron") + '</a>' +
        '<a class="settings-row" href="' + CONFIG.termsUrl + '" style="color:inherit;text-decoration:none"><span>' + esc(t("terms")) + '</span>' + icon("chevron") + '</a>' +
        '<a class="settings-row" href="mailto:' + CONFIG.supportEmail + '?subject=FitAI%20Coach%20support" style="color:inherit;text-decoration:none"><span>' + esc(t("contact")) + '</span>' + icon("chevron") + '</a>' +
      '</div>' +
      '<h3 class="t-head" style="margin:22px 0 10px">' + esc(t("account")) + '</h3><div class="stack">' +
        (u ? '<button class="btn btn-ghost btn-block" data-s="signout">' + esc(t("signOut")) + '</button>' +
             '<button class="btn btn-danger btn-block" data-s="delete">' + esc(t("deleteAccount")) + '</button>'
           : '<button class="btn btn-primary btn-block" data-s="signup">' + esc(t("createAccount")) + '</button>' +
             '<button class="btn btn-danger btn-block" data-s="resetGuest">' + esc(t("resetGuest")) + '</button>') +
      '</div>' +
      '<p class="t-micro" style="text-align:center;margin-top:20px">' + esc(t("version")) + ' ' + CONFIG.version + '</p>',
      { title: t("settings") });
    s.querySelector(".sheet").addEventListener("click", function (e) {
      var lang = e.target.closest("[data-lang]");
      if (lang) { state.settings.lang = lang.getAttribute("data-lang"); save(); render(); openSettings(); return; }
      var th = e.target.closest("[data-theme-set]");
      if (th) { state.settings.theme = th.getAttribute("data-theme-set"); save(); applyTheme(); openSettings(); return; }
      var b = e.target.closest("[data-s]"); if (!b) return;
      var a = b.getAttribute("data-s");
      if (a === "edit") openEditProfile();
      else if (a === "upgrade") openPaywall();
      else if (a === "restore") restorePurchases();
      else if (a === "manage") manageSubscription();
      else if (a === "disclaimer") sheet('<p style="margin-top:0">' + esc(t("disclaimerBody")) + '</p>', { title: t("disclaimer") });
      else if (a === "signout") signOut();
      else if (a === "delete") openDelete();
      else if (a === "signup") { closeSheet(); showAuth("signup"); }
      else if (a === "resetGuest") confirmSheet(t("resetGuest"), t("resetGuestBody"), t("deleteNow"), function () {
        localStorage.removeItem("fitai.v2.guest"); session.guest = false; state = DEFAULT_STATE(); gateMode = "welcome"; closeSheet(); render();
      });
    });
  }
  function confirmSheet(title, body, cta, fn) {
    var s = sheet('<p style="margin-top:0">' + esc(body) + '</p><div class="row" style="margin-top:16px"><button class="btn btn-ghost" data-close style="flex:1">' + esc(t("cancel")) + '</button>' +
      '<button class="btn btn-danger" id="cfm" style="flex:1">' + esc(cta) + '</button></div>', { title: title });
    $("#cfm", s).onclick = fn;
  }
  function signOut() {
    billingLogout();
    if (session.unsubUser) { session.unsubUser(); session.unsubUser = null; }
    fb.auth.signOut().then(function () { closeSheet(); toast(t("signedOut")); });
  }
  function openDelete() {
    var s = sheet('<p style="margin-top:0">' + esc(t("deleteBody")) + '</p>' +
      '<label class="field"><span>' + esc(t("typeDelete")) + '</span><input class="input" id="delIn" autocomplete="off" autocapitalize="characters"></label>' +
      '<div class="error-text" id="delErr" role="alert"></div>' +
      '<button class="btn btn-danger btn-block" id="delGo" disabled style="margin-top:8px">' + esc(t("deleteNow")) + '</button>', { title: t("deleteTitle") });
    $("#delIn", s).oninput = function () { $("#delGo", s).disabled = this.value.trim().toUpperCase() !== "DELETE"; };
    $("#delGo", s).onclick = function () {
      loading(true);
      var uid = session.user.uid;
      callFn(CONFIG.fn.deleteAccount, {}).then(function () {
        localStorage.removeItem("fitai.v2." + uid);
        billingLogout();
        if (session.unsubUser) { session.unsubUser(); session.unsubUser = null; }
        return fb.auth.signOut().catch(function () {});
      }).then(function () {
        loading(false); closeSheet(); state = DEFAULT_STATE(); gateMode = "welcome"; toast(t("deleted"), 3500); render();
      }).catch(function (e) { loading(false); $("#delErr", s).textContent = (e && e.message) || t("errorGeneric"); });
    };
  }

  // =====================================================================
  // Paywall
  // =====================================================================
  function openPaywall() {
    if (session.premium) return;
    var priceLine = platform === "web" ? L(CONFIG.webPriceLabel) : (state.settings.lang === "bm" ? "Harga dipaparkan oleh " : "Price shown by ") + (platform === "ios" ? "App Store" : "Google Play");
    var s = sheet(
      '<p class="muted" style="margin-top:0">' + esc(t("paywallSub")) + '</p>' +
      ["perk1", "perk2", "perk3", "perk4", "perk5"].map(function (p) { return '<div class="perk">' + icon("check") + '<span>' + esc(t(p)) + '</span></div>'; }).join("") +
      '<div class="panel" style="margin-top:16px"><div class="row between"><strong>' + esc(t("premium")) + '</strong><strong class="num">' + esc(priceLine) + '</strong></div></div>' +
      '<button class="btn btn-primary btn-block" id="buy" style="margin-top:16px">' + esc(session.user ? t("subscribe") : t("createAccount")) + '</button>' +
      (isNative && session.user ? '<button class="link-btn" id="rst" style="width:100%;margin-top:6px">' + esc(t("restore")) + '</button>' : '') +
      '<p class="fine" style="margin-top:14px">' + esc(t("autoRenew")) + '</p>' +
      '<p class="fine"><a href="' + CONFIG.termsUrl + '">' + esc(t("terms")) + '</a> &nbsp; <a href="' + CONFIG.privacyUrl + '">' + esc(t("privacy")) + '</a></p>',
      { title: t("paywallTitle") });
    $("#buy", s).onclick = startPurchase;
    var r = $("#rst", s); if (r) r.onclick = restorePurchases;
  }

  // =====================================================================
  // Boot
  // =====================================================================
  function boot() {
    root = document.getElementById("root");
    loadLocal(); // guest/prefs for first paint
    applyTheme();
    if (window.matchMedia) {
      var mq = matchMedia("(prefers-color-scheme: dark)");
      (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { if (state.settings.theme === "system") applyTheme(); });
    }
    window.addEventListener("online", function () { session.online = true; pushRemote(); });
    window.addEventListener("offline", function () { session.online = false; toast(t("offline")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

    var params = new URLSearchParams(location.search);
    if (params.get("payment") === "success") { setTimeout(function () { toast(t("paySuccess"), 4000); }, 600); history.replaceState(null, "", location.pathname); }
    if (params.get("payment") === "cancelled") history.replaceState(null, "", location.pathname);

    if (!initFirebase()) {
      // Firebase unavailable (offline first launch): allow guest use.
      render();
      return;
    }
    loading(true);
    var first = true;
    fb.auth.onAuthStateChanged(function (user) {
      session.user = user || null;
      if (user) {
        session.guest = false;
        loadLocal();
        pullRemote().then(function () {
          if (pendingName && state.profile == null) { /* name prefilled in onboarding */ }
          watchPremium(user.uid);
          billingLogin(user.uid);
          loading(false); render();
        });
      } else {
        session.premium = false;
        if (!session.guest) { state = DEFAULT_STATE(); loadLocalPrefs(); gateMode = "welcome"; }
        loading(false);
        if (first || !session.guest) render();
      }
      first = false;
    });
  }
  function loadLocalPrefs() {
    try { Object.assign(state.settings, JSON.parse(localStorage.getItem("fitai.prefs") || "{}")); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
