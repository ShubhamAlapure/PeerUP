import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage';
import { RepositoryPage } from './pages/RepositoryPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { PeersPage } from './pages/PeersPage';
import { PeerDetailPage } from './pages/PeerDetailPage';
import { CreateExplanationPage } from './pages/CreateExplanationPage';
import { RequestsPage } from './pages/RequestsPage';
import { AdminPage } from './pages/AdminPage';

// Auth & Onboarding Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#f8f6ff] text-[#2e1065] flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/institution/:id" element={<InstitutionDetailPage />} />
              <Route path="/repository" element={<RepositoryPage />} />
              <Route path="/content/:id" element={<ContentDetailPage />} />
              <Route path="/peers" element={<PeersPage />} />
              <Route path="/peer/:id" element={<PeerDetailPage />} />
              <Route path="/create-explanation" element={<CreateExplanationPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/admin" element={<AdminPage />} />

              {/* Auth & Onboarding Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
