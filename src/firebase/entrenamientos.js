import { db } from './config';
import {
  collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc,
  orderBy, limit, startAfter,
} from 'firebase/firestore';

const PAGE_SIZE = 15;

export const obtenerHistorial = async (userId, cursor = null) => {
  const constraints = [
    where('userId', '==', userId),
    orderBy('fecha', 'desc'),
    limit(PAGE_SIZE),
  ];
  if (cursor) constraints.push(startAfter(cursor));

  const snap = await getDocs(query(collection(db, 'entrenamientos'), ...constraints));
  return {
    entrenamientos: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    ultimoDoc: snap.docs[snap.docs.length - 1] ?? null,
    hayMas: snap.docs.length === PAGE_SIZE,
  };
};

export const guardarEntrenamiento = async (data) => {
  return await addDoc(collection(db, 'entrenamientos'), data);
};

export const actualizarEjerciciosEntrenamiento = async (id, ejercicios) => {
  await updateDoc(doc(db, 'entrenamientos', id), { ejercicios });
};

export const eliminarEntrenamiento = async (id) => {
  await deleteDoc(doc(db, 'entrenamientos', id));
};
