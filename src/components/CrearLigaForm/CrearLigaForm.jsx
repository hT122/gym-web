import React, { useState } from 'react';

export default function CrearLigaForm({ onCrear, onCancelar, error }) {
  const [nombre, setNombre] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCrear(nombre.trim());
  };

  return (
    <div className="workout-card">
      <h3 className="card-title">Nueva liga</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <input
            className="auth-input"
            placeholder="Nombre de la liga"
            value={nombre}
            onChange={(e) => e.target.value.length <= 50 && setNombre(e.target.value)}
            maxLength={50}
            required
          />
          <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0', textAlign: 'right' }}>{nombre.length}/50</p>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="finish-btn" style={{ letterSpacing: '1px' }}>Crear</button>
          <button
            type="button"
            className="liga-action-btn secondary"
            style={{ flex: 1 }}
            onClick={onCancelar}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
