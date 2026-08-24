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
  const [currentUser, setCurrentUser] = useState<UserProfile>(guestProfile);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch current active session on app load
    supabase.auth.getSession().then(({ data: { session: activeSession }, error }) => {
      if (activeSession?.user && !error) {
        setSession(activeSession);
        fetchUserProfile(activeSession.user.id, activeSession.user.email || '');
      } else {
        setSession(null);
        setLoading(false);
      }
    }).catch(() => {
      setSession(null);
      setLoading(false);
    });

    // 2. Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, activeSession) => {
      if (activeSession?.user) {
        setSession(activeSession);
        await fetchUserProfile(activeSession.user.id, activeSession.user.email || '');
      } else {
        setSession(null);
        setCurrentUser(guestProfile);
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
        // Fallback user state with actual registered email
        setCurrentUser(prev => ({
          ...prev,
          id: userId,
          email,
          full_name: email.split('@')[0]
        }));
      }
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentUser((prev: UserProfile) => ({
      ...prev,
      role: newRole,
      verification_status: newRole === 'peer' ? (prev.verification_status === 'unverified' ? 'pending' : prev.verification_status) : prev.verification_status
    }));
  };

  // STRICT SIGN UP
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

    if (!data.user) {
      throw new Error('Registration failed. Please enter a valid email address.');
    }

    const newProfile: UserProfile = {
      id: data.user.id,
      full_name: fullName,
      email: data.user.email || email,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: role,
      verification_status: role === 'peer' ? 'pending' : 'unverified',
      is_onboarded: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase `public.profiles`
    try {
      await supabase.from('profiles').upsert([newProfile], { onConflict: 'id' });
    } catch (dbErr) {
      console.warn('Profile DB insert warning:', dbErr);
    }

    setCurrentUser(newProfile);
    setSession(data.session || { user: data.user });
    return data;
  };

  // STRICT SIGN IN (Throws error on invalid credentials like huihi.@in)
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
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
    await supabase.auth.signOut();
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
