import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RequestsProvider } from './contexts/RequestsContext';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AuthCallback } from './pages/auth/callback';
import { NotificationContainer } from './components/NotificationContainer';

function AppContent() {
  const { user, isLoading } = useAuth();

  console.log('AppContent - user:', user, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing LoginForm');
    return <LoginForm />;
  }

  console.log('User found, showing Dashboard');
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Dashboard />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RequestsProvider>
          <NotificationContainer />
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </RequestsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;