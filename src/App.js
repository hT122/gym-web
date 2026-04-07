import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('entrenar');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="login-page">
        <img src="logo.png" alt="Fantasy Gym League" className="logo-img" />
        <p className="login-page-subtitle">Compite. Entrena. Gana.</p>
        <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="login-btn">
          Continuar con Google
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* SIDEBAR ESTILO FGL */}
      <nav className="sidebar">
        <img src="/logo.png" alt="FGL Logo" className="sidebar-logo-img" />
        
        <div className="menu">
          <button onClick={() => setActiveTab('entrenar')} className={`menu-btn ${activeTab === 'entrenar' ? 'active' : ''}`}>
            Entrenar
          </button>
          <button onClick={() => setActiveTab('ligas')} className={`menu-btn ${activeTab === 'ligas' ? 'active' : ''}`}>
            Ligas Fantasy
          </button>
          <button className="menu-btn">
            Perfil
          </button>
        </div>

        <div className="user-section">
          <img src={user.photoURL} alt="profile" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">{user.displayName}</p>
            <button onClick={() => signOut(auth)} className="logout-btn">Cerrar sesión</button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <header className="header">
          <h1>{activeTab === 'entrenar' ? 'Registro de Hoy' : 'Global Rankings'}</h1>
          <div className="points-badge">1,240 XP</div>
        </header>

        {activeTab === 'entrenar' ? (
          <div className="content">
            <div className="workout-card">
              <h3 className="card-title">Nueva Sesión</h3>
              <label className="label">EJERCICIO</label>
              <select className="select">
                <option>Press de Banca</option>
                <option>Sentadilla Libre</option>
                <option>Dominadas</option>
              </select>
              
              <div className="stats-row">
                <div className="input-group">
                  <label className="label">PESO (KG)</label>
                  <input type="number" placeholder="0" className="input" />
                </div>
                <div className="input-group">
                  <label className="label">REPES</label>
                  <input type="number" placeholder="0" className="input" />
                </div>
                <button className="add-set-btn">+</button>
              </div>

              <button className="finish-btn">FINALIZAR ENTRENAMIENTO</button>
            </div>
          </div>
        ) : (
          <div className="content">
            <div className="workout-card">
              <h3 className="card-title">Tus Ligas</h3>
              <div className="league-item">
                <span>1. Los Primos Gym</span>
                <span className="league-item-highlight">+450 pts</span>
              </div>
              <div className="league-item">
                <span>2. Warriors League</span>
                <span className="league-item-dim">+320 pts</span>
              </div>
              <button className="create-league-btn">CREAR NUEVA LIGA</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


export default App;