# Zendalona Chatbot UI

This is the frontend for the Zendalona Chatbot application.

## Features

- Chat interface with accessibility options
- Admin panel for system management
- Firebase Google authentication
- Feedback system with user information

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a Firebase project at https://console.firebase.google.com/

3. Enable Google authentication in your Firebase project

4. Copy the Firebase configuration values and add them to the `.env` file:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

5. Update the admin email list in `src/contexts/AuthContext.jsx`:
   ```javascript
   const adminEmails = ['admin@yourdomain.com']; // Add your admin emails here
   ```

## Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Authentication

- Users can login with Google authentication
- Only authenticated users can submit feedback
- Only admin users can access the admin panel

## Feedback System

- Feedback is associated with the logged-in user
- User information (name, email) is stored with feedback
- Admins can view feedback along with user information