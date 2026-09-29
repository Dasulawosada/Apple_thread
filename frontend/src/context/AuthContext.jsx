import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const USER_KEY = "apple-thread-user";
const TOKEN_KEY = "apple-thread-token";
const ADMIN_KEY = "apple-thread-admin";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    console.error("Could not decode token", e);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_KEY) === "true");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token on load if exists
    async function verifyUser() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            if (res.user.role === "admin") {
              setIsAdmin(true);
            }
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ADMIN_KEY, isAdmin ? "true" : "false");
  }, [isAdmin]);

  async function registerWithEmail(name, email, password) {
    const data = await api.register(name, email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    if (data.user.role === "admin") setIsAdmin(true);
    return data;
  }

  async function loginWithEmail(email, password) {
    const data = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    if (data.user.role === "admin") setIsAdmin(true);
    return data;
  }

  async function updateAccount(profile) {
    const data = await api.updateMe(profile);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }

  async function loginWithGoogleToken(idToken) {
    const payload = decodeJwt(idToken);
    if (!payload) return;
    try {
      const data = await api.googleLogin({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
    } catch (err) {
      console.error("Google login failed with backend:", err);
      // Fallback
      setUser({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: "google",
      });
    }
  }

  async function adminLogin(username, password) {
    try {
      const data = await api.adminLogin(username, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      setIsAdmin(true);
      return true;
    } catch (err) {
      // Fallback to demo admin check if backend offline
      if (username === "admin" && password === "admin123") {
        setIsAdmin(true);
        return true;
      }
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setUser(null);
    setIsAdmin(false);
  }

  function adminLogout() {
    logout();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginWithEmail,
        registerWithEmail,
        updateAccount,
        loginWithGoogleToken,
        adminLogin,
        logout,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
