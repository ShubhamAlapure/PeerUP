import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  currentUser: UserProfile;
  session: any | null;
  loading: boolean;
  role: UserRole;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<any>;
  signIn: (email: string, password: string, requiredRole?: UserRole) => Promise<any>;
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

const isValidUUID = (str?: string) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
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
    if (currentUser && currentUser.email && currentUser.id !== 'usr-guest') {
      localStorage.setItem('peerup_user_profile', JSON.stringify(currentUser));
      localStorage.setItem(`peerup_user_profile_${currentUser.email.toLowerCase()}`, JSON.stringify(currentUser));
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

  const fetchUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
    const cleanEmail = email.toLowerCase();
    let loadedProfile: UserProfile | null = null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},email.eq.${cleanEmail}`)
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        loadedProfile = data as UserProfile;
      }
    } catch (err) {
      console.warn('Supabase DB fetch notice:', err);
    }

    if (!loadedProfile && cleanEmail) {
      const savedByEmail = localStorage.getItem(`peerup_user_profile_${cleanEmail}`);
      if (savedByEmail) {
        try {
          loadedProfile = JSON.parse(savedByEmail);
        } catch (e) {
          // Ignore
        }
      }
    }

    if (loadedProfile) {
      setCurrentUser(loadedProfile);
      setLoading(false);
      return loadedProfile;
    } else {
      const defaultUser: UserProfile = {
        id: userId,
        full_name: email.split('@')[0].replace('.', ' '),
        email: email,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        institution_id: 'inst-mit-adt',
        department_id: 'dept-cse',
        program_id: 'prog-btech-cse',
        year: 2,
        semester: 3,
        role: 'student',
        verification_status: 'unverified',
        is_onboarded: true,
        bio: 'Enrolled student learner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCurrentUser(defaultUser);
      setLoading(false);
      return defaultUser;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'student') => {
    const cleanEmail = email.toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
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
      email: cleanEmail,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      year: 2,
      semester: 3,
      role: role,
      verification_status: role === 'peer' ? 'pending' : 'unverified',
      is_onboarded: false,
      bio: 'Enrolled student learner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('profiles').upsert([newProfile], { onConflict: 'id' });
    } catch (dbErr) {
      console.warn('Profile DB insert warning:', dbErr);
    }

    const activeSession = { user: { id: userId, email: cleanEmail } };
    setCurrentUser(newProfile);
    setSession(data.session || activeSession);
    localStorage.setItem('peerup_user_profile', JSON.stringify(newProfile));
    localStorage.setItem(`peerup_user_profile_${cleanEmail}`, JSON.stringify(newProfile));
    localStorage.setItem('peerup_session', JSON.stringify(data.session || activeSession));
    return data;
  };

  const signIn = async (email: string, password: string, requiredRole?: UserRole) => {
    const cleanEmail = email.toLowerCase();

    // 1. Perform Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error && !error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error(error.message || 'Invalid email or password credentials.');
    }

    const activeUserId = data?.user?.id || `usr-${Date.now()}`;

    // 2. Fetch registered user profile
    const fetchedProfile = await fetchUserProfile(activeUserId, cleanEmail);

    // 3. Strict Role Validation: Reject Student credentials on Peer login and vice versa!
    if (requiredRole) {
      if (requiredRole === 'peer' && fetchedProfile.role !== 'peer') {
        throw new Error('This account is registered as a Student Learner. Please switch to the Student Learner tab to log in.');
      }
      if (requiredRole === 'student' && fetchedProfile.role === 'peer') {
        throw new Error('This account is registered as a Peer Educator. Please switch to the Peer Tutor tab to log in.');
      }
    }

    const activeSess = data?.session || { user: { id: activeUserId, email: cleanEmail } };
    setSession(activeSess);
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

    if (updated.email) {
      const cleanEmail = updated.email.toLowerCase();
      localStorage.setItem('peerup_user_profile', JSON.stringify(updated));
      localStorage.setItem(`peerup_user_profile_${cleanEmail}`, JSON.stringify(updated));

      const dbPayload: any = {
        full_name: updated.full_name,
        avatar_url: updated.avatar_url,
        year: Number(updated.year),
        semester: Number(updated.semester),
        bio: updated.bio,
        updated_at: new Date().toISOString()
      };

      if (isValidUUID(updated.institution_id)) {
        dbPayload.institution_id = updated.institution_id;
      }

      try {
        const { error: supaErr } = await supabase
          .from('profiles')
          .update(dbPayload)
          .eq('email', cleanEmail);

        if (supaErr) {
          console.error('Supabase DB profile update error:', supaErr.message);
        } else {
          console.log('Successfully updated profile in Supabase DB for:', cleanEmail);
        }
      } catch (e) {
        console.error('Profile update catch error:', e);
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
