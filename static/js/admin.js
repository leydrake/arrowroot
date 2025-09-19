// Firebase Configuration will be loaded from firebase-config.js

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const auth = firebase.auth();

// Global variables
let currentUser = null;
let usersCollection = db.collection('users');
let postsCollection = db.collection('posts');
let settingsCollection = db.collection('settings');

// Initialize admin functionality
document.addEventListener('DOMContentLoaded', function() {
   
    // Check if user is on admin pages
    if (window.location.pathname.includes('/admin/')) {
        initializeAdmin();
    }
    
    // Check authentication state
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            updateUIForLoggedInUser();
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    });
});

// Initialize admin functionality
function initializeAdmin() {
    // Setup admin login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    

    
    // Setup dashboard navigation
    setupDashboardNavigation();
    
    // Load dashboard data if on dashboard page
    if (window.location.pathname.includes('/admin/dashboard/')) {
        loadDashboardData();
    }
}

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    // Show loading state
    loginBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if user is admin
        const userDoc = await usersCollection.doc(user.uid).get();
        if (userDoc.exists && userDoc.data().role === 'admin') {
            showAlert('success', 'Login successful! Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = '/admin/dashboard/';
            }, 1500);
        } else {
            // User is not admin, sign them out
            await auth.signOut();
            showAlert('danger', 'Access denied. Admin privileges required.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('danger', 'Login failed: ' + error.message);
    } finally {
        // Reset button state
        loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
        loginBtn.disabled = false;
    }
}



// Setup dashboard navigation
function setupDashboardNavigation() {
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Load section-specific data
        switch(sectionName) {
            case 'users':
                loadUsers();
                break;
            case 'posts':
                loadPosts();
                break;
            case 'settings':
                loadSettings();
                break;
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load statistics
        await loadStatistics();
        
        // Load recent activity
        await loadRecentActivity();
        
        // Update admin name
        if (currentUser) {
            const userDoc = await usersCollection.doc(currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const adminNameElement = document.getElementById('adminName');
                if (adminNameElement) {
                    adminNameElement.textContent = userData.name || userData.email;
                }
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load statistics
async function loadStatistics() {
    try {
        // Load users count
        const usersSnapshot = await usersCollection.get();
        const totalUsers = usersSnapshot.size;
        document.getElementById('totalUsers').textContent = totalUsers;
        
        // Load posts count
        const postsSnapshot = await postsCollection.get();
        const totalPosts = postsSnapshot.size;
        document.getElementById('totalPosts').textContent = totalPosts;
        
        // Calculate active users (users with recent activity)
        const activeUsers = usersSnapshot.docs.filter(doc => {
            const data = doc.data();
            const lastActive = data.lastActive?.toDate();
            if (lastActive) {
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return lastActive > oneDayAgo;
            }
            return false;
        }).length;
        document.getElementById('activeUsers').textContent = activeUsers;
        
        // Today's visits (mock data for demo)
        document.getElementById('todayVisits').textContent = Math.floor(Math.random() * 100) + 50;
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;
        
        // Get recent users
        const usersSnapshot = await usersCollection
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        let activityHTML = '';
        if (usersSnapshot.empty) {
            activityHTML = '<p class="text-muted">No recent activity</p>';
        } else {
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate() || new Date();
                activityHTML += `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div>
                            <strong>${data.name || 'Unknown User'}</strong> joined
                            <small class="text-muted">${createdAt.toLocaleDateString()}</small>
                        </div>
                        <span class="badge bg-primary">${data.role || 'user'}</span>
                    </div>
                `;
            });
        }
        
        recentActivity.innerHTML = activityHTML;
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;
        
        const usersSnapshot = await usersCollection.get();
        
        if (usersSnapshot.empty) {
            usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
            return;
        }
        
        let usersHTML = '';
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate() || new Date();
            const statusClass = data.status === 'active' ? 'success' : 'secondary';
            
            usersHTML += `
                <tr>
                    <td>${data.name || 'Unknown'}</td>
                    <td>${data.email || 'No email'}</td>
                    <td><span class="badge bg-primary">${data.role || 'user'}</span></td>
                    <td><span class="badge bg-${statusClass}">${data.status || 'inactive'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editUser('${doc.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${doc.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        usersTableBody.innerHTML = usersHTML;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load posts
async function loadPosts() {
    try {
        const postsTableBody = document.getElementById('postsTableBody');
        if (!postsTableBody) return;
        
        const postsSnapshot = await postsCollection.get();
        
        if (postsSnapshot.empty) {
            postsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No posts found</td></tr>';
            return;
        }
        
        let postsHTML = '';
        postsSnapshot.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate() || new Date();
            const statusClass = data.status === 'published' ? 'success' : 'warning';
            
            postsHTML += `
                <tr>
                    <td>${data.title || 'Untitled'}</td>
                    <td>${data.author || 'Unknown'}</td>
                    <td><span class="badge bg-${statusClass}">${data.status || 'draft'}</span></td>
                    <td>${createdAt.toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editPost('${doc.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePost('${doc.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        postsTableBody.innerHTML = postsHTML;
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Load settings
async function loadSettings() {
    try {
        const settingsDoc = await settingsCollection.doc('main').get();
        if (settingsDoc.exists) {
            const data = settingsDoc.data();
            document.getElementById('siteName').value = data.siteName || 'My Site';
            document.getElementById('siteDescription').value = data.siteDescription || '';
            document.getElementById('maintenanceMode').checked = data.maintenanceMode || false;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Add user
function addUser() {
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

// Save user
async function saveUser() {
    try {
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await usersCollection.add(userData);
        
        showAlert('success', 'User added successfully!');
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
        document.getElementById('addUserForm').reset();
        
        // Reload users if on users section
        if (document.getElementById('users').style.display !== 'none') {
            loadUsers();
        }
        
    } catch (error) {
        console.error('Error saving user:', error);
        showAlert('danger', 'Error saving user: ' + error.message);
    }
}

// Add post
function addPost() {
    const modal = new bootstrap.Modal(document.getElementById('addPostModal'));
    modal.show();
}

// Save post
async function savePost() {
    try {
        const postData = {
            title: document.getElementById('postTitle').value,
            content: document.getElementById('postContent').value,
            status: document.getElementById('postStatus').value,
            author: currentUser ? currentUser.email : 'Admin',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await postsCollection.add(postData);
        
        showAlert('success', 'Post added successfully!');
        bootstrap.Modal.getInstance(document.getElementById('addPostModal')).hide();
        document.getElementById('addPostForm').reset();
        
        // Reload posts if on posts section
        if (document.getElementById('posts').style.display !== 'none') {
            loadPosts();
        }
        
    } catch (error) {
        console.error('Error saving post:', error);
        showAlert('danger', 'Error saving post: ' + error.message);
    }
}

// Edit user
function editUser(userId) {
    showAlert('info', 'Edit user functionality coming soon!');
}

// Delete user
async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await usersCollection.doc(userId).delete();
            showAlert('success', 'User deleted successfully!');
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert('danger', 'Error deleting user: ' + error.message);
        }
    }
}

// Edit post
function editPost(postId) {
    showAlert('info', 'Edit post functionality coming soon!');
}

// Delete post
async function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            await postsCollection.doc(postId).delete();
            showAlert('success', 'Post deleted successfully!');
            loadPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            showAlert('danger', 'Error deleting post: ' + error.message);
        }
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
    auth.signOut().then(() => {
        showAlert('success', 'Logged out successfully!');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }).catch((error) => {
        console.error('Logout error:', error);
        showAlert('danger', 'Logout failed: ' + error.message);
    });
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

// Initialize demo data
async function initializeDemoData() {
    try {
        // Check if demo data already exists
        const usersSnapshot = await usersCollection.limit(1).get();
        if (!usersSnapshot.empty) {
            return; // Demo data already exists
        }
        
        // Create demo admin user
        const adminUser = {
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await usersCollection.add(adminUser);
        
        // Create demo regular users
        const demoUsers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'user',
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'moderator',
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const user of demoUsers) {
            await usersCollection.add(user);
        }
        
        // Create demo posts
        const demoPosts = [
            {
                title: 'Welcome to Our Site',
                content: 'This is the first post on our new platform. We are excited to share this with you!',
                status: 'published',
                author: 'admin@example.com',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                title: 'Getting Started Guide',
                content: 'Here is a comprehensive guide to help you get started with our platform.',
                status: 'published',
                author: 'admin@example.com',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                title: 'Draft Post',
                content: 'This is a draft post that is not yet published.',
                status: 'draft',
                author: 'admin@example.com',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const post of demoPosts) {
            await postsCollection.add(post);
        }
        
        // Create default settings
        const defaultSettings = {
            siteName: 'My Site',
            siteDescription: 'A simple Django site with admin functionality',
            maintenanceMode: false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await settingsCollection.doc('main').set(defaultSettings);
        
        console.log('Demo data initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing demo data:', error);
    }
}

// Initialize demo data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize demo data if we're on the admin login page
    if (window.location.pathname.includes('/admin/login/')) {
        initializeDemoData();
    }
});
