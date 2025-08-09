import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

const LoginButton = () => {
  const { currentUser, isAdmin } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentUser ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Welcome, {currentUser.displayName || currentUser.email}
          </span>
          {isAdmin && (
            <a 
              href="/admin" 
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Admin
            </a>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleGoogleLogin}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 0-10 10c0 4.97 4.03 9 9 9l1-4h-4v-2h6.5l-1-2H8v-2h4.5l1-2H8V8h6l1-2H6.5A10 10 0 0 0 12 2Z"/>
          </svg>
          Login with Google
        </button>
      )}
    </div>
  );
};

export default LoginButton;