import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage';
import { RepositoryPage } from './pages/RepositoryPage';
import { PeersPage } from './pages/PeersPage';
import { PeerDetailPage } from './pages/PeerDetailPage';
import { CreateExplanationPage } from './pages/CreateExplanationPage';
import { RequestsPage } from './pages/RequestsPage';
import { AdminPage } from './pages/AdminPage';
import { ContentDetailPage } from './pages/ContentDetailPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#f8f6ff] text-[#2e1065] font-sans selection:bg-[#6d28d9] selection:text-white">
          <Navbar />
          <main className="flex-1 bg-[#f8f6ff]">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/institution/:institutionId" element={<InstitutionDetailPage />} />
              <Route path="/repository" element={<RepositoryPage />} />
              <Route path="/peers" element={<PeersPage />} />
              <Route path="/peer/:peerId" element={<PeerDetailPage />} />
              <Route path="/create-explanation" element={<CreateExplanationPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/content/:contentId" element={<ContentDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
