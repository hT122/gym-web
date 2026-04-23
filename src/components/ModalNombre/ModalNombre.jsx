import React, { useState, useEffect, useRef } from 'react';

export default function ModalNombre({ titulo, placeholder = 'Nombre...', onConfirmar, onCancelar }) {
  const [valor, setValor] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (valor.trim()) onConfirmar(valor.trim());
  };

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{titulo}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            ref={inputRef}
            className="input"
            placeholder={placeholder}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            maxLength={60}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="finish-btn" disabled={!valor.trim()}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
