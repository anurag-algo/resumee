"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";

const AuthContext = createContext(null);

const getAuthPayload = (response) => response?.data?.data || response?.data || {};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    const fetchUser = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const payload = getAuthPayload(response);

        setUser(payload.user || payload || null);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const payload = getAuthPayload(response);
    const authToken = payload.token;

    setToken(authToken);
    setUser(payload.user || null);
    return payload;
  };

  const signup = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    const payload = getAuthPayload(response);
    const authToken = payload.token;

    setToken(authToken);
    setUser(payload.user || null);
    return payload;
  };

  const googleLogin = async (idToken) => {
    const response = await api.post("/auth/google", { credential: idToken });
    const payload = getAuthPayload(response);
    const authToken = payload.token;

    setToken(authToken);
    setUser(payload.user || null);
    return payload;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      googleLogin,
      logout,
    }),
    [user, token, loading]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
};

const useAuth = () => useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };
export default AuthProvider;
