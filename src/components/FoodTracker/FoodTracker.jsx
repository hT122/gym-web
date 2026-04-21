import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import ALIMENTOS from '../../constants/alimentos';
import { obtenerRegistroDiario, agregarAlimento, eliminarAlimento } from '../../firebase/nutrition';

const COMIDAS = [
  { id: 'desayuno', label: 'Desayuno' },
  { id: 'almuerzo', label: 'Almuerzo' },
  { id: 'cena',     label: 'Cena' },
  { id: 'snack',    label: 'Snacks' },
];

function fechaHoy() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function fechaOffset(base, days) {
  const [y, m, d] = base.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatFecha(fechaStr) {
  const hoy = fechaHoy();
  if (fechaStr === hoy) return 'Hoy';
  if (fechaStr === fechaOffset(hoy, -1)) return 'Ayer';
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function calcMacros(alimento, gramos) {
  const f = gramos / 100;
  return {
    calorias: Math.round(alimento.cal   * f),
    proteina: Math.round(alimento.prot  * f * 10) / 10,
    carbs:    Math.round(alimento.carbs * f * 10) / 10,
    grasa:    Math.round(alimento.grasa * f * 10) / 10,
  };
}

async function buscarAlimentoAPI(q) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&fields=product_name,nutriments,serving_size&page_size=10`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  const data = await res.json();
  return (data.products || [])
    .filter(p => p.product_name && (p.nutriments?.['energy-kcal_100g'] ?? 0) > 0)
    .map(p => {
      const porcion = parseInt(p.serving_size) || 100;
      return {
        nombre: p.product_name,
        cal:   Math.round(p.nutriments['energy-kcal_100g']       || 0),
        prot:  Math.round((p.nutriments['proteins_100g']          || 0) * 10) / 10,
        carbs: Math.round((p.nutriments['carbohydrates_100g']     || 0) * 10) / 10,
        grasa: Math.round((p.nutriments['fat_100g']               || 0) * 10) / 10,
        porcion: porcion > 0 ? porcion : 100,
        esExterno: true,
      };
    })
    .slice(0, 5);
}

// ── Food search inline form ───────────────────────────────────────────────────
function FoodAddForm({ onAdd, onCancel }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscandoApi, setBuscandoApi] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [gramos, setGramos] = useState('');
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim() || seleccionado) {
      setResultados([]);
      setBuscandoApi(false);
      clearTimeout(timerRef.current);
      return;
    }
    const q = query.toLowerCase().trim();
    const locales = ALIMENTOS.filter((a) => a.nombre.toLowerCase().includes(q)).slice(0, 5);
    setResultados(locales);

    clearTimeout(timerRef.current);
    if (q.length < 2) return;

    timerRef.current = setTimeout(async () => {
      setBuscandoApi(true);
      try {
        const externos = await buscarAlimentoAPI(q);
        setResultados(prev => {
          const nombresExistentes = new Set(prev.map(a => a.nombre.toLowerCase()));
          const nuevos = externos.filter(a => !nombresExistentes.has(a.nombre.toLowerCase()));
          return [...prev, ...nuevos].slice(0, 10);
        });
      } catch {
        // si la API falla, los resultados locales se mantienen
      } finally {
        setBuscandoApi(false);
      }
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [query, seleccionado]);

  const handleSelect = (alimento) => {
    setSeleccionado(alimento);
    setGramos(String(alimento.porcion));
    setResultados([]);
    setBuscandoApi(false);
    setQuery(alimento.nombre);
  };

  const preview = seleccionado && Number(gramos) > 0 ? calcMacros(seleccionado, Number(gramos)) : null;

  const handleConfirm = () => {
    if (!preview) return;
    onAdd({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nombre: seleccionado.nombre,
      gramos: Number(gramos),
      ...preview,
    });
  };

  const mostrarDropdown = resultados.length > 0 || buscandoApi;

  return (
    <div className="food-add-form">
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          className="input"
          style={{ marginBottom: 0 }}
          placeholder="Buscar alimento..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSeleccionado(null); }}
        />
        {mostrarDropdown && (
          <div className="food-dropdown">
            {resultados.map((a) => (
              <button key={a.nombre + (a.esExterno ? '_ext' : '')} className="food-dropdown-item" onClick={() => handleSelect(a)}>
                <span className="food-dropdown-name">{a.nombre}</span>
                <span className="food-dropdown-meta">{a.cal} kcal · {a.porcion}g</span>
              </button>
            ))}
            {buscandoApi && (
              <div className="food-dropdown-searching">Buscando online...</div>
            )}
          </div>
        )}
      </div>

      {seleccionado && (
        <div className="food-confirm-row">
          <div className="food-confirm-grams">
            <input
              className="input"
              type="number"
              min="1"
              max="2000"
              value={gramos}
              onChange={(e) => setGramos(e.target.value)}
              style={{ marginBottom: 0, width: 80, textAlign: 'center' }}
            />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>g</span>
          </div>
          {preview && (
            <span className="food-confirm-preview">
              {preview.calorias} kcal · {preview.proteina}p · {preview.carbs}c · {preview.grasa}g
            </span>
          )}
          <button className="finish-btn food-confirm-btn" onClick={handleConfirm} disabled={!preview}>
            Añadir
          </button>
          <button className="liga-action-btn secondary food-cancel-btn" onClick={onCancel}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── Meal section ──────────────────────────────────────────────────────────────
function MealSection({ comida, entries, onAdd, onDelete, addingTo, onStartAdd, onCancelAdd }) {
  const mealEntries = entries.filter((e) => e.comida === comida.id);
  const mealCals    = mealEntries.reduce((s, e) => s + e.calorias, 0);

  return (
    <div className="workout-card meal-section">
      <div className="meal-header">
        <span className="meal-name">{comida.label}</span>
        <span className="meal-cals">{mealCals > 0 ? `${mealCals} kcal` : ''}</span>
        <button className="meal-add-btn" onClick={() => onStartAdd(comida.id)}>+</button>
      </div>

      {mealEntries.length > 0 && (
        <div className="meal-entries">
          {mealEntries.map((entry) => (
            <div key={entry.id} className="meal-entry">
              <div className="meal-entry-info">
                <span className="meal-entry-name">{entry.nombre}</span>
                <span className="meal-entry-detail">
                  {entry.gramos}g · {entry.proteina}p · {entry.carbs}c · {entry.grasa}g
                </span>
              </div>
              <span className="meal-entry-cals">{entry.calorias} kcal</span>
              <button className="meal-entry-del" onClick={() => onDelete(entry.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {addingTo === comida.id && (
        <div style={{ marginTop: mealEntries.length > 0 ? 12 : 0 }}>
          <FoodAddForm
            onAdd={(entry) => onAdd({ ...entry, comida: comida.id })}
            onCancel={onCancelAdd}
          />
        </div>
      )}
    </div>
  );
}

// ── Macro progress bar ────────────────────────────────────────────────────────
function MacroProgress({ label, valor, objetivo, color }) {
  const pct  = objetivo > 0 ? Math.min((valor / objetivo) * 100, 100) : 0;
  const over = objetivo > 0 && valor > objetivo;
  return (
    <div className="tracker-macro-item">
      <div className="tracker-macro-top">
        <span className="tracker-macro-label">{label}</span>
        <span className="tracker-macro-nums" style={{ color: over ? 'var(--color-danger-text)' : 'var(--color-text-muted)' }}>
          {valor}g / {objetivo}g
        </span>
      </div>
      <div className="tracker-macro-track">
        <div
          className="tracker-macro-fill"
          style={{ width: `${pct}%`, background: over ? 'var(--color-danger-text)' : color }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FoodTracker({ user, userData }) {
  const [fecha,    setFecha]    = useState(fechaHoy);
  const [entries,  setEntries]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [addingTo, setAddingTo] = useState(null);
  const fetchingRef = useRef(false);

  const objetivo = userData?.objetivoCalorico || null;

  const fetchEntries = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setCargando(true);
    try {
      const data = await obtenerRegistroDiario(user.uid, fecha);
      setEntries(data);
    } catch (e) {
      console.error('FoodTracker fetch error:', e);
      toast.error('Error al cargar el registro. Revisa las reglas de Firestore.');
    } finally {
      setCargando(false);
      fetchingRef.current = false;
    }
  }, [user.uid, fecha]);

  useEffect(() => {
    fetchingRef.current = false;
    fetchEntries();
  }, [fetchEntries]);

  const handleAdd = async (entry) => {
    try {
      const updated = await agregarAlimento(user.uid, fecha, entry);
      setEntries(updated);
      setAddingTo(null);
    } catch {
      toast.error('Error al añadir el alimento');
    }
  };

  const handleDelete = async (entryId) => {
    try {
      const updated = await eliminarAlimento(user.uid, fecha, entryId);
      setEntries(updated);
    } catch {
      toast.error('Error al eliminar el alimento');
    }
  };

  const totalCals  = entries.reduce((s, e) => s + e.calorias, 0);
  const totalProt  = Math.round(entries.reduce((s, e) => s + e.proteina, 0) * 10) / 10;
  const totalCarbs = Math.round(entries.reduce((s, e) => s + e.carbs,    0) * 10) / 10;
  const totalGrasa = Math.round(entries.reduce((s, e) => s + e.grasa,    0) * 10) / 10;

  const metaCals  = objetivo?.calorias || 2000;
  const metaProt  = objetivo?.proteina || 150;
  const metaCarbs = objetivo?.carbs    || 200;
  const metaGrasa = objetivo?.grasa    || 67;

  const restantes = metaCals - totalCals;
  const pctCals   = Math.min((totalCals / metaCals) * 100, 100);
  const over      = totalCals > metaCals;
  const isHoy     = fecha === fechaHoy();

  return (
    <div className="tracker-layout">
      {/* Date nav */}
      <div className="tracker-date-nav">
        <button className="tracker-nav-btn" onClick={() => { setFecha(f => fechaOffset(f, -1)); setAddingTo(null); }}>‹</button>
        <span className="tracker-date-label">{formatFecha(fecha)}</span>
        <button className="tracker-nav-btn" onClick={() => { setFecha(f => fechaOffset(f, 1)); setAddingTo(null); }} disabled={isHoy}>›</button>
      </div>

      {/* Summary */}
      <div className="workout-card tracker-summary">
        <div className="tracker-summary-top">
          <div>
            <p className="tracker-big-num" style={{ color: over ? 'var(--color-danger-text)' : 'var(--color-text)' }}>
              {totalCals.toLocaleString()}
            </p>
            <p className="tracker-big-label">kcal consumidas</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="tracker-rem-num" style={{ color: over ? 'var(--color-danger-text)' : 'var(--color-text-2)' }}>
              {over ? `+${Math.abs(restantes)}` : restantes.toLocaleString()}
            </p>
            <p className="tracker-big-label">{over ? 'kcal de exceso' : 'kcal restantes'}</p>
          </div>
        </div>

        <div className="tracker-cal-track">
          <div
            className="tracker-cal-fill"
            style={{ width: `${pctCals}%`, background: over ? 'var(--color-danger-text)' : 'var(--color-accent)' }}
          />
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '6px 0 0', textAlign: 'right' }}>
          Objetivo: {metaCals.toLocaleString()} kcal
        </p>

        <div className="tracker-macros">
          <MacroProgress label="Proteína"      valor={totalProt}  objetivo={metaProt}  color="var(--color-text)" />
          <MacroProgress label="Carbohidratos" valor={totalCarbs} objetivo={metaCarbs} color="var(--color-text-3)" />
          <MacroProgress label="Grasas"        valor={totalGrasa} objetivo={metaGrasa} color="var(--color-text-muted)" />
        </div>
      </div>

      {!objetivo && (
        <p className="tracker-no-goal">
          Sin objetivo calórico definido. Ve a la pestaña <strong>Calculadora</strong> y guarda tu objetivo.
        </p>
      )}

      {cargando ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
          Cargando...
        </p>
      ) : (
        COMIDAS.map((comida) => (
          <MealSection
            key={comida.id}
            comida={comida}
            entries={entries}
            onAdd={handleAdd}
            onDelete={handleDelete}
            addingTo={addingTo}
            onStartAdd={setAddingTo}
            onCancelAdd={() => setAddingTo(null)}
          />
        ))
      )}
    </div>
  );
}
