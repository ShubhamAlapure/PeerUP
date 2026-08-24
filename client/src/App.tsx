import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

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
              {/* Public Routes - Accessible to Guests */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/repository" element={<RepositoryPage />} />
              <Route path="/institution/:id" element={<InstitutionDetailPage />} />
              <Route path="/content/:id" element={<ContentDetailPage />} />
              <Route path="/peers" element={<PeersPage />} />
              <Route path="/peer/:id" element={<PeerDetailPage />} />

              {/* Guest Auth Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Routes - Strictly Require Authentication */}
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/create-explanation" element={<ProtectedRoute><CreateExplanationPage /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
