import React, { useState, useRef, useEffect } from 'react';
import EJERCICIOS_DISPONIBLES from '../../constants/ejercicios';

export default function WorkoutForm({
  ejercicio,
  setEjercicio,
  series,
  setSeries,
  ejerciciosDelEntrenamiento,
  onAgregarOtroEjercicio,
  onEditarEjercicioGuardado,
  onEliminarEjercicioGuardado,
  onFinalizar,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  const ejerciciosFiltrados = EJERCICIOS_DISPONIBLES.filter((ej) =>
    ej.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const seleccionarEjercicio = (ej) => {
    setEjercicio(ej);
    setBusqueda('');
    setDropdownOpen(false);
  };

  const agregarSerie = () => setSeries([...series, { peso: '', repes: '' }]);

  const eliminarSerie = (index) => setSeries(series.filter((_, i) => i !== index));

  const actualizarSerie = (index, campo, valor) => {
    const nuevasSeries = [...series];
    nuevasSeries[index][campo] = valor;
    setSeries(nuevasSeries);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {ejerciciosDelEntrenamiento.map((ej, idx) => (
        <div key={idx} className="exercise-item">
          <div className="exercise-item-header">
            <h4 className="exercise-item-name">{ej.nombre}</h4>
            <div className="exercise-item-actions">
              <button className="btn-edit" onClick={() => onEditarEjercicioGuardado(idx)}>Editar</button>
              <button className="btn-delete" onClick={() => onEliminarEjercicioGuardado(idx)}>Borrar</button>
            </div>
          </div>
          {ej.series.map((s, i) => (
            <p key={i} className="serie-text">Serie {i + 1}: {s.peso} kg × {s.repes} reps</p>
          ))}
        </div>
      ))}

      <div className="workout-card">
        <div className="ejercicio-selected">{ejercicio}</div>
        <div className="ejercicio-search-wrapper" ref={searchRef}>
          <input
            className="input"
            placeholder="Buscar ejercicio..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            style={{ marginBottom: 0 }}
          />
          {dropdownOpen && (
            <div className="ejercicio-dropdown">
              {ejerciciosFiltrados.length === 0 && (
                <p className="ejercicio-dropdown-empty">Sin resultados</p>
              )}
              {ejerciciosFiltrados.map((ej) => (
                <button
                  key={ej}
                  type="button"
                  className={`ejercicio-dropdown-item ${ej === ejercicio ? 'active' : ''}`}
                  onClick={() => seleccionarEjercicio(ej)}
                >
                  {ej}
                </button>
              ))}
            </div>
          )}
        </div>

        {series.map((serie, index) => (
          <div className="stats-row" key={index}>
            <div className="input-group">
              <label className="label">SERIE {index + 1} — PESO (kg)</label>
              <input
                type="number"
                placeholder="0"
                className="input"
                value={serie.peso}
                onChange={(e) => actualizarSerie(index, 'peso', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="label">REPS</label>
              <input
                type="number"
                placeholder="0"
                className="input"
                value={serie.repes}
                onChange={(e) => actualizarSerie(index, 'repes', e.target.value)}
              />
            </div>
            {index === series.length - 1 ? (
              <button className="add-set-btn" onClick={agregarSerie}>+</button>
            ) : (
              <button className="add-set-btn" onClick={() => eliminarSerie(index)}>−</button>
            )}
          </div>
        ))}

        <button className="add-exercise-btn" onClick={onAgregarOtroEjercicio}>
          + AÑADIR OTRO EJERCICIO
        </button>
        <button className="finish-btn" onClick={onFinalizar}>
          FINALIZAR ENTRENAMIENTO
        </button>
      </div>
    </div>
  );
}
