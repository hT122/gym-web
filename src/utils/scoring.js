export const PUNTOS_CONFIG = {
  ASISTENCIA_BASE: 10,
  VOLUMEN_POR_1000KG: 2,
  BONUS_PR: 25,
  BONUS_STREAK_3: 5,
  BONUS_STREAK_7: 15,
  BONUS_STREAK_30: 50,
  PENALIZACION_VOLUMEN: -5,
};

export const calcularVolumenTotal = (ejercicios) =>
  ejercicios.reduce((total, ej) =>
    total + ej.series.reduce((sum, s) => sum + s.peso * s.repes, 0), 0);

export const calcularPuntos = ({ tuvoPR, streak, volumenActual, volumenAnterior }) => {
  const desglose = [];
  let total = 0;

  total += PUNTOS_CONFIG.ASISTENCIA_BASE;
  desglose.push({ concepto: 'Asistencia', puntos: PUNTOS_CONFIG.ASISTENCIA_BASE });

  const bonusVolumen = Math.floor(volumenActual / 1000) * PUNTOS_CONFIG.VOLUMEN_POR_1000KG;
  if (bonusVolumen > 0) {
    total += bonusVolumen;
    desglose.push({ concepto: `Volumen (${Math.round(volumenActual)} kg·reps)`, puntos: bonusVolumen });
  }

  if (tuvoPR) {
    total += PUNTOS_CONFIG.BONUS_PR;
    desglose.push({ concepto: '¡Récord Personal!', puntos: PUNTOS_CONFIG.BONUS_PR });
  }

  if (streak >= 30) {
    total += PUNTOS_CONFIG.BONUS_STREAK_30;
    desglose.push({ concepto: `Racha de ${streak} días`, puntos: PUNTOS_CONFIG.BONUS_STREAK_30 });
  } else if (streak >= 7) {
    total += PUNTOS_CONFIG.BONUS_STREAK_7;
    desglose.push({ concepto: `Racha de ${streak} días`, puntos: PUNTOS_CONFIG.BONUS_STREAK_7 });
  } else if (streak >= 3) {
    total += PUNTOS_CONFIG.BONUS_STREAK_3;
    desglose.push({ concepto: `Racha de ${streak} días`, puntos: PUNTOS_CONFIG.BONUS_STREAK_3 });
  }

  if (volumenAnterior > 0 && volumenActual < volumenAnterior * 0.9) {
    total += PUNTOS_CONFIG.PENALIZACION_VOLUMEN;
    desglose.push({ concepto: 'Volumen menor al anterior', puntos: PUNTOS_CONFIG.PENALIZACION_VOLUMEN });
  }

  return { total: Math.max(0, total), desglose };
};
