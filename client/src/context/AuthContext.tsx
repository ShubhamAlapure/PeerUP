import React, { createContext, useContext, useState } from 'react';
import type { Profile } from '../types';

interface AuthContextType {
  currentUser: Profile;
  switchRole: (role: 'student' | 'peer' | 'admin') => void;
  selectedInstitutionId: string;
  setSelectedInstitutionId: (id: string) => void;
  loginDemoUser: (user: Profile) => void;
}

const defaultStudentProfile: Profile = {
  id: "usr-rohit",
  full_name: "Rohit Verma",
  email: "rohit.student@mitadt.edu.in",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  institution_id: "inst-mit-adt",
  department_id: "dept-cse",
  program_id: "prog-btech-cse",
  year: 2,
  semester: 3,
  role: "student",
  verification_status: "verified",
  bio: "2nd Year CSE student eager to master Database Systems and Operating Systems."
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile>(defaultStudentProfile);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('inst-mit-adt');

  const switchRole = (role: 'student' | 'peer' | 'admin') => {
    if (role === 'peer') {
      setCurrentUser({
        id: "usr-shubham",
        full_name: "Shubham Alapure",
        email: "shubham@mitadt.edu.in",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        institution_id: "inst-mit-adt",
        department_id: "dept-cse",
        program_id: "prog-btech-cse",
        year: 3,
        semester: 5,
        role: "peer",
        verification_status: "verified",
        bio: "3rd Year CSE Student at MIT ADT. Top 1% Peer Educator."
      });
    } else if (role === 'admin') {
      setCurrentUser({
        id: "usr-admin",
        full_name: "PeerUP Administrator",
        email: "admin@peerup.edu",
        avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        institution_id: "inst-mit-adt",
        role: "admin",
        verification_status: "verified",
        bio: "Platform Administrator maintaining academic integrity."
      });
    } else {
      setCurrentUser(defaultStudentProfile);
    }
  };

  const loginDemoUser = (user: Profile) => {
    setCurrentUser(user);
    if (user.institution_id) {
      setSelectedInstitutionId(user.institution_id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        selectedInstitutionId,
        setSelectedInstitutionId,
        loginDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
