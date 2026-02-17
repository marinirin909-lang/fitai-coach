// Firebase Authentication Functions
// This file handles all authentication operations with Firebase

// Sign up with email and password
async function firebaseSignup(name, email, password) {
    try {
        if (!isFirebaseConfigured()) {
            return localStorageSignup(name, email, password);
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await user.updateProfile({
            displayName: name
        });

        const userData = {
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isPremium: false
        };

        await db.collection('users').doc(user.uid).set(userData);

        console.log('User created successfully:', user.uid);
        return { success: true, user: user };
    } catch (error) {
        console.error('Firebase signup error:', error);
        return { success: false, error: error.message };
    }
}

// Login with email and password
async function firebaseLogin(email, password) {
    try {
        if (!isFirebaseConfigured()) {
            return localStorageLogin(email, password);
        }

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('User logged in successfully:', user.uid);
        return { success: true, user: user };
    } catch (error) {
        console.error('Firebase login error:', error);
        return { success: false, error: error.message };
    }
}

// Logout
async function firebaseLogout() {
    try {
        if (!isFirebaseConfigured()) {
            localStorage.removeItem('userSession');
            return { success: true };
        }

        await auth.signOut();
        console.log('User logged out successfully');
        return { success: true };
    } catch (error) {
        console.error('Firebase logout error:', error);
        return { success: false, error: error.message };
    }
}

// Get current user
function getCurrentUser() {
    if (!isFirebaseConfigured()) {
        const session = localStorage.getItem('userSession');
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    return auth.currentUser;
}

// Check authentication state
function onAuthStateChanged(callback) {
    if (!isFirebaseConfigured()) {
        const session = localStorage.getItem('userSession');
        if (session) {
            try {
                const user = JSON.parse(session);
                callback(user);
            } catch (e) {
                callback(null);
            }
        } else {
            callback(null);
        }
        return;
    }

    auth.onAuthStateChanged(callback);
}

// LocalStorage fallback functions
function localStorageSignup(name, email, password) {
    const userData = {
        uid: 'local_' + Date.now(),
        name: name,
        email: email,
        isLoggedIn: true,
        signupDate: new Date().toISOString(),
        isPremium: false
    };

    localStorage.setItem('userSession', JSON.stringify(userData));
    localStorage.setItem('userData', JSON.stringify({
        name: name,
        email: email
    }));

    return { success: true, user: userData };
}

function localStorageLogin(email, password) {
    const userData = {
        uid: 'local_' + Date.now(),
        email: email,
        isLoggedIn: true,
        loginDate: new Date().toISOString()
    };

    localStorage.setItem('userSession', JSON.stringify(userData));
    return { success: true, user: userData };
}

// Google Sign-In
async function signInWithGoogle() {
    try {
        if (!isFirebaseConfigured()) {
            alert('Google Sign-In requires Firebase configuration. Please use email/password for now.');
            return { success: false };
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(user.uid).set({
                name: user.displayName,
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isPremium: false
            });
        }

        return { success: true, user: user };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: error.message };
    }
}
