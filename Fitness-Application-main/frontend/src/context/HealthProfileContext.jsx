import { createContext, useContext, useState, useEffect } from 'react';
import { calculateCompleteAssessment } from '../data/healthCalculations';
import api from '../services/api';

const STORAGE_KEY = 'macropace_health_profile';

const DEFAULT_PROFILE = {
  gender: 'male',
  age: 26,
  weight: 71.0,
  height: 178,
  activity: 'moderate',
  goal: 'muscle_gain',
};

const HealthProfileContext = createContext(null);

export function HealthProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_PROFILE;
  });

  const [lastAppliedTimestamp, setLastAppliedTimestamp] = useState(() => {
    return localStorage.getItem('macropace_targets_applied_at') || null;
  });

  // Load from MySQL backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('macropace_auth_token');
      if (token) {
        try {
          const res = await api.get('/profile');
          if (res.success && res.profile) {
            setProfile(res.profile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(res.profile));
          }
        } catch {}
      }
    };
    fetchProfile();
  }, []);

  // Calculate live results based on active profile
  const assessmentResults = calculateCompleteAssessment(profile);

  // Sync profile to localStorage on change and backend if authenticated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);

    const token = localStorage.getItem('macropace_auth_token');
    if (token) {
      try {
        const liveAssessment = calculateCompleteAssessment(updated);
        await api.put('/profile', {
          ...updated,
          assessmentResults: liveAssessment,
        });
      } catch {}
    }
  };

  const applyTargets = async () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastAppliedTimestamp(timeStr);
    try {
      localStorage.setItem('macropace_targets_applied_at', timeStr);
      const token = localStorage.getItem('macropace_auth_token');
      if (token) {
        await api.put('/profile', {
          ...profile,
          assessmentResults,
        });
      }
    } catch {}
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <HealthProfileContext.Provider
      value={{
        profile,
        assessmentResults,
        updateProfile,
        applyTargets,
        resetProfile,
        lastAppliedTimestamp,
      }}
    >
      {children}
    </HealthProfileContext.Provider>
  );
}

export function useHealthProfile() {
  const context = useContext(HealthProfileContext);
  if (!context) {
    throw new Error('useHealthProfile must be used within a HealthProfileProvider');
  }
  return context;
}
