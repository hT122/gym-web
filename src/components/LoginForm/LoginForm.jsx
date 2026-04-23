import React, { useState } from 'react';
import GooeyText from '../GooeyText/GooeyText';
import { GetStartedButton } from '../ui/get-started-button';

import { auth } from '../../firebase/config';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Este email ya está registrado.',
  'auth/invalid-email': 'Email no válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/wrong-password': 'Contraseña incorrecta.',
};

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function LoginForm({ darkMode, onToggleDark }) {
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(cred.user, { displayName: authName || authEmail.split('@')[0] });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err) {
      setAuthError(ERROR_MESSAGES[err.code] || 'Error al autenticar. Inténtalo de nuevo.');
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setAuthError('');
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      <button
        className="dark-mode-toggle"
        onClick={onToggleDark}
        aria-label="Cambiar tema"
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10 }}
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </button>
      <div className="login-wrapper">
        <div className="login-hero">
          {authMode === 'login' ? (
            <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GooeyText
                texts={['ENTRENA', 'COMPITE', 'GANA']}
                morphTime={1}
                cooldownTime={0.4}
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '58px',
                  fontWeight: 900,
                  letterSpacing: '-2px',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          ) : (
            <h1>JOIN THE LEAGUE</h1>
          )}
          <p>FANTASY GYM LEAGUE</p>
        </div>

        <div className="login-card">
          <form onSubmit={handleEmailAuth} className="login-form">
            {authMode === 'register' && (
              <div className="login-field">
                <label>Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                />
              </div>
            )}
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="name@athlete.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-field">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />
            </div>
            {authError && <p className="auth-error">{authError}</p>}
            <GetStartedButton
              type="submit"
              label={authMode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
            />
          </form>

          <div className="login-divider"><span>O CONTINÚA CON</span></div>

          <button
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
            className="login-google-btn"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Login
          </button>

          <div className="login-switch">
            {authMode === 'login' ? (
              <>
                <span>¿No tienes una cuenta?</span>
                <button onClick={() => switchMode('register')}>Registrarse</button>
              </>
            ) : (
              <>
                <span>¿Ya tienes una cuenta?</span>
                <button onClick={() => switchMode('login')}>Iniciar sesión</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
