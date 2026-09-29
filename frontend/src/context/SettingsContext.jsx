import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const SETTINGS_KEY = "apple-thread-settings";

const DEFAULT_SETTINGS = {
  announcement: "🧵 Free delivery on orders over Rs. 2,500 across Sri Lanka",
  ownerName: "Thenuwara Hannadige",
  ownerEmail: "Wosadasula2004@gmail.com",
  ownerPhone: "071-0835022",
  freeDeliveryThreshold: 2500,
  deliveryFee: 250,
  storeTagline: "Sri Lanka's Premium Quality Thread Supplier",
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      console.error("Could not load settings", e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    let active = true;
    api.getSettings().then((remoteSettings) => {
      if (active) setSettings((current) => ({ ...current, ...remoteSettings }));
    }).catch((error) => {
      console.error("Could not load store settings from server:", error);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Could not save settings", e);
    }
  }, [settings]);

  async function updateSettings(newSettings) {
    const savedSettings = await api.updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...savedSettings }));
  }

  async function resetSettings() {
    const savedSettings = await api.updateSettings(DEFAULT_SETTINGS);
    setSettings((prev) => ({ ...prev, ...savedSettings }));
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) return { settings: DEFAULT_SETTINGS, updateSettings: () => {}, resetSettings: () => {} };
  return ctx;
}
