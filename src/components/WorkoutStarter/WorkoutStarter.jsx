import React from 'react';

export default function WorkoutStarter({ onStart }) {
  return (
    <div className="workout-card" style={{ textAlign: 'center' }}>
      <h3 className="card-title">Rutina Libre</h3>
      <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
        Registra tu sesión de hoy
      </p>
      <button className="finish-btn" onClick={onStart}>
        EMPEZAR ENTRENAMIENTO
      </button>
    </div>
  );
}
