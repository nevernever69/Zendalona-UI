import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      // Check if user is admin (you can customize this logic)
      // For now, we'll check if the email ends with a specific domain
      // or you can implement a more robust admin check
      if (user) {
        // Example: Check if user email is in admin list
        // You can replace this with your own logic
        const adminEmails = ['phanidathar@gmail.com','nevernever955@gmail.com', 'nfemina55@gmail.com', 'devikavrajesh24@gmail.com', 'muhammedmubees56@gmail.com', 'utharakrishnack@gmail.com', 'fayiznk26@gmail.com', 'sanitaambookkan@gmail.com', 'nayanagovind9758@gmail.com', 'kdevika7038@gmail.com']; // Add your admin emails here
        setIsAdmin(adminEmails.includes(user.email));
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
