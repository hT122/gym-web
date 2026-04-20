import React, { useState } from 'react';

const ACTIVIDAD = [
  { value: 1.2,   label: 'Estilo de vida sedentario',  desc: 'Poco o ningún ejercicio' },
  { value: 1.375, label: 'Actividad ligera',            desc: 'Ejercicio 1–3 días/semana' },
  { value: 1.55,  label: 'Actividad moderada',          desc: 'Ejercicio 3–5 días/semana' },
  { value: 1.725, label: 'Actividad elevada',           desc: 'Ejercicio 6–7 días/semana' },
];

const OBJETIVOS = [
  { value: 'mantener', label: 'Mantenimiento del peso', factor: 1.0,  color: '#111' },
  { value: 'perder',   label: 'Perder peso',            factor: 0.8,  color: '#c0392b' },
  { value: 'ganar',    label: 'Ganar peso',             factor: 1.1,  color: '#27ae60' },
];

function calcular({ unidad, peso, altCm, altFt, altIn, edad, genero, actividad, objetivo }) {
  let pesoKg = unidad === 'metric' ? parseFloat(peso) : parseFloat(peso) * 0.453592;
  let alturaCm = unidad === 'metric'
    ? parseFloat(altCm)
    : parseFloat(altFt) * 30.48 + parseFloat(altIn || 0) * 2.54;

  if (!pesoKg || !alturaCm || !edad) return null;

  const bmr = genero === 'hombre'
    ? 10 * pesoKg + 6.25 * alturaCm - 5 * parseInt(edad) + 5
    : 10 * pesoKg + 6.25 * alturaCm - 5 * parseInt(edad) - 161;

  const tdee = bmr * actividad;
  const obj = OBJETIVOS.find((o) => o.value === objetivo);
  const calorias = Math.round(tdee * obj.factor);

  const proteina = Math.round(pesoKg * 2);
  const grasa    = Math.round((calorias * 0.25) / 9);
  const carbs    = Math.round((calorias - proteina * 4 - grasa * 9) / 4);

  return {
    calorias,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    proteina,
    carbs: Math.max(0, carbs),
    grasa,
    objetivo: obj,
  };
}

function MacroBar({ label, grams, cals, color, pct }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{grams}g <span style={{ color: '#aaa', fontWeight: 400 }}>· {cals} kcal</span></span>
      </div>
      <div style={{ background: '#f0f0f0', borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 99, height: '100%', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function CaloriaCalculator() {
  const [unidad, setUnidad]     = useState('metric');
  const [peso, setPeso]         = useState('');
  const [altCm, setAltCm]       = useState('');
  const [altFt, setAltFt]       = useState('');
  const [altIn, setAltIn]       = useState('');
  const [edad, setEdad]         = useState('');
  const [genero, setGenero]     = useState('hombre');
  const [actividad, setActividad] = useState(1.2);
  const [objetivo, setObjetivo] = useState('mantener');
  const [resultado, setResultado] = useState(null);

  const handleCalcular = (e) => {
    e.preventDefault();
    const res = calcular({ unidad, peso, altCm, altFt, altIn, edad, genero, actividad, objetivo });
    setResultado(res);
  };

  const maxMacro = resultado ? Math.max(resultado.proteina, resultado.carbs, resultado.grasa) : 1;

  return (
    <div className="calc-layout">
      {/* FORMULARIO */}
      <div className="workout-card calc-form-card">
        <h3 className="card-title">Calculadora de Calorías</h3>

        {/* Toggle unidad */}
        <div className="calc-unit-toggle">
          <button
            type="button"
            className={`calc-unit-btn ${unidad === 'metric' ? 'active' : ''}`}
            onClick={() => setUnidad('metric')}
          >
            kg / cm
          </button>
          <button
            type="button"
            className={`calc-unit-btn ${unidad === 'imperial' ? 'active' : ''}`}
            onClick={() => setUnidad('imperial')}
          >
            lb / ft
          </button>
        </div>

        <form onSubmit={handleCalcular} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Peso y altura */}
          <div className="calc-row">
            <div className="input-group">
              <label className="label">{unidad === 'metric' ? 'PESO (kg)' : 'PESO (lb)'}</label>
              <input className="input" type="number" placeholder="0" value={peso} onChange={(e) => setPeso(e.target.value)} required />
            </div>

            {unidad === 'metric' ? (
              <div className="input-group">
                <label className="label">ALTURA (cm)</label>
                <input className="input" type="number" placeholder="0" value={altCm} onChange={(e) => setAltCm(e.target.value)} required />
              </div>
            ) : (
              <>
                <div className="input-group">
                  <label className="label">ALTURA (ft)</label>
                  <input className="input" type="number" placeholder="0" value={altFt} onChange={(e) => setAltFt(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="label">PULGADAS (in)</label>
                  <input className="input" type="number" placeholder="0" value={altIn} onChange={(e) => setAltIn(e.target.value)} />
                </div>
              </>
            )}

            <div className="input-group">
              <label className="label">EDAD</label>
              <input className="input" type="number" placeholder="0" value={edad} onChange={(e) => setEdad(e.target.value)} required />
            </div>
          </div>

          {/* Género */}
          <div>
            <label className="label">GÉNERO</label>
            <div className="calc-unit-toggle" style={{ width: 'fit-content' }}>
              <button type="button" className={`calc-unit-btn ${genero === 'hombre' ? 'active' : ''}`} onClick={() => setGenero('hombre')}>Hombre</button>
              <button type="button" className={`calc-unit-btn ${genero === 'mujer' ? 'active' : ''}`} onClick={() => setGenero('mujer')}>Mujer</button>
            </div>
          </div>

          {/* Nivel de actividad */}
          <div>
            <label className="label">NIVEL DE ACTIVIDAD</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ACTIVIDAD.map((a) => (
                <label key={a.value} className={`calc-option ${actividad === a.value ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="actividad"
                    value={a.value}
                    checked={actividad === a.value}
                    onChange={() => setActividad(a.value)}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: actividad === a.value ? '#111' : '#555' }}>{a.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>{a.desc}</p>
                  </div>
                  {actividad === a.value && <span className="calc-option-check">✓</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <label className="label">OBJETIVO</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {OBJETIVOS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`calc-goal-btn ${objetivo === o.value ? 'active' : ''}`}
                  onClick={() => setObjetivo(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="finish-btn">CALCULAR</button>
        </form>
      </div>

      {/* RESULTADOS */}
      {resultado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Calorías principales */}
          <div className="workout-card" style={{ textAlign: 'center' }}>
            <p className="label" style={{ marginBottom: 8 }}>CALORÍAS DIARIAS RECOMENDADAS</p>
            <p className="calc-result-number" style={{ color: resultado.objetivo.color }}>
              {resultado.calorias.toLocaleString()}
            </p>
            <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>kcal / día · {resultado.objetivo.label}</p>
            <div className="calc-tdee-row">
              <div className="calc-tdee-item">
                <p className="calc-tdee-value">{resultado.bmr.toLocaleString()}</p>
                <p className="calc-tdee-label">BMR</p>
              </div>
              <div style={{ width: 1, background: '#f0f0f0' }} />
              <div className="calc-tdee-item">
                <p className="calc-tdee-value">{resultado.tdee.toLocaleString()}</p>
                <p className="calc-tdee-label">TDEE</p>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="workout-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Macronutrientes</h3>
            <MacroBar
              label="PROTEÍNA"
              grams={resultado.proteina}
              cals={resultado.proteina * 4}
              color="#111"
              pct={(resultado.proteina / maxMacro) * 100}
            />
            <MacroBar
              label="CARBOHIDRATOS"
              grams={resultado.carbs}
              cals={resultado.carbs * 4}
              color="#555"
              pct={(resultado.carbs / maxMacro) * 100}
            />
            <MacroBar
              label="GRASAS"
              grams={resultado.grasa}
              cals={resultado.grasa * 9}
              color="#aaa"
              pct={(resultado.grasa / maxMacro) * 100}
            />
          </div>
        </div>
      )}
    </div>
  );
}
