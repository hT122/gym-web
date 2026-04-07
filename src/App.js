import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import './App.css';

// Lista de ejercicios (puedes añadir o quitar los que quieras aquí)
const EJERCICIOS_DISPONIBLES = [
  "Abdominales",
  "Aperturas con mancuernas",
  "Bíceps en polea",
  "Crunch en máquina",
  "Curl con barra",
  "Curl con mancuernas",
  "Curl de isquiotibiales",
  "Dominadas",
  "Elevaciones frontales",
  "Elevaciones laterales",
  "Extensiones de cadera",
  "Extensiones de tríceps",
  "Fondo en paralelas",
  "Jalón al pecho",
  "Leg Press (Prensa)",
  "Peso Muerto",
  "Peso Muerto Rumano",
  "Plancha",
  "Press Arnold",
  "Press de Banca",
  "Press de Banca Inclinado",
  "Press Francés",
  "Press Militar",
  "Remo con barra",
  "Remo en polea baja",
  "Sentadilla Búlgara",
  "Sentadilla Libre",
  "Sentadilla en Máquina Smith"
].sort(); // .sort() los ordenará alfabéticamente automáticamente

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('entrenar');
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [ejercicio, setEjercicio] = useState('Press de Banca');
  const [series, setSeries] = useState([{ peso: '', repes: '' }]);
  const [ejerciciosDelEntrenamiento, setEjerciciosDelEntrenamiento] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  // Efecto que carga el historial cuando el usuario entra en esa pestaña
  useEffect(() => {
    const cargarHistorial = async () => {
      if (!user || activeTab !== 'historial') return;
      try {
        const q = query(
          collection(db, "entrenamientos"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const entrenamientos = [];
        querySnapshot.forEach((doc) => {
          entrenamientos.push({ id: doc.id, ...doc.data() });
        });
        // Ordenamos los entrenamientos para que salgan los más recientes primero
        entrenamientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setHistorial(entrenamientos);
      } catch (error) {
        console.error("Error al cargar historial: ", error);
      }
    };
    
    cargarHistorial();
  }, [activeTab, user]);

  const agregarSerie = () => {
    setSeries([...series, { peso: '', repes: '' }]);
  };

  const eliminarSerie = (index) => {
    const nuevasSeries = series.filter((_, i) => i !== index);
    setSeries(nuevasSeries);
  };

  const actualizarSerie = (index, campo, valor) => {
    const nuevasSeries = [...series];
    nuevasSeries[index][campo] = valor;
    setSeries(nuevasSeries);
  };

  const agregarOtroEjercicio = () => {
    const seriesValidas = series.filter(s => s.peso && s.repes);
    if (seriesValidas.length === 0) {
      alert("Rellena al menos una serie válida antes de añadir otro ejercicio.");
      return;
    }
    
    setEjerciciosDelEntrenamiento([
      ...ejerciciosDelEntrenamiento,
      {
        nombre: ejercicio,
        series: seriesValidas.map(s => ({ peso: Number(s.peso), repes: Number(s.repes) }))
      }
    ]);
    
    setEjercicio('Press de Banca');
    setSeries([{ peso: '', repes: '' }]);
  };

  const editarEjercicioGuardado = (index) => {
    const ejAEditar = ejerciciosDelEntrenamiento[index];
    setEjercicio(ejAEditar.nombre);
    setSeries(ejAEditar.series);
    setEjerciciosDelEntrenamiento(ejerciciosDelEntrenamiento.filter((_, i) => i !== index));
  };

  const eliminarEjercicioGuardado = (index) => {
    if (window.confirm("¿Seguro que quieres eliminar este ejercicio de la sesión?")) {
      setEjerciciosDelEntrenamiento(ejerciciosDelEntrenamiento.filter((_, i) => i !== index));
    }
  };

  // Función para cargar un entrenamiento guardado en la vista de edición
  const editarEntrenamiento = (entrenamiento) => {
    setEditingWorkoutId(entrenamiento.id);
    setEjerciciosDelEntrenamiento(entrenamiento.ejercicios || []);
    setEjercicio('Press de Banca');
    setSeries([{ peso: '', repes: '' }]);
    setIsWorkoutStarted(true);
    setActiveTab('entrenar');
  };

  // Función para eliminar un entrenamiento del historial
  const eliminarEntrenamiento = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este entrenamiento de tu historial?")) {
      try {
        await deleteDoc(doc(db, "entrenamientos", id));
        // Actualizamos el estado para quitarlo de la pantalla inmediatamente
        setHistorial(historial.filter((entrenamiento) => entrenamiento.id !== id));
      } catch (error) {
        console.error("Error al eliminar: ", error);
        alert("Hubo un error al eliminar el entrenamiento.");
      }
    }
  };

  const finalizarEntrenamiento = async () => {
    const seriesValidas = series.filter(s => s.peso && s.repes);
    const ejerciciosFinales = [...ejerciciosDelEntrenamiento];
    
    if (seriesValidas.length > 0) {
      ejerciciosFinales.push({
        nombre: ejercicio,
        series: seriesValidas.map(s => ({ peso: Number(s.peso), repes: Number(s.repes) }))
      });
    }

    if (ejerciciosFinales.length === 0) {
      alert("Por favor, introduce al menos un ejercicio con peso y repeticiones.");
      return;
    }

    try {
      if (editingWorkoutId) {
        // Si estamos editando, actualizamos el documento existente
        const workoutRef = doc(db, "entrenamientos", editingWorkoutId);
        await updateDoc(workoutRef, { ejercicios: ejerciciosFinales });
        setEditingWorkoutId(null);
        alert("¡Entrenamiento actualizado con éxito!");
      } else {
        // Si es uno nuevo, creamos un documento nuevo
        await addDoc(collection(db, "entrenamientos"), {
          userId: user.uid,
          userName: user.displayName,
          ejercicios: ejerciciosFinales,
          fecha: new Date().toISOString()
        });
        alert("¡Entrenamiento guardado con éxito!");
      }
      
      setSeries([{ peso: '', repes: '' }]);
      setEjercicio('Press de Banca');
      setEjerciciosDelEntrenamiento([]);
      setIsWorkoutStarted(false);
    } catch (error) {
      console.error("Error al guardar: ", error);
      alert("Hubo un error al guardar tu entrenamiento.");
    }
  };

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
          <button onClick={() => setActiveTab('historial')} className={`menu-btn ${activeTab === 'historial' ? 'active' : ''}`}>
            Historial
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
          <h1>{activeTab === 'entrenar' ? 'Registro de Hoy' : activeTab === 'ligas' ? 'Global Rankings' : 'Historial'}</h1>
          <div className="points-badge">1,240 XP</div>
        </header>

        {activeTab === 'entrenar' ? (
          <div className="content">
            {!isWorkoutStarted ? (
              <div className="workout-card" style={{ textAlign: 'center' }}>
                <h3 className="card-title">Rutina Libre</h3>
                <p style={{ color: '#d7b4c1', marginBottom: '20px' }}>Realiza un entrenamiento vacío</p>
                <button className="finish-btn" onClick={() => {
                  setEditingWorkoutId(null);
                  setEjerciciosDelEntrenamiento([]);
                  setSeries([{ peso: '', repes: '' }]);
                  setIsWorkoutStarted(true);
                }}>
                  EMPEZAR ENTRENAMIENTO
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Lista de ejercicios ya guardados en esta sesión */}
                {ejerciciosDelEntrenamiento.map((ej, idx) => (
                  <div key={idx} className="workout-card" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ color: '#FFD7DF', margin: 0 }}>{ej.nombre}</h4>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => editarEjercicioGuardado(idx)}
                          style={{ backgroundColor: 'transparent', color: '#FFD7DF', border: '1px solid #FFD7DF', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarEjercicioGuardado(idx)}
                          style={{ backgroundColor: '#8a2b3b', color: '#FFD7DF', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                    {ej.series.map((s, i) => (
                      <p key={i} style={{ margin: '5px 0', fontSize: '14px', color: '#d7b4c1' }}>
                        Serie {i + 1}: {s.peso} kg x {s.repes} reps
                      </p>
                    ))}
                  </div>
                ))}
                <div className="workout-card">
                <h3 className="card-title">Añadir Ejercicio</h3>
                <label className="label">EJERCICIO</label>
                <select className="select" value={ejercicio} onChange={(e) => setEjercicio(e.target.value)}>
                  {EJERCICIOS_DISPONIBLES.map((ej, index) => (
                    <option key={index} value={ej}>{ej}</option>
                  ))}
                </select>
                
                {series.map((serie, index) => (
                  <div className="stats-row" key={index}>
                    <div className="input-group">
                      <label className="label">SERIE {index + 1} - PESO</label>
                      <input type="number" placeholder="0" className="input" value={serie.peso} onChange={(e) => actualizarSerie(index, 'peso', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="label">REPES</label>
                      <input type="number" placeholder="0" className="input" value={serie.repes} onChange={(e) => actualizarSerie(index, 'repes', e.target.value)} />
                    </div>
                    {index === series.length - 1 ? (
                      <button className="add-set-btn" onClick={agregarSerie}>+</button>
                    ) : (
                      <button className="add-set-btn" style={{ backgroundColor: '#8a2b3b', borderColor: '#8a2b3b' }} onClick={() => eliminarSerie(index)}>-</button>
                    )}
                  </div>
                ))}

                <button 
                  onClick={agregarOtroEjercicio} 
                  style={{ width: '100%', padding: '15px', backgroundColor: 'transparent', color: '#FFD7DF', border: '1px dashed #FFD7DF', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
                >
                  + AÑADIR OTRO EJERCICIO
                </button>
                <button className="finish-btn" onClick={finalizarEntrenamiento}>FINALIZAR ENTRENAMIENTO</button>
              </div>
            </div>
            )}
          </div>
        ) : activeTab === 'ligas' ? (
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
        ) : activeTab === 'historial' ? (
          <div className="content">
            {historial.length === 0 ? (
              <p style={{ color: '#d7b4c1', textAlign: 'center' }}>No tienes entrenamientos guardados aún.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {historial.map((entrenamiento) => (
                  <div key={entrenamiento.id} className="workout-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0f3321', paddingBottom: '10px', marginBottom: '15px' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>
                        {new Date(entrenamiento.fecha).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                      </h3>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => editarEntrenamiento(entrenamiento)}
                          style={{ backgroundColor: '#FFD7DF', color: '#1A5632', border: 'none', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarEntrenamiento(entrenamiento.id)}
                          style={{ backgroundColor: '#8a2b3b', color: '#FFD7DF', border: 'none', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    {entrenamiento.ejercicios && entrenamiento.ejercicios.map((ej, idx) => (
                      <div key={idx} style={{ marginBottom: '15px' }}>
                        <h4 style={{ color: '#FFD7DF', margin: '0 0 5px 0' }}>{ej.nombre}</h4>
                        {ej.series.map((s, i) => (
                          <p key={i} style={{ margin: '2px 0', fontSize: '14px', color: '#d7b4c1' }}>
                            Serie {i + 1}: {s.peso} kg x {s.repes} reps
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}


export default App;