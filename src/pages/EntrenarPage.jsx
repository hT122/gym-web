import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { actualizarDespuesDeEntrenamiento, obtenerDatosHistoricos, obtenerPRsDetallados, recalcularPuntosTotales, recalcularStreakYFecha } from '../firebase/users';
import { actualizarPuntosEnLigas, recalcularPuntosEnLigas } from '../firebase/leagues';
import { guardarPlantilla } from '../firebase/templates';
import { calcularVolumenTotal, calcularPuntos } from '../utils/scoring';
import WorkoutStarter from '../components/WorkoutStarter/WorkoutStarter';
import WorkoutForm from '../components/WorkoutForm/WorkoutForm';
import WorkoutHistorial from '../components/WorkoutHistorial/WorkoutHistorial';
import ModalNombre from '../components/ModalNombre/ModalNombre';
import { toast } from 'sonner';

export default function EntrenarPage({ user, userData, onRefrescarUsuario }) {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [ejercicio, setEjercicio] = useState('Press de Banca');
  const [series, setSeries] = useState([{ peso: '', repes: '' }]);
  const [ejerciciosDelEntrenamiento, setEjerciciosDelEntrenamiento] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [historialVisible, setHistorialVisible] = useState(15);
  const [prs, setPrs] = useState({});
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [ejerciciosParaPlantilla, setEjerciciosParaPlantilla] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarHistorial = async () => {
    if (!user) return;
    setCargandoHistorial(true);
    try {
      const q = query(collection(db, 'entrenamientos'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const entrenamientos = [];
      querySnapshot.forEach((doc) => entrenamientos.push({ id: doc.id, ...doc.data() }));
      entrenamientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setHistorial(entrenamientos);
    } catch (error) {
      console.error('Error al cargar historial: ', error);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cargarPRs = async () => {
    if (!user) return;
    const data = await obtenerPRsDetallados(user.uid);
    setPrs(data);
  };

  useEffect(() => {
    cargarHistorial();
    cargarPRs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStart = () => {
    setEditingWorkoutId(null);
    setEjerciciosDelEntrenamiento([]);
    setSeries([{ peso: '', repes: '' }]);
    setIsWorkoutStarted(true);
  };

  const cargarPlantilla = (plantilla) => {
    setEditingWorkoutId(null);
    setEjerciciosDelEntrenamiento(plantilla.ejercicios);
    setSeries([{ peso: '', repes: '' }]);
    setIsWorkoutStarted(true);
    toast.success(`Plantilla "${plantilla.nombre}" cargada`);
  };

  const handleGuardarPlantilla = () => {
    const seriesValidas = series.filter((s) => s.peso && s.repes);
    const ejerciciosFinales = [...ejerciciosDelEntrenamiento];
    if (seriesValidas.length > 0) {
      ejerciciosFinales.push({
        nombre: ejercicio,
        series: seriesValidas.map((s) => ({ peso: Number(s.peso), repes: Number(s.repes) })),
      });
    }
    if (ejerciciosFinales.length === 0) {
      toast.error('Añade al menos un ejercicio antes de guardar la plantilla');
      return;
    }
    setEjerciciosParaPlantilla(ejerciciosFinales);
  };

  const confirmarGuardarPlantilla = async (nombre) => {
    try {
      await guardarPlantilla(user.uid, nombre, ejerciciosParaPlantilla);
      toast.success('Plantilla guardada correctamente');
    } catch {
      toast.error('Error al guardar la plantilla');
    } finally {
      setEjerciciosParaPlantilla(null);
    }
  };

  const agregarOtroEjercicio = () => {
    const seriesValidas = series.filter((s) => s.peso && s.repes);
    if (seriesValidas.length === 0) {
      toast.error('Rellena al menos una serie válida antes de continuar.');
      return;
    }
    setEjerciciosDelEntrenamiento([
      ...ejerciciosDelEntrenamiento,
      { nombre: ejercicio, series: seriesValidas.map((s) => ({ peso: Number(s.peso), repes: Number(s.repes) })) },
    ]);
    setEjercicio('Press de Banca');
    setSeries([{ peso: '', repes: '' }]);
  };

  const editarEjercicioGuardado = (index) => {
    const ejAEditar = ejerciciosDelEntrenamiento[index];
    setEjercicio(ejAEditar.nombre);
    setSeries(ejAEditar.series);
    setEjerciciosDelEntrenamiento(ejerciciosDelEntrenamiento.filter((_, i) => i !== index));
  };

  const eliminarEjercicioGuardado = (index) => {
    setEjerciciosDelEntrenamiento(ejerciciosDelEntrenamiento.filter((_, i) => i !== index));
    toast('Ejercicio eliminado de la sesión');
  };

  const editarEntrenamiento = (entrenamiento) => {
    setEditingWorkoutId(entrenamiento.id);
    setEjerciciosDelEntrenamiento(entrenamiento.ejercicios || []);
    setEjercicio('Press de Banca');
    setSeries([{ peso: '', repes: '' }]);
    setIsWorkoutStarted(true);
  };

  const eliminarEntrenamiento = async (id) => {
    try {
      await deleteDoc(doc(db, 'entrenamientos', id));
      setHistorial((prev) => prev.filter((e) => e.id !== id));
      await Promise.all([
        recalcularPuntosTotales(user.uid),
        recalcularStreakYFecha(user.uid),
        recalcularPuntosEnLigas(user.uid),
      ]);
      await onRefrescarUsuario(user.uid);
      await cargarPRs();
      toast('Entrenamiento eliminado');
    } catch (error) {
      console.error('Error al eliminar: ', error);
      toast.error('Error al eliminar el entrenamiento');
    }
  };

  const finalizarEntrenamiento = async () => {
    const seriesValidas = series.filter((s) => s.peso && s.repes);
    const ejerciciosFinales = [...ejerciciosDelEntrenamiento];
    if (seriesValidas.length > 0) {
      ejerciciosFinales.push({
        nombre: ejercicio,
        series: seriesValidas.map((s) => ({ peso: Number(s.peso), repes: Number(s.repes) })),
      });
    }
    if (ejerciciosFinales.length === 0) {
      toast.error('Añade al menos un ejercicio con peso y repeticiones.');
      return;
    }

    setGuardando(true);
    try {
      if (editingWorkoutId) {
        await updateDoc(doc(db, 'entrenamientos', editingWorkoutId), { ejercicios: ejerciciosFinales });
        setEditingWorkoutId(null);
        setSeries([{ peso: '', repes: '' }]);
        setEjercicio('Press de Banca');
        setEjerciciosDelEntrenamiento([]);
        setIsWorkoutStarted(false);
        await Promise.all([cargarHistorial(), cargarPRs()]);
        toast.success('Entrenamiento actualizado');
      } else {
        const fecha = new Date().toISOString();
        const volumenTotal = calcularVolumenTotal(ejerciciosFinales);
        const { prs, volumenAnterior } = await obtenerDatosHistoricos(user.uid);

        const tuvoPR = ejerciciosFinales.some((ej) => {
          const hist = prs[ej.nombre];
          if (!hist) return false;
          const maxPesoActual = Math.max(...ej.series.map((s) => s.peso));
          const volEj = ej.series.reduce((sum, s) => sum + s.peso * s.repes, 0);
          return maxPesoActual > hist.maxPeso || volEj > hist.maxVolumen;
        });

        const { total: puntosGanados } = calcularPuntos({
          tuvoPR,
          streak: userData?.streak || 0,
          volumenActual: volumenTotal,
          volumenAnterior,
        });

        await addDoc(collection(db, 'entrenamientos'), {
          userId: user.uid,
          userName: user.displayName || userData?.displayName,
          ejercicios: ejerciciosFinales,
          fecha,
          puntos: puntosGanados,
          volumenTotal,
          tuvoPR,
        });

        await actualizarDespuesDeEntrenamiento(user.uid, puntosGanados, fecha);
        await actualizarPuntosEnLigas(user.uid, puntosGanados);
        await onRefrescarUsuario(user.uid);
        setSeries([{ peso: '', repes: '' }]);
        setEjercicio('Press de Banca');
        setEjerciciosDelEntrenamiento([]);
        setIsWorkoutStarted(false);
        await Promise.all([cargarHistorial(), cargarPRs()]);
        toast.success(`¡Entrenamiento guardado! +${puntosGanados} puntos${tuvoPR ? ' — Nuevo récord!' : ''}`);
      }
    } catch (error) {
      console.error('Error al guardar: ', error);
      toast.error('Hubo un error al guardar el entrenamiento');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="entrenar-layout">
      {ejerciciosParaPlantilla && (
        <ModalNombre
          titulo="Nombre de la plantilla"
          placeholder="Ej: Día de pecho..."
          onConfirmar={confirmarGuardarPlantilla}
          onCancelar={() => setEjerciciosParaPlantilla(null)}
        />
      )}
      <div className="entrenar-panel-left">
        {!isWorkoutStarted ? (
          <WorkoutStarter user={user} onStart={handleStart} onCargarPlantilla={cargarPlantilla} />
        ) : (
          <WorkoutForm
            ejercicio={ejercicio}
            setEjercicio={setEjercicio}
            series={series}
            setSeries={setSeries}
            ejerciciosDelEntrenamiento={ejerciciosDelEntrenamiento}
            onAgregarOtroEjercicio={agregarOtroEjercicio}
            onEditarEjercicioGuardado={editarEjercicioGuardado}
            onEliminarEjercicioGuardado={eliminarEjercicioGuardado}
            onFinalizar={finalizarEntrenamiento}
                        guardando={guardando}
            onGuardarPlantilla={handleGuardarPlantilla}
          />
        )}
      </div>
      <WorkoutHistorial
        historial={historial.slice(0, historialVisible)}
        totalHistorial={historial.length}
        historialVisible={historialVisible}
        onCargarMas={() => setHistorialVisible((v) => v + 15)}
        cargando={cargandoHistorial}
        prs={prs}
        onEditar={editarEntrenamiento}
        onEliminar={eliminarEntrenamiento}
      />
    </div>
  );
}
