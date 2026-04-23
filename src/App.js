import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { inicializarUsuario, subscribeToUserDoc, obtenerUsuario } from './firebase/users';
import LoginPage from './pages/LoginPage';
import EntrenarPage from './pages/EntrenarPage';
import LigasPage from './pages/LigasPage';
import PerfilPage from './pages/PerfilPage';
import CaloriasPage from './pages/CaloriasPage';
import ChatPage from './pages/ChatPage';
import PRsPage from './pages/PRsPage';
import AjustesPage from './pages/AjustesPage';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

function AppShell({ user, userData, refrescarUsuario, darkMode, onToggleDark }) {
  return (
    <div className="app-container">
      <Sidebar user={user} userData={userData} onSignOut={() => signOut(auth)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<><PageHeader title="Registro de Hoy" /><EntrenarPage user={user} userData={userData} onRefrescarUsuario={refrescarUsuario} /></>} />
          <Route path="/ligas" element={<><PageHeader title="Ligas Fantasy" /><LigasPage user={user} userData={userData} /></>} />
          <Route path="/perfil" element={<><PageHeader title="Mi Perfil" /><PerfilPage user={user} userData={userData} /></>} />
          <Route path="/calorias" element={<><PageHeader title="Calculadora de Calorías" /><CaloriasPage user={user} userData={userData} /></>} />
          <Route path="/chat" element={<><PageHeader title="Mensajes" /><ChatPage user={user} userData={userData} /></>} />
          <Route path="/prs" element={<><PageHeader title="Récords Personales" /><PRsPage user={user} /></>} />
          <Route path="/ajustes" element={<><PageHeader title="Ajustes" /><AjustesPage user={user} userData={userData} darkMode={darkMode} onToggleDark={onToggleDark} /></>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PageHeader({ title }) {
  return (
    <header className="header">
      <h1>{title}</h1>
    </header>
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
  if (!user) return <BrowserRouter><LoginPage /></BrowserRouter>;

  return (
    <BrowserRouter>
      <AppShell
        user={user}
        userData={userData}
        refrescarUsuario={refrescarUsuario}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
    </BrowserRouter>
  );
}

export default App;
