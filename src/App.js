import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { styles } from './styles';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('entrenar');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div style={styles.loginPage}>
        <h1 style={styles.logo}>Fantasy Gym League</h1>
        <p style={{color: '#888', marginBottom: '20px'}}>Compite. Entrena. Gana.</p>
        <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} style={styles.loginBtn}>
          Continuar con Google
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* SIDEBAR ESTILO FGL */}
      <nav style={styles.sidebar}>
        <h2 style={styles.sidebarLogo}>FGL</h2>
        
        <div style={styles.menu}>
          <button onClick={() => setActiveTab('entrenar')} style={activeTab === 'entrenar' ? styles.activeMenuBtn : styles.menuBtn}>
            Entrenar
          </button>
          <button onClick={() => setActiveTab('ligas')} style={activeTab === 'ligas' ? styles.activeMenuBtn : styles.menuBtn}>
            Ligas Fantasy
          </button>
          <button style={styles.menuBtn}>
            Perfil
          </button>
        </div>

        <div style={styles.userSection}>
          <img src={user.photoURL} alt="profile" style={styles.avatar} />
          <div style={{marginLeft: '10px'}}>
            <p style={{fontSize: '14px', fontWeight: 'bold', margin: 0}}>{user.displayName}</p>
            <button onClick={() => signOut(auth)} style={styles.logoutBtn}>Cerrar sesión</button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={{fontSize: '24px'}}>{activeTab === 'entrenar' ? 'Registro de Hoy' : 'Global Rankings'}</h1>
          <div style={styles.pointsBadge}>1,240 XP</div>
        </header>

        {activeTab === 'entrenar' ? (
          <div style={styles.content}>
            <div style={styles.workoutCard}>
              <h3 style={{color: '#d7ff00', marginBottom: '15px'}}>Nueva Sesión</h3>
              <label style={styles.label}>EJERCICIO</label>
              <select style={styles.select}>
                <option>Press de Banca</option>
                <option>Sentadilla Libre</option>
                <option>Dominadas</option>
              </select>
              
              <div style={styles.statsRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>PESO (KG)</label>
                  <input type="number" placeholder="0" style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>REPES</label>
                  <input type="number" placeholder="0" style={styles.input} />
                </div>
                <button style={styles.addSetBtn}>+</button>
              </div>

              <button style={styles.finishBtn}>FINALIZAR ENTRENAMIENTO</button>
            </div>
          </div>
        ) : (
          <div style={styles.content}>
            <div style={styles.workoutCard}>
              <h3 style={{color: '#d7ff00'}}>Tus Ligas</h3>
              <div style={styles.leagueItem}>
                <span>1. Los Primos Gym</span>
                <span style={{color: '#d7ff00'}}>+450 pts</span>
              </div>
              <div style={styles.leagueItem}>
                <span>2. Warriors League</span>
                <span style={{color: '#888'}}>+320 pts</span>
              </div>
              <button style={styles.createLeagueBtn}>CREAR NUEVA LIGA</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


export default App;