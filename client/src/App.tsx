import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { SignInEmail } from './pages/auth/SignInEmail';
import { SignInOtp } from './pages/auth/SignInOtp';
import { Activities } from './pages/Activities';
import { ActivityDetails } from './pages/ActivityDetails';
import { ActivityForm } from './pages/ActivityForm';
import { LostFoundBoard } from './pages/LostFoundBoard';
import { LostFoundDetail } from './pages/lost-found/LostFoundDetail';
import { LostFoundForm } from './pages/lost-found/LostFoundForm';
import { ServiceAlerts } from './pages/service-alerts/ServiceAlerts';
import { ServiceAlertDetail } from './pages/service-alerts/ServiceAlertDetail';
import { ServiceAlertForm } from './pages/service-alerts/ServiceAlertForm';
import { Profile } from './pages/profile/Profile';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignInEmail />} />
            <Route path="/signin/otp" element={<SignInOtp />} />

            {/* Protected Core Layout routes */}
            <Route path="/app" element={<Layout />}>
              <Route index element={<Navigate to="/app/activity" replace />} />
              <Route path="activity" element={<Activities />} />
              <Route path="activity/new" element={<ActivityForm />} />
              <Route path="activity/:id" element={<ActivityDetails />} />
              
              <Route path="lost-found" element={<LostFoundBoard />} />
              <Route path="lost-found/new" element={<LostFoundForm />} />
              <Route path="lost-found/:id" element={<LostFoundDetail />} />

              <Route path="service-alerts" element={<ServiceAlerts />} />
              <Route path="service-alerts/new" element={<ServiceAlertForm />} />
              <Route path="service-alerts/:id" element={<ServiceAlertDetail />} />

              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#17211b',
              color: '#ffffff',
              border: '1px solid rgba(23, 33, 27, 0.12)',
              borderRadius: '14px',
              boxShadow: '0 14px 40px rgba(23, 33, 27, 0.18)',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
