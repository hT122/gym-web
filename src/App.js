import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { inicializarUsuario, subscribeToUserDoc, obtenerUsuario } from './firebase/users';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import AboutUs from './pages/AboutUs';
import EntrenarPage from './pages/EntrenarPage';
import LigasPage from './pages/LigasPage';
import PerfilPage from './pages/PerfilPage';
import CaloriasPage from './pages/CaloriasPage';
import ChatPage from './pages/ChatPage';
import PRsPage from './pages/PRsPage';
import AjustesPage from './pages/AjustesPage';
import Sidebar from './components/Sidebar/Sidebar';
import OnboardingFlow from './components/OnboardingFlow/OnboardingFlow';
import './App.css';

const TITLES = {
  '/':         'Registro de Hoy',
  '/ligas':    'Ligas Fantasy',
  '/perfil':   'Mi Perfil',
  '/calorias': 'Calculadora de Calorías',
  '/chat':     'Mensajes',
  '/prs':      'Récords Personales',
  '/ajustes':  'Ajustes',
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

function AppShell({ user, userData, refrescarUsuario, darkMode, onToggleDark }) {
  const location = useLocation();
  const title = TITLES[location.pathname] || '';

  return (
    <div className="app-container">
      {userData?.onboardingCompleto === false && (
        <OnboardingFlow user={user} onCompletar={() => {}} />
      )}
      <Sidebar user={user} userData={userData} onSignOut={() => signOut(auth)} />
      <main className="main-content">
        <header className="header">
          <h1>{title}</h1>
          <button className="dark-mode-toggle" onClick={onToggleDark} aria-label="Cambiar tema">
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>
        <Routes>
          <Route path="/" element={<EntrenarPage user={user} userData={userData} onRefrescarUsuario={refrescarUsuario} />} />
          <Route path="/ligas" element={<LigasPage user={user} userData={userData} />} />
          <Route path="/perfil" element={<PerfilPage user={user} userData={userData} />} />
          <Route path="/calorias" element={<CaloriasPage user={user} userData={userData} />} />
          <Route path="/chat" element={<ChatPage user={user} userData={userData} />} />
          <Route path="/prs" element={<PRsPage user={user} />} />
          <Route path="/ajustes" element={<AjustesPage user={user} userData={userData} darkMode={darkMode} onToggleDark={onToggleDark} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(undefined);
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await inicializarUsuario(currentUser);
        setUser(currentUser);
      } else {
        setUser(null);
        setUserData(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserDoc(user.uid, setUserData);
    return () => unsub();
  }, [user]);

  const refrescarUsuario = async (uid) => {
    const data = await obtenerUsuario(uid);
    setUserData(data);
  };

  if (user === undefined) return null;
  if (!user) return (
    <BrowserRouter>
      <Routes>
        <Route path="/about" element={<AboutUs />} />
        <Route path="*" element={<LoginPage darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />} />
      </Routes>
    </BrowserRouter>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/about" element={<AboutUs />} />
        <Route path="*" element={
          <AppShell
            user={user}
            userData={userData}
            refrescarUsuario={refrescarUsuario}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode((d) => !d)}
          />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
