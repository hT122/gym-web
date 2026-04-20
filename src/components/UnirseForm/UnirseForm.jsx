import React, { useState } from 'react';

export default function UnirseForm({ onUnirse, onCancelar, error }) {
  const [codigo, setCodigo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUnirse(codigo);
  };

  return (
    <div className="workout-card">
      <h3 className="card-title">Unirse a una liga</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          className="auth-input"
          placeholder="Código de 6 caracteres"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          maxLength={6}
          required
        />
        {error && <p className="auth-error">{error}</p>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="finish-btn" style={{ letterSpacing: '1px' }}>Unirse</button>
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
