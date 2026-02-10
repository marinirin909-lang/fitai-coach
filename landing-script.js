// Modal Functions
function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showSignupModal() {
    document.getElementById('signup-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
    document.getElementById('signup-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function switchToSignup() {
    closeLoginModal();
    showSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    showLoginModal();
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading
    const loginBtn = event.target.querySelector('button[type="submit"]');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
    }
    
    // Use Firebase login
    const result = await firebaseLogin(email, password);
    
    if (result.success) {
        // Redirect to main app
        window.location.href = 'index.html';
    } else {
        alert('Login failed: ' + (result.error || 'Please check your credentials'));
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }
}

// Handle Signup
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validation
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!termsAccepted) {
        alert('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Show loading
    const signupBtn = event.target.querySelector('button[type="submit"]');
    if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating account...';
    }
    
    // Use Firebase signup
    const result = await firebaseSignup(name, email, password);
    
    if (result.success) {
        // Show success message
        alert('Account created successfully! Welcome to FitAI Coach 🎉');
        
        // Redirect to main app
        window.location.href = 'index.html';
    } else {
        alert('Signup failed: ' + (result.error || 'Please try again'));
        if (signupBtn) {
            signupBtn.disabled = false;
            signupBtn.textContent = 'Create Account';
        }
    }
}

// Social Login Functions
async function loginWithGoogle() {
    const result = await signInWithGoogle();
    if (result.success) {
        window.location.href = 'index.html';
    } else {
        alert('Google Sign-In failed: ' + (result.error || 'Please try again'));
    }
}

async function signupWithGoogle() {
    const result = await signInWithGoogle();
    if (result.success) {
        alert('Welcome to FitAI Coach! 🎉');
        window.location.href = 'index.html';
    } else {
        alert('Google Sign-Up failed: ' + (result.error || 'Please try again'));
    }
}

// Smooth Scroll
function scrollToDemo() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.right = '20px';
        navLinks.style.background = 'white';
        navLinks.style.padding = '20px';
        navLinks.style.borderRadius = '12px';
        navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        navLinks.style.zIndex = '1000';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === signupModal) {
        closeSignupModal();
    }
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
        closeSignupModal();
    }
});

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'light') {
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
    }
    
    localStorage.setItem('theme', newTheme);
}

// Initialize Firebase on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    initializeFirebase();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
    
    // Check if user is already logged in
    onAuthStateChanged(function(user) {
        if (user) {
            // User is logged in, update nav buttons
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                const loginBtn = navLinks.querySelector('.btn-nav-login');
                const signupBtn = navLinks.querySelector('.btn-nav-signup');
                
                if (loginBtn) {
                    loginBtn.textContent = 'Dashboard';
                    loginBtn.onclick = function() {
                        window.location.href = 'index.html';
                    };
                }
                
                if (signupBtn) {
                    signupBtn.textContent = 'Go to App';
                    signupBtn.onclick = function() {
                        window.location.href = 'index.html';
                    };
                }
            }
        }
    });
    
    const userSession = localStorage.getItem('userSession');
    
    if (userSession) {
        try {
            const session = JSON.parse(userSession);
            if (session.isLoggedIn) {
                // User is already logged in, update nav buttons
                const navLinks = document.querySelector('.nav-links');
                if (navLinks) {
                    const loginBtn = navLinks.querySelector('.btn-nav-login');
                    const signupBtn = navLinks.querySelector('.btn-nav-signup');
                    
                    if (loginBtn) {
                        loginBtn.textContent = 'Dashboard';
                        loginBtn.onclick = function() {
                            window.location.href = 'index.html';
                        };
                    }
                    
                    if (signupBtn) {
                        signupBtn.textContent = 'Go to App';
                        signupBtn.onclick = function() {
                            window.location.href = 'index.html';
                        };
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing user session:', error);
        }
    }
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all feature boxes and cards
    document.querySelectorAll('.feature-box, .step-card, .pricing-box, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData) {
    console.log('Event tracked:', eventName, eventData);
    // In production, integrate with Google Analytics, Facebook Pixel, etc.
    // gtag('event', eventName, eventData);
}

// Track button clicks
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-primary-large') || 
        event.target.classList.contains('btn-nav-signup')) {
        trackEvent('signup_button_click', {
            button_location: event.target.textContent
        });
    }
    
    if (event.target.classList.contains('btn-nav-login')) {
        trackEvent('login_button_click', {
            button_location: 'navbar'
        });
    }
});
