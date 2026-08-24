import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  currentUser: UserProfile;
  session: any | null;
  loading: boolean;
  role: UserRole;
  switchRole: (newRole: UserRole) => void;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<any>;
}

const guestProfile: UserProfile = {
  id: 'usr-guest',
  full_name: 'Rohit Verma',
  email: 'rohit.verma@mitadt.edu.in',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  institution_id: 'inst-mit-adt',
  department_id: 'dept-cse',
  program_id: 'prog-btech-cse',
  year: 2,
  semester: 3,
  role: 'student',
  verification_status: 'unverified',
  is_onboarded: true,
  bio: 'Computer Science & Engineering student focused on DBMS, Algorithms, and System Design.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('peerup_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return guestProfile;
      }
    }
    return guestProfile;
  });

  const [session, setSession] = useState<any | null>(() => {
    const savedSession = localStorage.getItem('peerup_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser && currentUser.id !== 'usr-guest') {
      localStorage.setItem('peerup_user_profile', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('peerup_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('peerup_session');
    }
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: supaSession } }) => {
      if (supaSession?.user) {
        setSession(supaSession);
        fetchUserProfile(supaSession.user.id, supaSession.user.email || '');
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
      if (supaSession?.user) {
        setSession(supaSession);
        await fetchUserProfile(supaSession.user.id, supaSession.user.email || '');
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setCurrentUser(data as UserProfile);
      } else {
        setCurrentUser(prev => ({
          ...prev,
          id: userId,
          email,
          full_name: prev.full_name || email.split('@')[0]
        }));
      }
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentUser((prev: UserProfile) => {
      const updated = {
        ...prev,
        role: newRole,
        verification_status: newRole === 'peer' ? (prev.verification_status === 'unverified' ? 'pending' : prev.verification_status) : prev.verification_status
      };
      if (updated.id !== 'usr-guest') {
        localStorage.setItem('peerup_user_profile', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // SIGN UP: Auto-logs in user immediately
  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'student') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    const userId = data.user?.id || `user-${Date.now()}`;

    const newProfile: UserProfile = {
      id: userId,
      full_name: fullName,
      email: email,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: role,
      verification_status: role === 'peer' ? 'pending' : 'unverified',
      is_onboarded: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save into Supabase `public.profiles`
    try {
      await supabase.from('profiles').upsert([newProfile], { onConflict: 'id' });
    } catch (dbErr) {
      console.warn('Profile DB insert warning:', dbErr);
    }

    const activeSession = { user: { id: userId, email } };
    setCurrentUser(newProfile);
    setSession(data.session || activeSession);
    localStorage.setItem('peerup_user_profile', JSON.stringify(newProfile));
    localStorage.setItem('peerup_session', JSON.stringify(data.session || activeSession));
    return data;
  };

  // SIGN IN: Handles Email Not Confirmed smoothly
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // If error is Email Not Confirmed, allow login to their created profile
      if (error.message.toLowerCase().includes('email not confirmed')) {
        console.warn('Email not confirmed notice: Logging in to registered profile...');
        
        // Try fetching user from profiles table
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        const profileToUse: UserProfile = prof || {
          ...guestProfile,
          id: `usr-${Date.now()}`,
          email,
          full_name: email.split('@')[0]
        };

        const localSession = { user: { id: profileToUse.id, email } };
        setCurrentUser(profileToUse);
        setSession(localSession);
        localStorage.setItem('peerup_user_profile', JSON.stringify(profileToUse));
        localStorage.setItem('peerup_session', JSON.stringify(localSession));
        return { user: profileToUse };
      }

      throw new Error(error.message || 'Invalid email or password credentials.');
    }

    if (!data.user) {
      throw new Error('Unable to log in. Please check your email and password.');
    }

    setSession(data.session);
    await fetchUserProfile(data.user.id, data.user.email || email);
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('peerup_session');
    localStorage.removeItem('peerup_user_profile');
    setSession(null);
    setCurrentUser(guestProfile);
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw new Error(error.message);
    return data;
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...data, updated_at: new Date().toISOString() };
    setCurrentUser(updated);

    if (currentUser.id !== 'usr-guest') {
      localStorage.setItem('peerup_user_profile', JSON.stringify(updated));
    }

    if (session?.user) {
      try {
        await supabase.from('profiles').upsert(updated);
      } catch (e) {
        console.warn('Profile update warning:', e);
      }
    }
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      session,
      loading,
      role: currentUser.role,
      switchRole,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
