import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAdminSettings } from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_TIME_ZONE, normalizeTimeZone } from '../utils/formatDate';

const STORAGE_KEY = 'smart_campus_default_timezone';

export const TimezoneContext = createContext({
  timezone: DEFAULT_TIME_ZONE,
  setTimezone: () => {}
});

function readStoredTimezone() {
  try {
    return normalizeTimeZone(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function persistTimezone(timezone) {
  try {
    localStorage.setItem(STORAGE_KEY, timezone);
  } catch {
    // Ignore storage failures; the in-memory value still keeps the UI correct.
  }
}

export function TimezoneProvider({ children }) {
  const { accessToken, isLoading, user } = useAuth();
  const [timezone, setTimezoneState] = useState(readStoredTimezone);

  const setTimezone = useCallback((nextTimezone) => {
    const normalized = normalizeTimeZone(nextTimezone);
    setTimezoneState(normalized);
    persistTimezone(normalized);
  }, []);

  useEffect(() => {
    if (isLoading || user?.role !== 'admin' || !accessToken) {
      return undefined;
    }

    let active = true;

    async function loadTimezone() {
      try {
        const settings = await getAdminSettings({
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (active) {
          setTimezone(settings.system?.defaultTimezone);
        }
      } catch (error) {
        console.warn('Failed to load system timezone:', error);
      }
    }

    loadTimezone();
    return () => {
      active = false;
    };
  }, [accessToken, isLoading, setTimezone, user?.role]);

  const value = useMemo(
    () => ({
      timezone,
      setTimezone
    }),
    [setTimezone, timezone]
  );

  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>;
}

export function useSystemTimezone() {
  return useContext(TimezoneContext);
}
