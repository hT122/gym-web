import React, { useState } from 'react';
import CrearLigaForm from '../CrearLigaForm/CrearLigaForm';
import UnirseForm from '../UnirseForm/UnirseForm';

export default function LigaList({ misLigas, onSelectLiga, onCrearLiga, onUnirseALiga, ligaError }) {
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false);
  const [mostrarFormUnirse, setMostrarFormUnirse] = useState(false);

  const handleCrear = async (nombre) => {
    await onCrearLiga(nombre);
    setMostrarFormCrear(false);
  };

  const handleUnirse = async (codigo) => {
    await onUnirseALiga(codigo);
    setMostrarFormUnirse(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="liga-action-btn"
          onClick={() => { setMostrarFormCrear(true); setMostrarFormUnirse(false); }}
        >
          + Crear liga
        </button>
        <button
          className="liga-action-btn secondary"
          onClick={() => { setMostrarFormUnirse(true); setMostrarFormCrear(false); }}
        >
          Unirse con código
        </button>
      </div>

      {mostrarFormCrear && (
        <CrearLigaForm
          onCrear={handleCrear}
          onCancelar={() => setMostrarFormCrear(false)}
          error={ligaError}
        />
      )}

      {mostrarFormUnirse && (
        <UnirseForm
          onUnirse={handleUnirse}
          onCancelar={() => setMostrarFormUnirse(false)}
          error={ligaError}
        />
      )}

      {misLigas.length === 0 && !mostrarFormCrear && !mostrarFormUnirse && (
        <p className="empty-state">No perteneces a ninguna liga todavía.</p>
      )}

      {misLigas.map((liga) => (
        <div key={liga.id} className="workout-card liga-card" onClick={() => onSelectLiga(liga)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="liga-nombre">{liga.nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="liga-codigo-text">Código: {liga.codigoInvitacion}</span>
                <button
                  className="copy-btn"
                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(liga.codigoInvitacion); }}
                  title="Copiar código"
                >
                  📋
                </button>
              </div>
            </div>
            <span style={{ color: '#aaa', fontSize: '20px' }}>›</span>
          </div>
        </div>
      ))}
    </div>
  );
}
