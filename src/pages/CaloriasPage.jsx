import React, { useState } from 'react';
import CaloriaCalculator from '../components/CaloriaCalculator/CaloriaCalculator';
import FoodTracker from '../components/FoodTracker/FoodTracker';
import { guardarObjetivoCalorico } from '../firebase/nutrition';
import { toast } from 'sonner';

export default function CaloriasPage({ user, userData }) {
  const [tab, setTab] = useState('seguimiento');

  const handleGuardarObjetivo = async (objetivo) => {
    try {
      await guardarObjetivoCalorico(user.uid, objetivo);
      toast.success('Objetivo calórico guardado');
      setTab('seguimiento');
    } catch {
      toast.error('Error al guardar el objetivo');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="historial-tabs" style={{ marginBottom: 24 }}>
        <button
          className={`historial-tab ${tab === 'seguimiento' ? 'historial-tab--active' : ''}`}
          onClick={() => setTab('seguimiento')}
        >
          Seguimiento diario
        </button>
        <button
          className={`historial-tab ${tab === 'calculadora' ? 'historial-tab--active' : ''}`}
          onClick={() => setTab('calculadora')}
        >
          Calculadora
        </button>
      </div>

      {tab === 'seguimiento' && (
        <FoodTracker user={user} userData={userData} />
      )}
      {tab === 'calculadora' && (
        <CaloriaCalculator onGuardarObjetivo={handleGuardarObjetivo} />
      )}
    </div>
  );
}
