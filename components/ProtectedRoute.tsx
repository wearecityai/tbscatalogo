import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Login } from './Login';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => setShowLogin(false)} />;
  }

  // Check if user email matches the allowed admin email
  if (user.email !== 'a.llorens.selles@gmail.com') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-stone-200 shadow-lg p-8 text-center">
          <h2 className="text-2xl font-serif text-stone-800 mb-4">Acceso Denegado</h2>
          <p className="text-stone-500 mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="bg-stone-900 text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-stone-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

