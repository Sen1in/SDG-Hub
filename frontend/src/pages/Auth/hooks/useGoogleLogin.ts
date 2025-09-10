import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

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

  const checkGoogleAPI = () => {
    console.log('=== Google API Check ===');
    console.log('window.google exists:', !!window.google);
    console.log('window.google value:', window.google);
    
    if (window.google && window.google.accounts) {
      console.log('google.accounts exists:', !!window.google.accounts);
      console.log('google.accounts.id exists:', !!window.google.accounts.id);
    }
    console.log('========================');
  };

  const loadGoogleScript = () => {
    return new Promise<void>((resolve, reject) => {
      console.log('Loading Google Identity Services script...');
      
      // Check if script already exists
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        console.log('Google script already exists in DOM');
        // Wait a bit and check if API is available
        setTimeout(() => {
          if (window.google && window.google.accounts && window.google.accounts.id) {
            console.log('Google API is available');
            resolve();
          } else {
            console.log('Google script exists but API not ready, waiting more...');
            // Wait longer for API to initialize
            setTimeout(() => {
              if (window.google && window.google.accounts && window.google.accounts.id) {
                resolve();
              } else {
                reject(new Error('Google API not available after extended wait'));
              }
            }, 2000);
          }
        }, 500);
        return;
      }

      // Create new script element
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google script loaded successfully');
        // Wait for API to initialize
        const checkAPI = () => {
          if (window.google && window.google.accounts && window.google.accounts.id) {
            console.log('Google API initialized successfully');
            resolve();
          } else {
            console.log('Waiting for Google API to initialize...');
            setTimeout(checkAPI, 200);
          }
        };
        setTimeout(checkAPI, 100);
      };

      script.onerror = (error) => {
        console.error('Failed to load Google script:', error);
        reject(new Error('Failed to load Google script'));
      };

      document.head.appendChild(script);
      console.log('Google script tag added to DOM');
    });
  };

  const initializeGoogleLogin = () => {
    console.log('Initializing Google login...');
    checkGoogleAPI();
    
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Identity Services not properly loaded');
      return false;
    }

    const clientId = '477961726248-ftlr7s59bsd0r6252inttsmirh4btbcn.apps.googleusercontent.com';
    console.log('Using client ID:', clientId);

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      console.log('Google login initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google login:', error);
      return false;
    }
  };

  const handleGoogleCallback = async (response: any) => {
    console.log('Google callback received:', response);
    setGoogleLoading(true);
    
    try {
      const result = await loginWithGoogle(response.credential);
      
      if (result.success) {
        const isFirstLogin = result.data?.isFirstLogin || false;
        
        if (isFirstLogin) {
          navigate('/complete-profile');
        } else {
          navigate('/');
        }
      } else {
        console.error('Google login failed:', result.errors);
      }
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login button clicked');
    checkGoogleAPI();
    
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google API not available when button clicked');
      alert('Google login not available. Please refresh the page and try again.');
      return;
    }

    setGoogleLoading(true);
    window.handleGoogleCallback = handleGoogleCallback;
    
    console.log('Triggering Google login prompt...');
    
    try {
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification);
        
        if (notification.isNotDisplayed()) {
          console.error('Google login prompt not displayed:', notification.getNotDisplayedReason());
          setGoogleLoading(false);
        } else if (notification.isSkippedMoment()) {
          console.log('Google login prompt skipped:', notification.getSkippedReason());
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error('Error triggering Google prompt:', error);
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    console.log('useGoogleLogin hook mounted');
    
    const initGoogle = async () => {
      try {
        await loadGoogleScript();
        console.log('Google script loaded, initializing...');
        initializeGoogleLogin();
      } catch (error) {
        console.error('Failed to load Google script:', error);
      }
    };

    initGoogle();
  }, []);

  return {
    googleLoading,
    handleGoogleLogin
  };
};