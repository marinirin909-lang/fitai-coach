// Firebase Firestore Database Functions
// This file handles all database operations with Firestore

// Save user profile data
async function saveUserProfile(userId, profileData) {
    try {
        if (!isFirebaseConfigured()) {
            localStorage.setItem('userData', JSON.stringify(profileData));
            return { success: true };
        }

        await db.collection('users').doc(userId).set(profileData, { merge: true });
        console.log('User profile saved to Firestore');
        return { success: true };
    } catch (error) {
        console.error('Error saving user profile:', error);
        return { success: false, error: error.message };
    }
}

// Load user profile data
async function loadUserProfile(userId) {
    try {
        if (!isFirebaseConfigured()) {
            const data = localStorage.getItem('userData');
            return data ? JSON.parse(data) : null;
        }

        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('Error loading user profile:', error);
        return null;
    }
}

// Save workout plan
async function saveWorkoutPlan(userId, workoutPlan) {
    try {
        if (!isFirebaseConfigured()) {
            localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
            return { success: true };
        }

        const planData = {
            userId: userId,
            plan: workoutPlan,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('workoutPlans').doc(userId).set(planData);
        console.log('Workout plan saved to Firestore');
        return { success: true };
    } catch (error) {
        console.error('Error saving workout plan:', error);
        return { success: false, error: error.message };
    }
}

// Load workout plan
async function loadWorkoutPlan(userId) {
    try {
        if (!isFirebaseConfigured()) {
            const data = localStorage.getItem('workoutPlan');
            return data ? JSON.parse(data) : null;
        }

        const doc = await db.collection('workoutPlans').doc(userId).get();
        if (doc.exists) {
            return doc.data().plan;
        }
        return null;
    } catch (error) {
        console.error('Error loading workout plan:', error);
        return null;
    }
}

// Save progress data
async function saveProgressData(userId, progressData) {
    try {
        if (!isFirebaseConfigured()) {
            localStorage.setItem('progressData', JSON.stringify(progressData));
            return { success: true };
        }

        await db.collection('progressData').doc(userId).set({
            userId: userId,
            data: progressData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('Progress data saved to Firestore');
        return { success: true };
    } catch (error) {
        console.error('Error saving progress data:', error);
        return { success: false, error: error.message };
    }
}

// Load progress data
async function loadProgressData(userId) {
    try {
        if (!isFirebaseConfigured()) {
            const data = localStorage.getItem('progressData');
            return data ? JSON.parse(data) : null;
        }

        const doc = await db.collection('progressData').doc(userId).get();
        if (doc.exists) {
            return doc.data().data;
        }
        return null;
    } catch (error) {
        console.error('Error loading progress data:', error);
        return null;
    }
}

// Save chat message
async function saveChatMessage(userId, message) {
    try {
        if (!isFirebaseConfigured()) {
            let chatHistory = localStorage.getItem('chatHistory');
            chatHistory = chatHistory ? JSON.parse(chatHistory) : [];
            chatHistory.push(message);
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            return { success: true };
        }

        await db.collection('chatHistory').doc(userId).collection('messages').add({
            ...message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Chat message saved to Firestore');
        return { success: true };
    } catch (error) {
        console.error('Error saving chat message:', error);
        return { success: false, error: error.message };
    }
}

// Load chat history
async function loadChatHistory(userId) {
    try {
        if (!isFirebaseConfigured()) {
            const data = localStorage.getItem('chatHistory');
            return data ? JSON.parse(data) : [];
        }

        const snapshot = await db.collection('chatHistory')
            .doc(userId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push(doc.data());
        });

        return messages;
    } catch (error) {
        console.error('Error loading chat history:', error);
        return [];
    }
}

// Update subscription status
async function updateSubscriptionStatus(userId, isPremium) {
    try {
        if (!isFirebaseConfigured()) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const data = JSON.parse(userData);
                data.isPremium = isPremium;
                localStorage.setItem('userData', JSON.stringify(data));
            }
            return { success: true };
        }

        await db.collection('users').doc(userId).update({
            isPremium: isPremium,
            subscriptionUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Subscription status updated');
        return { success: true };
    } catch (error) {
        console.error('Error updating subscription:', error);
        return { success: false, error: error.message };
    }
}

// Upload progress photo
async function uploadProgressPhoto(userId, file) {
    try {
        if (!isFirebaseConfigured()) {
            alert('Photo upload requires Firebase configuration.');
            return { success: false, error: 'Firebase not configured' };
        }

        const timestamp = Date.now();
        const storageRef = storage.ref(`users/${userId}/progress/${timestamp}_${file.name}`);
        
        const uploadTask = await storageRef.put(file);
        const downloadURL = await uploadTask.ref.getDownloadURL();

        await db.collection('progressPhotos').add({
            userId: userId,
            url: downloadURL,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Photo uploaded successfully');
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('Error uploading photo:', error);
        return { success: false, error: error.message };
    }
}

// Load progress photos
async function loadProgressPhotos(userId) {
    try {
        if (!isFirebaseConfigured()) {
            return [];
        }

        const snapshot = await db.collection('progressPhotos')
            .where('userId', '==', userId)
            .orderBy('uploadedAt', 'desc')
            .get();

        const photos = [];
        snapshot.forEach(doc => {
            photos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return photos;
    } catch (error) {
        console.error('Error loading photos:', error);
        return [];
    }
}

// Real-time listener for user data updates
function listenToUserData(userId, callback) {
    if (!isFirebaseConfigured()) {
        return null;
    }

    return db.collection('users').doc(userId).onSnapshot(doc => {
        if (doc.exists) {
            callback(doc.data());
        }
    }, error => {
        console.error('Error listening to user data:', error);
    });
}
