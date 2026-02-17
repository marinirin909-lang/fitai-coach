/* ============================================
   FitAI Coach - Workout Database
   Inspired by workout-fitai repo features:
   - Customizable workout splits & muscle groups
   - Equipment-based exercise filtering
   - Exercise progression (easy → hard variations)
   - Deload week support
   - Fitness level adaptation
   - Rest day mobility workouts
   ============================================ */

const WorkoutDB = {

    // === TIER DEFINITIONS ===
    tiers: {
        free: {
            maxDuration: 7,
            maxSplits: ['full-body'],
            maxExercisesPerDay: 5,
            features: ['basic-exercises', 'bodyweight', 'basic-equipment'],
            deloadWeeks: false,
            customMuscleTargeting: false,
            exerciseProgression: false,
            mobilityWorkouts: false,
            injuryPrevention: false,
            sportsSpecific: false
        },
        premium: {
            maxDuration: 90,
            maxSplits: ['full-body', 'upper-lower', 'push-pull-legs', 'bro-split', 'custom'],
            maxExercisesPerDay: 12,
            features: ['all-exercises', 'all-equipment', 'progression', 'deload', 'mobility', 'sports', 'injury-prevention'],
            deloadWeeks: true,
            customMuscleTargeting: true,
            exerciseProgression: true,
            mobilityWorkouts: true,
            injuryPrevention: true,
            sportsSpecific: true
        }
    },

    // === WORKOUT SPLITS ===
    splits: {
        'full-body': {
            name: { en: 'Full Body', bm: 'Seluruh Badan' },
            description: { en: 'Train all muscle groups each session', bm: 'Latih semua kumpulan otot setiap sesi' },
            tier: 'free',
            daysPerWeek: 3,
            schedule: ['workout', 'rest', 'workout', 'rest', 'workout', 'rest', 'rest'],
            muscleGroups: ['chest', 'back', 'shoulders', 'legs', 'core']
        },
        'upper-lower': {
            name: { en: 'Upper / Lower', bm: 'Atas / Bawah' },
            description: { en: 'Alternate upper and lower body days', bm: 'Selang seli hari badan atas dan bawah' },
            tier: 'premium',
            daysPerWeek: 4,
            schedule: ['upper', 'lower', 'rest', 'upper', 'lower', 'rest', 'rest'],
            muscleGroups: {
                upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
                lower: ['quads', 'hamstrings', 'glutes', 'calves', 'core']
            }
        },
        'push-pull-legs': {
            name: { en: 'Push / Pull / Legs', bm: 'Tolak / Tarik / Kaki' },
            description: { en: 'Classic PPL split for maximum growth', bm: 'Split PPL klasik untuk pertumbuhan maksimum' },
            tier: 'premium',
            daysPerWeek: 6,
            schedule: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'rest'],
            muscleGroups: {
                push: ['chest', 'shoulders', 'triceps'],
                pull: ['back', 'biceps', 'rear-delts'],
                legs: ['quads', 'hamstrings', 'glutes', 'calves', 'core']
            }
        },
        'bro-split': {
            name: { en: '5-Day Body Part Split', bm: 'Split 5 Hari Bahagian Badan' },
            description: { en: 'Dedicated day for each muscle group', bm: 'Hari khusus untuk setiap kumpulan otot' },
            tier: 'premium',
            daysPerWeek: 5,
            schedule: ['chest', 'back', 'shoulders', 'legs', 'arms', 'rest', 'rest'],
            muscleGroups: {
                chest: ['chest', 'triceps'],
                back: ['back', 'biceps'],
                shoulders: ['shoulders', 'traps', 'rear-delts'],
                legs: ['quads', 'hamstrings', 'glutes', 'calves'],
                arms: ['biceps', 'triceps', 'forearms', 'core']
            }
        }
    },

    // === EXERCISE DATABASE ===
    // Each exercise has: name, muscle groups, equipment, difficulty, tier, sets/reps config, progression variants
    exercises: {

        // ──── CHEST ────
        chest: [
            {
                id: 'push-up',
                name: { en: 'Push-ups', bm: 'Tekan Tubi' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['chest', 'triceps', 'shoulders'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '12-15', advanced: '15-20' },
                rest: '60s',
                progression: [
                    { id: 'knee-push-up', name: { en: 'Knee Push-ups', bm: 'Tekan Tubi Lutut' }, difficulty: 'beginner' },
                    { id: 'push-up', name: { en: 'Push-ups', bm: 'Tekan Tubi' }, difficulty: 'intermediate' },
                    { id: 'diamond-push-up', name: { en: 'Diamond Push-ups', bm: 'Tekan Tubi Berlian' }, difficulty: 'advanced' },
                    { id: 'archer-push-up', name: { en: 'Archer Push-ups', bm: 'Tekan Tubi Pemanah' }, difficulty: 'advanced' }
                ]
            },
            {
                id: 'incline-push-up',
                name: { en: 'Incline Push-ups', bm: 'Tekan Tubi Condong' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['chest', 'triceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '15-20' },
                rest: '60s',
                progression: []
            },
            {
                id: 'wide-push-up',
                name: { en: 'Wide Push-ups', bm: 'Tekan Tubi Lebar' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['chest', 'shoulders'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '6-8', intermediate: '10-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'db-bench-press',
                name: { en: 'Dumbbell Bench Press', bm: 'Tekan Dada Dumbbell' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['chest', 'triceps', 'shoulders'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '12-15' },
                rest: '90s',
                progression: []
            },
            {
                id: 'db-fly',
                name: { en: 'Dumbbell Flyes', bm: 'Fly Dumbbell' },
                equipment: 'basic',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['chest'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'barbell-bench-press',
                name: { en: 'Barbell Bench Press', bm: 'Tekan Dada Barbell' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['chest', 'triceps', 'shoulders'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '8-10', intermediate: '8-12', advanced: '6-10' },
                rest: '120s',
                progression: []
            },
            {
                id: 'incline-bench-press',
                name: { en: 'Incline Bench Press', bm: 'Tekan Dada Condong' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['chest', 'shoulders'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '8-12' },
                rest: '90s',
                progression: []
            },
            {
                id: 'cable-crossover',
                name: { en: 'Cable Crossover', bm: 'Kabel Crossover' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['chest'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '12-15', intermediate: '12-15', advanced: '10-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'chest-dip',
                name: { en: 'Chest Dips', bm: 'Dip Dada' },
                equipment: 'gym',
                difficulty: 'advanced',
                tier: 'premium',
                muscleGroups: ['chest', 'triceps', 'shoulders'],
                sets: { beginner: 2, intermediate: 3, advanced: 4 },
                reps: { beginner: '5-8', intermediate: '8-12', advanced: '10-15' },
                rest: '90s',
                progression: []
            }
        ],

        // ──── BACK ────
        back: [
            {
                id: 'superman',
                name: { en: 'Superman Hold', bm: 'Pegangan Superman' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['back', 'glutes'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '20s hold', intermediate: '30s hold', advanced: '45s hold' },
                rest: '45s',
                progression: []
            },
            {
                id: 'inverted-row',
                name: { en: 'Inverted Rows', bm: 'Barisan Terbalik' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['back', 'biceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '6-8', intermediate: '8-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'reverse-snow-angel',
                name: { en: 'Reverse Snow Angel', bm: 'Malaikat Salji Terbalik' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['back', 'shoulders'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '12-15', advanced: '15-20' },
                rest: '45s',
                progression: []
            },
            {
                id: 'db-row',
                name: { en: 'Dumbbell Rows', bm: 'Barisan Dumbbell' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['back', 'biceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'db-pullover',
                name: { en: 'Dumbbell Pullover', bm: 'Pullover Dumbbell' },
                equipment: 'basic',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['back', 'chest'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'band-pull-apart',
                name: { en: 'Band Pull-Apart', bm: 'Tarik Band' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['back', 'rear-delts'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '12-15', intermediate: '15-20', advanced: '20-25' },
                rest: '45s',
                progression: []
            },
            {
                id: 'lat-pulldown',
                name: { en: 'Lat Pulldown', bm: 'Tarik Lat' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['back', 'biceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '90s',
                progression: []
            },
            {
                id: 'pull-up',
                name: { en: 'Pull-ups', bm: 'Tarik Badan' },
                equipment: 'gym',
                difficulty: 'advanced',
                tier: 'premium',
                muscleGroups: ['back', 'biceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '3-5', intermediate: '6-10', advanced: '10-15' },
                rest: '120s',
                progression: [
                    { id: 'assisted-pull-up', name: { en: 'Assisted Pull-ups', bm: 'Tarik Badan Berbantu' }, difficulty: 'beginner' },
                    { id: 'pull-up', name: { en: 'Pull-ups', bm: 'Tarik Badan' }, difficulty: 'intermediate' },
                    { id: 'weighted-pull-up', name: { en: 'Weighted Pull-ups', bm: 'Tarik Badan Berwajaran' }, difficulty: 'advanced' }
                ]
            },
            {
                id: 'barbell-row',
                name: { en: 'Barbell Row', bm: 'Barisan Barbell' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['back', 'biceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '8-10', intermediate: '8-12', advanced: '6-10' },
                rest: '90s',
                progression: []
            },
            {
                id: 'cable-row',
                name: { en: 'Seated Cable Row', bm: 'Barisan Kabel Duduk' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['back', 'biceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '10-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'deadlift',
                name: { en: 'Deadlift', bm: 'Angkat Mati' },
                equipment: 'gym',
                difficulty: 'advanced',
                tier: 'premium',
                muscleGroups: ['back', 'hamstrings', 'glutes'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '5-8', intermediate: '5-8', advanced: '3-6' },
                rest: '180s',
                progression: []
            }
        ],

        // ──── SHOULDERS ────
        shoulders: [
            {
                id: 'pike-push-up',
                name: { en: 'Pike Push-ups', bm: 'Tekan Tubi Pike' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['shoulders', 'triceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '6-8', intermediate: '8-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'lateral-raise-bodyweight',
                name: { en: 'Wall Lateral Raise', bm: 'Angkat Sisi Dinding' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['shoulders'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '12-15' },
                rest: '45s',
                progression: []
            },
            {
                id: 'db-shoulder-press',
                name: { en: 'Dumbbell Shoulder Press', bm: 'Tekan Bahu Dumbbell' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['shoulders', 'triceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '90s',
                progression: []
            },
            {
                id: 'db-lateral-raise',
                name: { en: 'Dumbbell Lateral Raise', bm: 'Angkat Sisi Dumbbell' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['shoulders'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '12-15' },
                rest: '45s',
                progression: []
            },
            {
                id: 'db-front-raise',
                name: { en: 'Dumbbell Front Raise', bm: 'Angkat Depan Dumbbell' },
                equipment: 'basic',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['shoulders'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '12-15' },
                rest: '45s',
                progression: []
            },
            {
                id: 'db-rear-delt-fly',
                name: { en: 'Rear Delt Fly', bm: 'Fly Delt Belakang' },
                equipment: 'basic',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['shoulders', 'rear-delts'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '12-15' },
                rest: '45s',
                progression: []
            },
            {
                id: 'overhead-press',
                name: { en: 'Barbell Overhead Press', bm: 'Tekan Atas Barbell' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['shoulders', 'triceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '6-8', intermediate: '8-10', advanced: '6-8' },
                rest: '120s',
                progression: []
            },
            {
                id: 'face-pull',
                name: { en: 'Face Pulls', bm: 'Tarik Muka' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['shoulders', 'rear-delts', 'traps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '12-15', intermediate: '15-20', advanced: '15-20' },
                rest: '45s',
                progression: []
            }
        ],

        // ──── LEGS ────
        legs: [
            {
                id: 'bodyweight-squat',
                name: { en: 'Bodyweight Squats', bm: 'Cangkung Berat Badan' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['quads', 'glutes'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '15-20', advanced: '20-25' },
                rest: '60s',
                progression: [
                    { id: 'bodyweight-squat', name: { en: 'Bodyweight Squats', bm: 'Cangkung Berat Badan' }, difficulty: 'beginner' },
                    { id: 'jump-squat', name: { en: 'Jump Squats', bm: 'Cangkung Lompat' }, difficulty: 'intermediate' },
                    { id: 'pistol-squat', name: { en: 'Pistol Squats', bm: 'Cangkung Pistol' }, difficulty: 'advanced' }
                ]
            },
            {
                id: 'lunges',
                name: { en: 'Lunges', bm: 'Lunge' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['quads', 'glutes', 'hamstrings'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8 each', intermediate: '12 each', advanced: '15 each' },
                rest: '60s',
                progression: []
            },
            {
                id: 'glute-bridge',
                name: { en: 'Glute Bridge', bm: 'Jambatan Glut' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['glutes', 'hamstrings'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '12-15', intermediate: '15-20', advanced: '20-25' },
                rest: '45s',
                progression: []
            },
            {
                id: 'wall-sit',
                name: { en: 'Wall Sit', bm: 'Duduk Dinding' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['quads'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '20s hold', intermediate: '30s hold', advanced: '45s hold' },
                rest: '45s',
                progression: []
            },
            {
                id: 'step-up',
                name: { en: 'Step-ups', bm: 'Langkah Naik' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['quads', 'glutes'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8 each', intermediate: '10 each', advanced: '12 each' },
                rest: '60s',
                progression: []
            },
            {
                id: 'goblet-squat',
                name: { en: 'Goblet Squat', bm: 'Cangkung Goblet' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['quads', 'glutes'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '12-15' },
                rest: '90s',
                progression: []
            },
            {
                id: 'db-romanian-deadlift',
                name: { en: 'DB Romanian Deadlift', bm: 'Angkat Mati Romania DB' },
                equipment: 'basic',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['hamstrings', 'glutes', 'back'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '90s',
                progression: []
            },
            {
                id: 'db-bulgarian-split-squat',
                name: { en: 'Bulgarian Split Squat', bm: 'Cangkung Split Bulgaria' },
                equipment: 'basic',
                difficulty: 'advanced',
                tier: 'premium',
                muscleGroups: ['quads', 'glutes'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '6 each', intermediate: '8 each', advanced: '10 each' },
                rest: '90s',
                progression: []
            },
            {
                id: 'barbell-squat',
                name: { en: 'Barbell Back Squat', bm: 'Cangkung Belakang Barbell' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['quads', 'glutes', 'hamstrings'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '8-10', intermediate: '6-10', advanced: '4-8' },
                rest: '180s',
                progression: []
            },
            {
                id: 'leg-press',
                name: { en: 'Leg Press', bm: 'Tekan Kaki' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['quads', 'glutes'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '10-12', advanced: '8-12' },
                rest: '90s',
                progression: []
            },
            {
                id: 'leg-curl',
                name: { en: 'Leg Curl', bm: 'Curl Kaki' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['hamstrings'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '10-12', advanced: '10-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'leg-extension',
                name: { en: 'Leg Extension', bm: 'Ekstensi Kaki' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['quads'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'calf-raise-machine',
                name: { en: 'Calf Raise Machine', bm: 'Mesin Angkat Betis' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['calves'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '12-15', intermediate: '15-20', advanced: '15-20' },
                rest: '45s',
                progression: []
            }
        ],

        // ──── ARMS (BICEPS + TRICEPS) ────
        arms: [
            {
                id: 'diamond-push-up',
                name: { en: 'Diamond Push-ups', bm: 'Tekan Tubi Berlian' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['triceps', 'chest'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '6-8', intermediate: '10-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'tricep-dip-bench',
                name: { en: 'Bench Tricep Dips', bm: 'Dip Trisep Bangku' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['triceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '12-15', advanced: '15-20' },
                rest: '60s',
                progression: []
            },
            {
                id: 'db-bicep-curl',
                name: { en: 'Dumbbell Bicep Curl', bm: 'Curl Bisep Dumbbell' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['biceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '60s',
                progression: []
            },
            {
                id: 'db-hammer-curl',
                name: { en: 'Hammer Curls', bm: 'Curl Tukul' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['biceps', 'forearms'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '60s',
                progression: []
            },
            {
                id: 'db-tricep-extension',
                name: { en: 'Overhead Tricep Extension', bm: 'Ekstensi Trisep Atas' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['triceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '60s',
                progression: []
            },
            {
                id: 'db-concentration-curl',
                name: { en: 'Concentration Curl', bm: 'Curl Konsentrasi' },
                equipment: 'basic',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['biceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 3 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '45s',
                progression: []
            },
            {
                id: 'barbell-curl',
                name: { en: 'Barbell Curl', bm: 'Curl Barbell' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['biceps'],
                sets: { beginner: 3, intermediate: 4, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '8-12', advanced: '8-12' },
                rest: '60s',
                progression: []
            },
            {
                id: 'cable-tricep-pushdown',
                name: { en: 'Cable Tricep Pushdown', bm: 'Tolak Trisep Kabel' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['triceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10-12', intermediate: '12-15', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'preacher-curl',
                name: { en: 'Preacher Curl', bm: 'Curl Preacher' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['biceps'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '10-12' },
                rest: '60s',
                progression: []
            }
        ],

        // ──── CORE ────
        core: [
            {
                id: 'plank',
                name: { en: 'Plank', bm: 'Plank' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '20s hold', intermediate: '30s hold', advanced: '60s hold' },
                rest: '45s',
                progression: []
            },
            {
                id: 'crunches',
                name: { en: 'Crunches', bm: 'Crunches' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '12-15', intermediate: '15-20', advanced: '20-25' },
                rest: '30s',
                progression: []
            },
            {
                id: 'mountain-climbers',
                name: { en: 'Mountain Climbers', bm: 'Pendaki Gunung' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['core', 'shoulders'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '20s', intermediate: '30s', advanced: '45s' },
                rest: '30s',
                progression: []
            },
            {
                id: 'bicycle-crunch',
                name: { en: 'Bicycle Crunches', bm: 'Crunch Basikal' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10 each', intermediate: '15 each', advanced: '20 each' },
                rest: '30s',
                progression: []
            },
            {
                id: 'leg-raise',
                name: { en: 'Leg Raises', bm: 'Angkat Kaki' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '8-10', intermediate: '12-15', advanced: '15-20' },
                rest: '45s',
                progression: []
            },
            {
                id: 'russian-twist',
                name: { en: 'Russian Twist', bm: 'Pusing Rusia' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10 each', intermediate: '15 each', advanced: '20 each' },
                rest: '30s',
                progression: []
            },
            {
                id: 'ab-rollout',
                name: { en: 'Ab Rollout', bm: 'Rollout Ab' },
                equipment: 'basic',
                difficulty: 'advanced',
                tier: 'premium',
                muscleGroups: ['core'],
                sets: { beginner: 2, intermediate: 3, advanced: 4 },
                reps: { beginner: '5-8', intermediate: '8-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'hanging-leg-raise',
                name: { en: 'Hanging Leg Raise', bm: 'Angkat Kaki Bergantung' },
                equipment: 'gym',
                difficulty: 'advanced',
                tier: 'premium',
                muscleGroups: ['core'],
                sets: { beginner: 2, intermediate: 3, advanced: 4 },
                reps: { beginner: '5-8', intermediate: '8-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'cable-woodchop',
                name: { en: 'Cable Woodchop', bm: 'Potong Kayu Kabel' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '10 each', intermediate: '12 each', advanced: '15 each' },
                rest: '45s',
                progression: []
            }
        ],

        // ──── CARDIO ────
        cardio: [
            {
                id: 'jumping-jacks',
                name: { en: 'Jumping Jacks', bm: 'Lompat Bintang' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['cardio'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '30s', intermediate: '45s', advanced: '60s' },
                rest: '30s',
                progression: []
            },
            {
                id: 'high-knees',
                name: { en: 'High Knees', bm: 'Lutut Tinggi' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['cardio', 'core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '20s', intermediate: '30s', advanced: '45s' },
                rest: '30s',
                progression: []
            },
            {
                id: 'burpees',
                name: { en: 'Burpees', bm: 'Burpees' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'free',
                muscleGroups: ['cardio', 'chest', 'core'],
                sets: { beginner: 3, intermediate: 3, advanced: 4 },
                reps: { beginner: '5-8', intermediate: '10-12', advanced: '12-15' },
                rest: '60s',
                progression: []
            },
            {
                id: 'jump-rope',
                name: { en: 'Jump Rope', bm: 'Lompat Tali' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['cardio', 'calves'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '30s', intermediate: '60s', advanced: '90s' },
                rest: '30s',
                progression: []
            },
            {
                id: 'kettlebell-swing',
                name: { en: 'Kettlebell Swings', bm: 'Hayunan Kettlebell' },
                equipment: 'basic',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['cardio', 'glutes', 'hamstrings'],
                sets: { beginner: 3, intermediate: 4, advanced: 5 },
                reps: { beginner: '10-12', intermediate: '15-20', advanced: '20-25' },
                rest: '45s',
                progression: []
            },
            {
                id: 'treadmill',
                name: { en: 'Treadmill Run', bm: 'Lari Treadmill' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'free',
                muscleGroups: ['cardio'],
                sets: { beginner: 1, intermediate: 1, advanced: 1 },
                reps: { beginner: '15 min', intermediate: '25 min', advanced: '35 min' },
                rest: '-',
                progression: []
            },
            {
                id: 'rowing-machine',
                name: { en: 'Rowing Machine', bm: 'Mesin Mendayung' },
                equipment: 'gym',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['cardio', 'back'],
                sets: { beginner: 1, intermediate: 1, advanced: 1 },
                reps: { beginner: '10 min', intermediate: '15 min', advanced: '20 min' },
                rest: '-',
                progression: []
            },
            {
                id: 'stair-climber',
                name: { en: 'Stair Climber', bm: 'Mesin Tangga' },
                equipment: 'gym',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['cardio', 'quads', 'glutes'],
                sets: { beginner: 1, intermediate: 1, advanced: 1 },
                reps: { beginner: '10 min', intermediate: '15 min', advanced: '20 min' },
                rest: '-',
                progression: []
            }
        ],

        // ──── MOBILITY / FLEXIBILITY (Premium) ────
        mobility: [
            {
                id: 'cat-cow',
                name: { en: 'Cat-Cow Stretch', bm: 'Regangan Kucing-Lembu' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['back', 'core'],
                sets: { beginner: 2, intermediate: 3, advanced: 3 },
                reps: { beginner: '8-10', intermediate: '10-12', advanced: '12-15' },
                rest: '30s',
                progression: []
            },
            {
                id: 'hip-flexor-stretch',
                name: { en: 'Hip Flexor Stretch', bm: 'Regangan Fleksor Pinggul' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['legs'],
                sets: { beginner: 2, intermediate: 2, advanced: 3 },
                reps: { beginner: '30s each', intermediate: '30s each', advanced: '45s each' },
                rest: '15s',
                progression: []
            },
            {
                id: 'thoracic-rotation',
                name: { en: 'Thoracic Rotation', bm: 'Putaran Torasik' },
                equipment: 'none',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['back', 'core'],
                sets: { beginner: 2, intermediate: 3, advanced: 3 },
                reps: { beginner: '8 each', intermediate: '10 each', advanced: '12 each' },
                rest: '15s',
                progression: []
            },
            {
                id: 'pigeon-pose',
                name: { en: 'Pigeon Pose', bm: 'Pose Merpati' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['glutes', 'legs'],
                sets: { beginner: 2, intermediate: 2, advanced: 3 },
                reps: { beginner: '30s each', intermediate: '45s each', advanced: '60s each' },
                rest: '15s',
                progression: []
            },
            {
                id: 'foam-rolling',
                name: { en: 'Foam Rolling Session', bm: 'Sesi Gulung Busa' },
                equipment: 'basic',
                difficulty: 'beginner',
                tier: 'premium',
                muscleGroups: ['back', 'legs'],
                sets: { beginner: 1, intermediate: 1, advanced: 1 },
                reps: { beginner: '10 min', intermediate: '15 min', advanced: '15 min' },
                rest: '-',
                progression: []
            },
            {
                id: 'yoga-flow',
                name: { en: 'Yoga Flow', bm: 'Aliran Yoga' },
                equipment: 'none',
                difficulty: 'intermediate',
                tier: 'premium',
                muscleGroups: ['back', 'core', 'legs', 'shoulders'],
                sets: { beginner: 1, intermediate: 1, advanced: 1 },
                reps: { beginner: '10 min', intermediate: '15 min', advanced: '20 min' },
                rest: '-',
                progression: []
            }
        ]
    },

    // === HELPER METHODS ===

    // Get exercises filtered by equipment, tier, and difficulty
    getExercises: function(muscleGroup, equipment, tier, fitnessLevel) {
        const allExercises = this.exercises[muscleGroup] || [];
        return allExercises.filter(ex => {
            const equipmentMatch = ex.equipment === 'none' || ex.equipment === equipment || 
                                   (equipment === 'gym' && (ex.equipment === 'basic' || ex.equipment === 'none')) ||
                                   (equipment === 'basic' && ex.equipment === 'none');
            const tierMatch = tier === 'premium' || ex.tier === 'free';
            const difficultyMatch = this._difficultyAllowed(ex.difficulty, fitnessLevel);
            return equipmentMatch && tierMatch && difficultyMatch;
        });
    },

    _difficultyAllowed: function(exerciseDifficulty, userLevel) {
        const levels = { beginner: 0, intermediate: 1, advanced: 2 };
        const exLevel = levels[exerciseDifficulty] || 0;
        const userLevelNum = levels[userLevel] || 0;
        // Allow exercises at or below user's level, plus one level above
        return exLevel <= userLevelNum + 1;
    },

    // Pick N random exercises from a filtered list
    pickRandom: function(exercises, count) {
        const shuffled = [...exercises].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    // Generate a full workout plan
    generatePlan: function(options) {
        const { duration, equipment, split, fitnessLevel, goal, tier } = options;
        const tierConfig = this.tiers[tier] || this.tiers.free;
        const splitConfig = this.splits[split] || this.splits['full-body'];
        const maxExercises = tierConfig.maxExercisesPerDay;
        const plan = [];

        for (let day = 1; day <= duration; day++) {
            const weekDay = (day - 1) % 7;
            const scheduleType = splitConfig.schedule[weekDay];

            // Deload week (every 4th week for premium)
            const isDeloadWeek = tierConfig.deloadWeeks && Math.ceil(day / 7) % 4 === 0;

            // Rest day
            if (scheduleType === 'rest') {
                const restDay = {
                    day: day,
                    name: `Day ${day}`,
                    focus: 'Rest',
                    focusKey: 'rest',
                    isRest: true,
                    isDeload: isDeloadWeek,
                    exercises: []
                };
                // Premium: add mobility on rest days
                if (tierConfig.mobilityWorkouts) {
                    const mobilityExercises = this.getExercises('mobility', equipment, tier, fitnessLevel);
                    const picked = this.pickRandom(mobilityExercises, 4);
                    restDay.exercises = picked.map(ex => this._formatExercise(ex, fitnessLevel, isDeloadWeek));
                    restDay.focus = 'Active Recovery';
                    restDay.focusKey = 'mobility';
                }
                plan.push(restDay);
                continue;
            }

            // Determine muscle groups for this day
            let muscleGroups = [];
            let focusName = '';

            if (split === 'full-body') {
                muscleGroups = ['chest', 'back', 'shoulders', 'legs', 'core'];
                focusName = 'Full Body';
            } else if (typeof splitConfig.muscleGroups === 'object' && !Array.isArray(splitConfig.muscleGroups)) {
                muscleGroups = splitConfig.muscleGroups[scheduleType] || ['chest', 'back', 'legs'];
                focusName = scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1);
            } else {
                muscleGroups = splitConfig.muscleGroups;
                focusName = 'Workout';
            }

            // Add cardio based on goal
            if (goal === 'lose-weight' || goal === 'endurance' || goal === 'get-fit') {
                if (!muscleGroups.includes('cardio')) {
                    muscleGroups.push('cardio');
                }
            }

            // Collect exercises
            let dayExercises = [];
            const exercisesPerGroup = Math.max(1, Math.floor(maxExercises / muscleGroups.length));

            muscleGroups.forEach(mg => {
                // Map sub-groups to main exercise categories
                const mappedGroup = this._mapMuscleGroup(mg);
                const available = this.getExercises(mappedGroup, equipment, tier, fitnessLevel);
                const picked = this.pickRandom(available, exercisesPerGroup);
                dayExercises = dayExercises.concat(picked);
            });

            // Trim to max
            dayExercises = dayExercises.slice(0, maxExercises);

            plan.push({
                day: day,
                name: `Day ${day}`,
                focus: focusName,
                focusKey: scheduleType,
                isRest: false,
                isDeload: isDeloadWeek,
                exercises: dayExercises.map(ex => this._formatExercise(ex, fitnessLevel, isDeloadWeek))
            });
        }

        return plan;
    },

    _mapMuscleGroup: function(mg) {
        const mapping = {
            'chest': 'chest',
            'back': 'back',
            'shoulders': 'shoulders',
            'rear-delts': 'shoulders',
            'traps': 'shoulders',
            'legs': 'legs',
            'quads': 'legs',
            'hamstrings': 'legs',
            'glutes': 'legs',
            'calves': 'legs',
            'biceps': 'arms',
            'triceps': 'arms',
            'forearms': 'arms',
            'core': 'core',
            'cardio': 'cardio',
            'mobility': 'mobility'
        };
        return mapping[mg] || mg;
    },

    _formatExercise: function(exercise, fitnessLevel, isDeload) {
        const level = fitnessLevel || 'beginner';
        let sets = exercise.sets[level] || exercise.sets.beginner;
        let reps = exercise.reps[level] || exercise.reps.beginner;
        let rest = exercise.rest;

        // Deload: reduce sets and intensity
        if (isDeload) {
            sets = Math.max(2, sets - 1);
            rest = '90s';
        }

        return {
            id: exercise.id,
            name: exercise.name,
            sets: sets,
            reps: reps,
            rest: rest,
            equipment: exercise.equipment,
            tier: exercise.tier,
            muscleGroups: exercise.muscleGroups,
            difficulty: exercise.difficulty
        };
    },

    // Get available splits for a tier
    getAvailableSplits: function(tier) {
        const allowedSplits = this.tiers[tier]?.maxSplits || ['full-body'];
        const result = {};
        allowedSplits.forEach(splitKey => {
            if (this.splits[splitKey]) {
                result[splitKey] = this.splits[splitKey];
            }
        });
        return result;
    },

    // Count exercises available per tier
    getExerciseCount: function(tier) {
        let count = 0;
        Object.keys(this.exercises).forEach(group => {
            this.exercises[group].forEach(ex => {
                if (tier === 'premium' || ex.tier === 'free') {
                    count++;
                }
            });
        });
        return count;
    }
};
