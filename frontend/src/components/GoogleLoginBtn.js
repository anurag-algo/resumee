"use client";

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation.js';
import { useAuth } from '../context/AuthContext.js';
import { useAppConfig } from './AppProviders.js';

const GoogleLoginBtn = () => {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const { isGoogleAuthEnabled } = useAppConfig();

  const handleSuccess = async (response) => {
    try {
      await googleLogin(response.credential);
      router.push('/');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  if (!isGoogleAuthEnabled) {
    return React.createElement(
      'p',
      { className: 'text-center text-sm text-slate-500' },
      'Google sign-in is not configured.'
    );
  }

  return React.createElement(GoogleLogin, {
    onSuccess: handleSuccess,
    onError: () => console.error('Google Login Failed'),
    useOneTap: true,
  });
};

export default GoogleLoginBtn;
