import { db } from './config';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

export const guardarPlantilla = async (userId, nombre, ejercicios) => {
  await addDoc(collection(db, 'templates'), {
    userId,
    nombre: nombre.trim(),
    ejercicios,
    creadoEn: new Date().toISOString(),
  });
};

export const obtenerPlantillas = async (userId) => {
  const snap = await getDocs(query(collection(db, 'templates'), where('userId', '==', userId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
};

export const eliminarPlantilla = async (id) => {
  await deleteDoc(doc(db, 'templates', id));
};
