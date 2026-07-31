"use client";

import { createContext, useContext } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext.js";

const AppConfigContext = createContext({
  googleClientId: "",
  isGoogleAuthEnabled: false,
});

export default function AppProviders({ children, googleClientId = "" }) {
  const config = {
    googleClientId,
    isGoogleAuthEnabled: Boolean(googleClientId),
  };

  if (!googleClientId) {
    return (
      <AppConfigContext.Provider value={config}>
        <AuthProvider>{children}</AuthProvider>
      </AppConfigContext.Provider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppConfigContext.Provider value={config}>
        <AuthProvider>{children}</AuthProvider>
      </AppConfigContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
