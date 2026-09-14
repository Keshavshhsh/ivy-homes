import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, DEMO_PASSWORD } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem('ivy_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setAccessToken(parsed.accessToken);
          setRefreshToken(parsed.refreshToken);
          setTokenExpiry(parsed.tokenExpiry);

          // If token has already expired or close to expiry, refresh it immediately
          const now = Date.now();
          if (parsed.refreshToken && parsed.tokenExpiry && now >= parsed.tokenExpiry - 60000) {
            try {
              const refreshed = await api.refreshToken(parsed.refreshToken);
              const newExpiry = Date.now() + (refreshed.expires_in || 900) * 1000;
              setAccessToken(refreshed.access_token);
              setRefreshToken(refreshed.refresh_token);
              setTokenExpiry(newExpiry);
              localStorage.setItem('ivy_session', JSON.stringify({
                user: parsed.user,
                accessToken: refreshed.access_token,
                refreshToken: refreshed.refresh_token,
                tokenExpiry: newExpiry,
              }));
              // Fetch user profile and saved items
              loadUserData(refreshed.access_token);
            } catch (e) {
              console.warn('Initial refresh failed, attempting auto-login as demo1', e);
              await autoLoginDemo();
            }
          } else {
            loadUserData(parsed.accessToken);
          }
        } else {
          // Default auto-login as demo1 for instant seamless experience
          await autoLoginDemo();
        }
      } catch (err) {
        console.error('Session load error', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const loadUserData = async (token) => {
    try {
      const p = await api.getProfile(token);
      if (p) setProfile(p);
      const savedRes = await api.getSavedListings(token);
      if (savedRes && savedRes.results) {
        setSavedIds(new Set(savedRes.results.map(r => r.listing_id)));
      }
    } catch (e) {
      console.warn('Error fetching user profile or saved items:', e);
    }
  };

  const autoLoginDemo = async () => {
    try {
      const data = await api.login('demo1@ivy.homes', DEMO_PASSWORD);
      applyLoginSuccess('demo1@ivy.homes', data);
    } catch (e) {
      console.error('Auto login demo1 failed', e);
    }
  };

  // Setup silent refresh timer whenever accessToken / refreshToken changes
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    if (!refreshToken || !tokenExpiry) return;

    // Refresh 60 seconds before expiration
    const delay = Math.max(10000, tokenExpiry - Date.now() - 60000);
    console.log(`Scheduling token refresh in ${Math.round(delay / 1000)}s`);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        console.log('Executing silent token refresh...');
        const refreshed = await api.refreshToken(refreshToken);
        const newExpiry = Date.now() + (refreshed.expires_in || 900) * 1000;
        setAccessToken(refreshed.access_token);
        setRefreshToken(refreshed.refresh_token);
        setTokenExpiry(newExpiry);
        localStorage.setItem('ivy_session', JSON.stringify({
          user,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          tokenExpiry: newExpiry,
        }));
      } catch (e) {
        console.warn('Silent refresh error:', e);
      }
    }, delay);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [accessToken, refreshToken, tokenExpiry, user]);

  const applyLoginSuccess = (email, data) => {
    const userObj = { email };
    const expiry = Date.now() + (data.expires_in || 900) * 1000;
    setUser(userObj);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setTokenExpiry(expiry);
    setError(null);

    localStorage.setItem('ivy_session', JSON.stringify({
      user: userObj,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiry: expiry,
    }));

    loadUserData(data.access_token);
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login(email, password);
      applyLoginSuccess(email, data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    if (accessToken) {
      await api.logout(accessToken);
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);
    setProfile(null);
    setSavedIds(new Set());
    localStorage.removeItem('ivy_session');
  };

  const switchAccount = async (targetEmail) => {
    try {
      const data = await api.login(targetEmail, DEMO_PASSWORD);
      applyLoginSuccess(targetEmail, data);
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleSaveListing = async (listingId) => {
    if (!accessToken) return;
    const isSaved = savedIds.has(listingId);
    
    // Optimistic update
    const updated = new Set(savedIds);
    if (isSaved) {
      updated.delete(listingId);
    } else {
      updated.add(listingId);
    }
    setSavedIds(updated);

    try {
      if (isSaved) {
        await api.unsaveListing(accessToken, listingId);
      } else {
        await api.saveListing(accessToken, listingId);
      }
    } catch (err) {
      // Revert on failure
      console.error('Failed to toggle saved listing', err);
      setSavedIds(savedIds);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      accessToken,
      tokenExpiry,
      loading,
      error,
      savedIds,
      login,
      logout,
      switchAccount,
      toggleSaveListing,
      refreshSaved: () => accessToken && loadUserData(accessToken),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
