'use client';

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Bot, Loader2, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed:", err);
      // Ignore "popup closed by user" errors
      if (err.code !== 'auth/popup-closed-by-user') {
        if (err.code === 'auth/unauthorized-domain') {
          setError('Domaine non autorisé. Veuillez vérifier la configuration Firebase.');
        } else {
          setError(`Erreur: ${err.code} - ${err.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center animate-fade-in">
        
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center mb-6 shadow-sm">
          <span className="text-2xl font-black text-white dark:text-zinc-900">FX</span>
        </div>
        
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Bienvenue sur Fluxo</h1>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
          Connectez-vous pour synchroniser vos données sur le Cloud et y accéder de n&apos;importe où.
        </p>

        {error && (
          <div className="w-full mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-2 items-start text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all shadow-sm hover:shadow"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
