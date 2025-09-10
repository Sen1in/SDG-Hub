import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

// Declare Google API types if @types/google-one-tap is not installed
declare global {
  interface Window {
    google: any;
    handleGoogleCallback: (response: any) => void;
  }
}

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const initializeGoogleLogin = () => {
    // Ensure Google API is loaded
    if (!window.google) {
      console.error('Google API not loaded');
      return;
    }

    // Initialize Google login
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  };

  const handleGoogleCallback = async (response: any) => {
    setGoogleLoading(true);
    
    try {
      const result = await loginWithGoogle(response.credential);
      
      if (result.success) {
        // Check isFirstLogin from the result data
        const isFirstLogin = result.data?.isFirstLogin || false;
        
        if (isFirstLogin) {
          // First time login, redirect to profile completion page
          navigate('/complete-profile');
        } else {
          // Normal login, redirect to home
          navigate('/');
        }
      } else {
        console.error('Google login failed:', result.errors);
        // Add error handling here, such as showing toast messages
      }
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google) {
      console.error('Google API not loaded');
      return;
    }

    setGoogleLoading(true);
    
    // Set global callback function
    window.handleGoogleCallback = handleGoogleCallback;
    
    // Trigger Google login popup
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.error('Google login prompt not displayed');
        setGoogleLoading(false);
      } else if (notification.isSkippedMoment()) {
        console.log('Google login prompt skipped');
        setGoogleLoading(false);
      }
    });
  };

  // Initialize Google login on component mount
  useEffect(() => {
    const loadGoogleAPI = () => {
      if (window.google) {
        initializeGoogleLogin();
        return;
      }

      // If Google API is not loaded yet, wait and retry
      const checkGoogle = setInterval(() => {
        if (window.google) {
          initializeGoogleLogin();
          clearInterval(checkGoogle);
        }
      }, 100);

      // Stop checking after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
      }, 10000);
    };

    loadGoogleAPI();
  }, []);

  return {
    googleLoading,
    handleGoogleLogin
  };
};