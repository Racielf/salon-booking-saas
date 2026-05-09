import './App.css'
import { Toaster } from "@/components/ui/toaster"
import Dashboard from './pages/Dashboard';
import BookingPortal from './pages/BookingPortal';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';  // Phase 2: Supabase login
import { SettingsProvider } from '@/lib/SettingsContext';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';


const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const location = useLocation();

  // Booking portal is always public — skip auth entirely
  if (location.pathname.startsWith("/booking/")) {
    return (
      <Routes>
        <Route path="/booking/:businessSlug" element={<BookingPortal />} />
      </Routes>
    );
  }

  // Show branded loading screen while checking Supabase session
  if (isLoadingAuth) {
    return <AuthLoadingScreen />;
  }

  // Not authenticated → show Supabase magic-link login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Render the main app (authenticated)
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/services" element={<Services />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SettingsProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
        </SettingsProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App