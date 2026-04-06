import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing (React StrictMode)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id found');
          navigate('/');
          return;
        }

        // Exchange session_id for session_token
        const response = await axios.post(
          `${API}/auth/google-callback`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const { session_token, user } = response.data;

        // Set session_token cookie
        document.cookie = `session_token=${session_token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;

        // Update auth context
        setUser(user);

        // Navigate to dashboard with user data
        navigate('/dashboard', { replace: true, state: { user } });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    processSession();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;