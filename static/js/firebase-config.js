// Firebase Configuration
// IMPORTANT: Replace these with your actual Firebase project configuration
// You can get these values from your Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
    // Replace with your Firebase project configuration
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "your-app-id-here"
};

// Instructions for setting up Firebase:
/*
1. Go to https://console.firebase.google.com/
2. Create a new project or select an existing one
3. Go to Project Settings (gear icon) > General tab
4. Scroll down to "Your apps" section
5. Click "Add app" and select Web (</>) icon
6. Register your app with a nickname
7. Copy the config object and replace the values above
8. Enable Authentication in Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
9. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location for your database
10. Update the security rules for Firestore (optional for development):
    - Go to Firestore Database > Rules
    - Replace the rules with:
    
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow read/write access to authenticated users
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
*/

// Export the config for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
}
