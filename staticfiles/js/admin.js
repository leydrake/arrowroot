// Firebase Configuration will be loaded from firebase-config.js

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Global variables
let currentUser = null;

// Initialize admin functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup admin login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Initialize admin credentials
    initializeAdminCredentials();
});

// Handle admin login (Firestore-only)
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('floatingInput').value;
    const password = document.getElementById('floatingPassword').value;
    const loginBtn = document.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Check credentials against Firestore
        const credentialsDoc = await db.collection('admin_credentials').doc('admin_credentials').get();
        
        if (credentialsDoc.exists) {
            const credentials = credentialsDoc.data();
            
            if (credentials.email === email && credentials.password === password) {
                // Login successful
                currentUser = {
                    email: email,
                    role: 'admin',
                    name: 'Admin User'
                };
                
                // Store in sessionStorage
                sessionStorage.setItem('adminUser', JSON.stringify(currentUser));
                
            showAlert('success', 'Login successful! Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = '/admin/dashboard/';
            }, 1500);
        } else {
                showAlert('danger', 'Invalid email or password.');
            }
        } else {
            showAlert('danger', 'Admin credentials not found. Please contact administrator.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('danger', 'Login failed: ' + error.message);
    } finally {
        // Reset button state
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}




// Check if user is logged in
function checkLoginStatus() {
    const userData = sessionStorage.getItem('adminUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForLoggedInUser();
        return true;
    } else {
        currentUser = null;
        updateUIForLoggedOutUser();
        return false;
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const adminLink = document.getElementById('adminLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (adminLink) adminLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'block';
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const adminLink = document.getElementById('adminLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (adminLink) adminLink.style.display = 'block';
    if (logoutLink) logoutLink.style.display = 'none';
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminUser');
    currentUser = null;
    updateUIForLoggedOutUser();
    showAlert('success', 'Logged out successfully!');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Show alert
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// Initialize admin credentials (Firestore-only)
async function initializeAdminCredentials() {
    try {
        // Admin credentials
        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123';
        
        // Create admin credentials in the admin_credentials collection
        const adminCredentialsRef = db.collection('admin_credentials').doc('admin_credentials');
        
        // Check if credentials already exist
        const credentialsDoc = await adminCredentialsRef.get();
        
        if (!credentialsDoc.exists || !credentialsDoc.data().email) {
            // Add admin credentials to Firestore
            await adminCredentialsRef.set({
                email: adminEmail,
                password: adminPassword,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Admin credentials added to Firestore!');
            console.log('Email:', adminEmail);
            console.log('Password:', adminPassword);
        } else {
            console.log('ℹ️ Admin credentials already exist in Firestore');
        }
        
    } catch (error) {
        console.error('❌ Error initializing admin credentials:', error);
    }
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking login status...');
    checkLoginStatus();
});

// Manual function to add admin credentials (call this from browser console)
window.addAdminCredentials = async function() {
    console.log('Manually adding admin credentials...');
    try {
        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123';
        
        // Add admin credentials to Firestore
        const adminCredentialsRef = db.collection('admin_credentials').doc('admin_credentials');
        
        await adminCredentialsRef.set({
            email: adminEmail,
            password: adminPassword,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Admin credentials added successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        
        return true;
    } catch (error) {
        console.error('❌ Error adding admin credentials:', error);
        return false;
    }
};

// Test Firestore connection
window.testFirestore = async function() {
    console.log('🧪 Testing Firestore connection...');
    try {
        // Test Firestore connection
        const testDoc = await db.collection('test').doc('connection').set({
            test: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Firestore connection working!');
        
        return true;
    } catch (error) {
        console.error('❌ Firestore connection failed:', error);
        return false;
    }
};

// Test login function
window.testLogin = async function() {
    console.log('🔐 Testing login...');
    try {
        const credentialsDoc = await db.collection('admin_credentials').doc('admin_credentials').get();
        
        if (credentialsDoc.exists) {
            const credentials = credentialsDoc.data();
            console.log('✅ Credentials found in Firestore:');
            console.log('Email:', credentials.email);
            console.log('Password:', credentials.password);
            return true;
        } else {
            console.log('❌ No credentials found in Firestore');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing login:', error);
        return false;
    }
};

console.log('🔧 Manual functions available:');
console.log('  - addAdminCredentials() - Add admin credentials to Firestore');
console.log('  - testFirestore() - Test Firestore connection');
console.log('  - testLogin() - Test login credentials');
