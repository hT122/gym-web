import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { obtenerPlantillas, eliminarPlantilla } from '../../firebase/templates';

export default function WorkoutStarter({ user, onStart, onCargarPlantilla }) {
  const [plantillas, setPlantillas] = useState([]);

  useEffect(() => {
    if (!user) return;
    obtenerPlantillas(user.uid).then(setPlantillas);
  }, [user]);

  const handleEliminar = async (e, id) => {
    e.stopPropagation();
    await eliminarPlantilla(id);
    setPlantillas((prev) => prev.filter((p) => p.id !== id));
    toast('Plantilla eliminada');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workout-card" style={{ textAlign: 'center' }}>
        <h3 className="card-title">Rutina Libre</h3>
        <p style={{ color: 'var(--color-text-3)', marginBottom: '24px', fontSize: '14px' }}>
          Registra tu sesión de hoy
        </p>
        <button className="finish-btn" onClick={onStart}>
          EMPEZAR ENTRENAMIENTO
        </button>
      </div>

      {plantillas.length > 0 && (
        <div className="workout-card">
          <h3 className="card-title">Mis plantillas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plantillas.map((p) => (
              <div key={p.id} className="plantilla-item">
                <div className="plantilla-info" onClick={() => onCargarPlantilla(p)}>
                  <p className="plantilla-nombre">{p.nombre}</p>
                  <p className="plantilla-detalle">
                    {p.ejercicios.length} ejercicio{p.ejercicios.length !== 1 ? 's' : ''}
                    {' · '}
                    {p.ejercicios.map(e => e.nombre).join(', ').slice(0, 40)}
                    {p.ejercicios.map(e => e.nombre).join(', ').length > 40 ? '...' : ''}
                  </p>
                </div>
                <button className="btn-delete" onClick={(e) => handleEliminar(e, p.id)}>Borrar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
