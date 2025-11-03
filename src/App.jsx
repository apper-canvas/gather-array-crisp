import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "./store/userSlice";

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const initializeApperClient = () => {
      if (typeof window !== 'undefined' && window.ApperSDK) {
        window.apperClient = new window.ApperSDK.ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
      }
    };

    const { ApperClient, ApperUI } = window.ApperSDK || {};
    
    if (ApperClient) {
      const client = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Initialize ApperUI with authentication handling
      ApperUI.setup(client, {
        target: '#authentication',
        clientId: import.meta.env.VITE_APPER_PROJECT_ID,
        view: 'both',
        onSuccess: function (user) {
          setIsInitialized(true);
          // CRITICAL: This exact currentPath logic must be preserved
          let currentPath = window.location.pathname + window.location.search;
          let redirectPath = new URLSearchParams(window.location.search).get('redirect');
          const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                             currentPath.includes('/callback') || currentPath.includes('/error') ||
                             currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
          
          if (user) {
            // User is authenticated
            if (redirectPath) {
              navigate(redirectPath);
            } else if (!isAuthPage) {
              if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                navigate(currentPath);
              } else {
                navigate('/dashboard');
              }
            } else {
              navigate('/dashboard');
            }
            // Store user information in Redux
            dispatch(setUser(JSON.parse(JSON.stringify(user))));
          } else {
            // User is not authenticated
            if (!isAuthPage) {
              navigate(
                currentPath.includes('/signup')
                  ? `/signup?redirect=${currentPath}`
                  : currentPath.includes('/login')
                  ? `/login?redirect=${currentPath}`
                  : '/login'
              );
            } else if (redirectPath) {
              if (
                !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
              ) {
                navigate(`/login?redirect=${redirectPath}`);
              } else {
                navigate(currentPath);
              }
            } else if (isAuthPage) {
              navigate(currentPath);
            } else {
              navigate('/login');
            }
            dispatch(clearUser());
          }
        },
        onError: function(error) {
          console.error("Authentication failed:", error);
          setIsInitialized(true);
        }
      });

      // Initialize ApperClient globally  
      initializeApperClient();
    } else {
      // SDK not loaded yet, set up event listener
      const handleSDKLoad = () => {
        const { ApperClient, ApperUI } = window.ApperSDK;
        
        const client = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
        
        ApperUI.setup(client, {
          target: '#authentication',
          clientId: import.meta.env.VITE_APPER_PROJECT_ID,
          view: 'both',
          onSuccess: function (user) {
            setIsInitialized(true);
            let currentPath = window.location.pathname + window.location.search;
            let redirectPath = new URLSearchParams(window.location.search).get('redirect');
            const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                               currentPath.includes('/callback') || currentPath.includes('/error') ||
                               currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
            
            if (user) {
              if (redirectPath) {
                navigate(redirectPath);
              } else if (!isAuthPage) {
                if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                  navigate(currentPath);
                } else {
                  navigate('/dashboard');
                }
              } else {
                navigate('/dashboard');
              }
              dispatch(setUser(JSON.parse(JSON.stringify(user))));
            } else {
              if (!isAuthPage) {
                navigate(
                  currentPath.includes('/signup')
                    ? `/signup?redirect=${currentPath}`
                    : currentPath.includes('/login')
                    ? `/login?redirect=${currentPath}`
                    : '/login'
                );
              } else if (redirectPath) {
                if (
                  !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
                ) {
                  navigate(`/login?redirect=${redirectPath}`);
                } else {
                  navigate(currentPath);
                }
              } else if (isAuthPage) {
                navigate(currentPath);
              } else {
                navigate('/login');
              }
              dispatch(clearUser());
            }
          },
          onError: function(error) {
            console.error("Authentication failed:", error);
            setIsInitialized(true);
          }
        });

        initializeApperClient();
      };
      
      window.addEventListener('ApperSDKLoaded', handleSDKLoad);
      return () => window.removeEventListener('ApperSDKLoaded', handleSDKLoad);
    }
  }, []); // No dependencies to prevent re-initialization

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK || {};
        if (ApperUI) {
          await ApperUI.logout();
          dispatch(clearUser());
          navigate('/login');
        }
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return (
      <div className="loading flex items-center justify-center p-6 h-screen w-full">
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path>
          <path d="m16.2 7.8 2.9-2.9"></path>
          <path d="M18 12h4"></path>
          <path d="m16.2 16.2 2.9 2.9"></path>
          <path d="M12 18v4"></path>
          <path d="m4.9 19.1 2.9-2.9"></path>
          <path d="M2 12h4"></path>
          <path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-background">
        {/* Routes are handled by RouterProvider in main.jsx */}
      </div>
    </AuthContext.Provider>
  );
}

export default App;