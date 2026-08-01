"use client";

import { createContext, useContext } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext.js";
import { WalletProvider } from "../context/WalletContext.js";

const AppConfigContext = createContext({
  googleClientId: "",
  isGoogleAuthEnabled: false,
});

export default function AppProviders({ children, googleClientId = "" }) {
  const config = {
    googleClientId,
    isGoogleAuthEnabled: Boolean(googleClientId),
  };

  const wrappedChildren = (
    <AppConfigContext.Provider value={config}>
      <AuthProvider>
        <WalletProvider>{children}</WalletProvider>
      </AuthProvider>
    </AppConfigContext.Provider>
  );

  if (!googleClientId) {
    return wrappedChildren;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {wrappedChildren}
    </GoogleOAuthProvider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
