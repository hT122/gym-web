import React, { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { inicializarUsuario, obtenerUsuario, subscribeToUserDoc } from './firebase/users';
import LoginPage from './pages/LoginPage';
import EntrenarPage from './pages/EntrenarPage';
import LigasPage from './pages/LigasPage';
import PerfilPage from './pages/PerfilPage';
import CaloriasPage from './pages/CaloriasPage';
import ChatPage from './pages/ChatPage';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('entrenar');

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

  if (!user) return <LoginPage />;

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        userData={userData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignOut={() => signOut(auth)}
      />
      <main className="main-content">
        <header className="header">
          <h1>
            {activeTab === 'entrenar' && 'Registro de Hoy'}
            {activeTab === 'ligas' && 'Ligas Fantasy'}
            {activeTab === 'perfil' && 'Mi Perfil'}
            {activeTab === 'calorias' && 'Calculadora de Calorías'}
            {activeTab === 'chat' && 'Mensajes'}
          </h1>
        </header>
        {activeTab === 'entrenar' && (
          <EntrenarPage user={user} userData={userData} onRefrescarUsuario={refrescarUsuario} />
        )}
        {activeTab === 'ligas' && (
          <LigasPage user={user} userData={userData} />
        )}
        {activeTab === 'perfil' && (
          <PerfilPage user={user} userData={userData} />
        )}
        {activeTab === 'calorias' && <CaloriasPage />}
        {activeTab === 'chat' && <ChatPage user={user} userData={userData} />}
      </main>
    </div>
  );
}

export default App;
