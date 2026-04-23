import React from 'react';

export default function ModalConfirmar({ titulo, mensaje, textoConfirmar = 'Eliminar', onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{titulo}</h3>
        {mensaje && (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {mensaje}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
