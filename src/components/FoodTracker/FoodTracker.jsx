import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import ALIMENTOS from '../../constants/alimentos';
import { obtenerRegistroDiario, agregarAlimento, eliminarAlimento, guardarObjetivoCalorico } from '../../firebase/nutrition';

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

async function buscarPorCodigoBarras(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,nutriments,serving_size`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const porcion = parseInt(p.serving_size) || 100;
  return {
    nombre: p.product_name || 'Producto desconocido',
    cal:   Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
    prot:  Math.round((p.nutriments?.['proteins_100g'] || 0) * 10) / 10,
    carbs: Math.round((p.nutriments?.['carbohydrates_100g'] || 0) * 10) / 10,
    grasa: Math.round((p.nutriments?.['fat_100g'] || 0) * 10) / 10,
    porcion: porcion > 0 ? porcion : 100,
    esExterno: true,
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

// ── Barcode scanner ───────────────────────────────────────────────────────────
function BarcodeScanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const hasDetector = 'BarcodeDetector' in window;

  const handleBarcode = useCallback(async (code) => {
    cancelAnimationFrame(rafRef.current);
    setBuscando(true);
    setError('');
    try {
      const alimento = await buscarPorCodigoBarras(code);
      if (alimento) {
        onResult(alimento);
      } else {
        setError(`Código ${code} no encontrado. Prueba otro o busca por nombre.`);
        setBuscando(false);
      }
    } catch {
      setError('Error al buscar el producto. Comprueba tu conexión.');
      setBuscando(false);
    }
  }, [onResult]);

  useEffect(() => {
    let cancelled = false;

    const scanLoop = async () => {
      if (!videoRef.current || !detectorRef.current || cancelled) return;
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0 && !cancelled) {
          handleBarcode(barcodes[0].rawValue);
          return;
        }
      } catch { /* video not ready */ }
      if (!cancelled) rafRef.current = requestAnimationFrame(scanLoop);
    };

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        if (hasDetector) {
          detectorRef.current = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
          scanLoop();
        }
      })
      .catch(() => { if (!cancelled) setCameraError(true); });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [handleBarcode, hasDetector]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) handleBarcode(manualCode.trim());
  };

  return (
    <div className="barcode-scanner">
      {!cameraError && (
        <div className="barcode-viewfinder">
          <video ref={videoRef} className="barcode-video" muted playsInline />
          <div className="barcode-reticle" />
          {buscando && <div className="barcode-overlay">Buscando producto...</div>}
          {!hasDetector && !buscando && (
            <div className="barcode-overlay barcode-overlay--hint">
              Escáner no disponible en este navegador
            </div>
          )}
        </div>
      )}
      {error && <p className="barcode-error">{error}</p>}
      <form onSubmit={handleManualSubmit} className="barcode-manual-row">
        <input
          className="input"
          style={{ marginBottom: 0, flex: 1 }}
          placeholder="O escribe el código de barras..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          inputMode="numeric"
        />
        <button type="submit" className="finish-btn" style={{ flexShrink: 0, padding: '0 16px', height: 44 }}>↵</button>
      </form>
      <button className="liga-action-btn secondary" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>
        Cancelar
      </button>
    </div>
  );
}

// ── Food search inline form ───────────────────────────────────────────────────
function FoodAddForm({ onAdd, onCancel }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscandoApi, setBuscandoApi] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [gramos, setGramos] = useState('');
  const [showScanner, setShowScanner] = useState(false);
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

  if (showScanner) {
    return (
      <BarcodeScanner
        onResult={(alimento) => { setShowScanner(false); handleSelect(alimento); }}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  return (
    <div className="food-add-form">
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            className="input"
            style={{ marginBottom: 0, flex: 1 }}
            placeholder="Buscar alimento..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSeleccionado(null); }}
          />
          <button
            type="button"
            className="barcode-scan-btn"
            onClick={() => setShowScanner(true)}
            title="Escanear código de barras"
            aria-label="Escanear código de barras"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="17" y="2" width="5" height="5" rx="1"/>
              <rect x="2" y="17" width="5" height="5" rx="1"/>
              <line x1="8" y1="4" x2="9" y2="4"/><line x1="12" y1="4" x2="16" y2="4"/>
              <line x1="4" y1="8" x2="4" y2="9"/><line x1="4" y1="12" x2="4" y2="16"/>
              <line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/>
            </svg>
          </button>
        </div>
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

// ── Macro goal editor ─────────────────────────────────────────────────────────
function MacroGoalEditor({ objetivo, userId, onSaved }) {
  const [cals,  setCals]  = useState(String(objetivo?.calorias || 2000));
  const [prot,  setProt]  = useState(String(objetivo?.proteina || 150));
  const [carbs, setCarbs] = useState(String(objetivo?.carbs    || 200));
  const [grasa, setGrasa] = useState(String(objetivo?.grasa    || 67));
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    const obj = {
      calorias: Math.max(1, parseInt(cals) || 2000),
      proteina: Math.max(0, parseInt(prot) || 150),
      carbs:    Math.max(0, parseInt(carbs) || 200),
      grasa:    Math.max(0, parseInt(grasa) || 67),
    };
    setSaving(true);
    try {
      await guardarObjetivoCalorico(userId, obj);
      onSaved();
    } catch {
      toast.error('Error al guardar los objetivos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="macro-goal-editor" onSubmit={handleSave}>
      <div className="macro-goal-grid">
        {[
          { label: 'Calorías', value: cals, set: setCals, unit: 'kcal' },
          { label: 'Proteína', value: prot, set: setProt, unit: 'g' },
          { label: 'Carbohidratos', value: carbs, set: setCarbs, unit: 'g' },
          { label: 'Grasas', value: grasa, set: setGrasa, unit: 'g' },
        ].map(({ label, value, set, unit }) => (
          <div key={label} className="macro-goal-field">
            <label className="label">{label.toUpperCase()}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                className="input"
                type="number"
                min="0"
                value={value}
                onChange={(e) => set(e.target.value)}
                style={{ marginBottom: 0, flex: 1 }}
              />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>
      <button type="submit" className="finish-btn" style={{ marginTop: 12 }} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar objetivos'}
      </button>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FoodTracker({ user, userData }) {
  const [fecha,           setFecha]           = useState(fechaHoy);
  const [entries,         setEntries]         = useState([]);
  const [cargando,        setCargando]        = useState(true);
  const [addingTo,        setAddingTo]        = useState(null);
  const [editandoMetas,   setEditandoMetas]   = useState(false);
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 0' }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
            Objetivo: {metaCals.toLocaleString()} kcal
          </p>
          <button
            className="tracker-edit-goals-btn"
            onClick={() => setEditandoMetas((v) => !v)}
          >
            {editandoMetas ? 'Cancelar' : 'Editar objetivos'}
          </button>
        </div>

        {editandoMetas ? (
          <MacroGoalEditor
            objetivo={objetivo}
            userId={user.uid}
            onSaved={() => setEditandoMetas(false)}
          />
        ) : (
          <div className="tracker-macros">
            <MacroProgress label="Proteína"      valor={totalProt}  objetivo={metaProt}  color="var(--color-text)" />
            <MacroProgress label="Carbohidratos" valor={totalCarbs} objetivo={metaCarbs} color="var(--color-text-3)" />
            <MacroProgress label="Grasas"        valor={totalGrasa} objetivo={metaGrasa} color="var(--color-text-muted)" />
          </div>
        )}
      </div>

      {!objetivo && !editandoMetas && (
        <p className="tracker-no-goal">
          Sin objetivo definido.{' '}
          <button className="tracker-no-goal-link" onClick={() => setEditandoMetas(true)}>
            Establecer objetivos
          </button>
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
