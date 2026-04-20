import React from 'react';

export default function WorkoutHistorial({ historial, onEditar, onEliminar }) {
  return (
    <div className="historial-panel">
      <h2>Historial</h2>
      {historial.length === 0 ? (
        <p className="empty-state">No tienes entrenamientos guardados aún.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historial.map((entrenamiento) => (
            <div key={entrenamiento.id} className="historial-item">
              <p className="historial-item-date">
                {new Date(entrenamiento.fecha).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
              <div className="historial-item-actions">
                <button className="btn-historial-edit" onClick={() => onEditar(entrenamiento)}>Editar</button>
                <button className="btn-historial-delete" onClick={() => onEliminar(entrenamiento.id)}>Eliminar</button>
              </div>
              <hr className="historial-divider" />
              {entrenamiento.ejercicios && entrenamiento.ejercicios.map((ej, idx) => (
                <div key={idx} className="historial-ej-block">
                  <p className="historial-ej-nombre">{ej.nombre}</p>
                  {ej.series.map((s, i) => (
                    <p key={i} className="historial-serie">
                      Serie {i + 1}: {s.peso} kg × {s.repes} reps
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
