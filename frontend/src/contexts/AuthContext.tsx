// src/context/AuthContext.tsx (Updated)

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the user info from your authRouter.js
interface UserInfo {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  phoneNumbers: string[];
  addresses: unknown[]; // You can make this a stricter type later
}

// Define the shape of the context data
interface AuthContextType {
  token: string | null;
  user: UserInfo | null; // <-- Store user info
  saveAuth: (token: string, user: UserInfo) => void; // <-- Updated function
  clearAuth: () => void; // <-- Renamed for clarity
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });

  const [user, setUser] = useState<UserInfo | null>(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // New function to save both token and user
  const saveAuth = (newToken: string, newUser: UserInfo) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // New function to clear both
  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, saveAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// The hook stays the same
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};