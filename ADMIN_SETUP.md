# Admin Panel Setup Guide

This guide will help you set up the admin panel functionality for your Django project with Bootstrap and Firestore.

## Features

- **Admin Login**: Secure authentication using Firebase Auth
- **Admin Dashboard**: Overview with statistics and recent activity
- **User Management**: Add, view, edit, and delete users
- **Post Management**: Create and manage posts
- **Settings**: Configure site settings
- **Responsive Design**: Mobile-friendly Bootstrap interface
- **Real-time Data**: Firestore integration for live data updates

## Prerequisites

1. Django project running
2. Firebase account (free)
3. Modern web browser

## Setup Instructions

### 1. Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or "Add project"
   - Enter project name (e.g., "my-django-admin")
   - Enable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**:
   - In Firebase Console, go to "Authentication" > "Sign-in method"
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

3. **Create Firestore Database**:
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to your users)
   - Click "Done"

4. **Get Firebase Configuration**:
   - Go to Project Settings (gear icon) > "General" tab
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web (</>) icon
   - Register your app with a nickname
   - Copy the `firebaseConfig` object

5. **Update Configuration**:
   - Open `static/js/firebase-config.js`
   - Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "your-actual-app-id"
};
```

### 2. Create Admin User

1. **Start your Django server**:
   ```bash
   python manage.py runserver
   ```

2. **Navigate to admin login**:
   - Go to `http://localhost:8000/admin/login/`
   - The system will automatically create demo data including an admin user

3. **Login with demo credentials**:
   - Email: `admin@example.com`
   - Password: `admin123`

### 3. Test the Admin Panel

1. **Login Process**:
   - Enter the demo credentials
   - Click "Login"
   - You should be redirected to the dashboard

2. **Dashboard Features**:
   - View statistics (users, posts, active users, visits)
   - Navigate between different sections
   - Check recent activity

3. **User Management**:
   - Click on "Users" in the sidebar
   - View existing users
   - Add new users using the "Add User" button
   - Edit or delete users

4. **Post Management**:
   - Click on "Posts" in the sidebar
   - View existing posts
   - Add new posts using the "Add Post" button
   - Edit or delete posts

5. **Settings**:
   - Click on "Settings" in the sidebar
   - Modify site settings
   - Save changes

## File Structure

```
your-project/
├── templates/
│   ├── base.html              # Updated with Bootstrap and Firebase
│   ├── admin_login.html       # Admin login page
│   └── admin_dashboard.html   # Admin dashboard
├── static/
│   ├── css/
│   │   └── styles.css         # Enhanced with admin styles
│   └── js/
│       ├── admin.js           # Admin functionality
│       └── firebase-config.js # Firebase configuration
├── pages/
│   ├── views.py               # Updated with admin views
│   └── urls.py                # Updated with admin URLs
└── ADMIN_SETUP.md             # This file
```

## URLs

- **Home**: `/`
- **About**: `/about/`
- **Contact**: `/contact/`
- **Admin Login**: `/admin/login/`
- **Admin Dashboard**: `/admin/dashboard/`

## Security Notes

1. **Firebase Security Rules**: For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. **Admin Access**: Only users with `role: 'admin'` can access the admin panel

3. **Environment Variables**: For production, consider using environment variables for Firebase config

## Troubleshooting

### Common Issues

1. **Firebase not initialized**:
   - Check that `firebase-config.js` has correct configuration
   - Ensure Firebase SDK is loaded before admin.js

2. **Authentication not working**:
   - Verify Email/Password is enabled in Firebase Console
   - Check browser console for errors

3. **Data not loading**:
   - Ensure Firestore database is created
   - Check Firestore security rules
   - Verify user has admin role

4. **Styling issues**:
   - Ensure Bootstrap CSS is loaded
   - Check that custom CSS is loaded after Bootstrap

### Debug Mode

To enable debug logging, open browser console and look for:
- Firebase initialization messages
- Authentication state changes
- Firestore operations
- Error messages

## Customization

### Adding New Features

1. **New Admin Section**:
   - Add navigation item in `admin_dashboard.html`
   - Create corresponding section div
   - Add JavaScript function to handle the section
   - Update `showSection()` function

2. **New Data Collections**:
   - Create new Firestore collections
   - Add corresponding JavaScript functions
   - Update dashboard statistics

3. **Styling**:
   - Modify `static/css/styles.css`
   - Add custom Bootstrap classes
   - Use CSS variables for consistent theming

## Production Deployment

1. **Update Firebase Security Rules**
2. **Use environment variables for configuration**
3. **Enable Firebase App Check for additional security**
4. **Set up proper error monitoring**
5. **Configure Firebase hosting (optional)**

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure all dependencies are loaded
4. Check Firestore security rules

## Demo Data

The system automatically creates demo data including:
- Admin user (admin@example.com / admin123)
- Sample users
- Sample posts
- Default settings

This data is created only once and can be modified through the admin interface.
