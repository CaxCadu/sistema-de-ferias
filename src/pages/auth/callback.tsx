import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function AuthCallback() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Redirecionar após login bem-sucedido
    if (user && !isLoading) {
      window.location.href = '/';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalizando login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}