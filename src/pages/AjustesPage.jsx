import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'sonner';

export default function AjustesPage({ user, userData }) {
  const [nombre, setNombre] = useState(userData?.displayName || '');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async (e) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim.length > 50) return;
    setGuardando(true);
    try {
      await Promise.all([
        updateProfile(user, { displayName: nombreTrim }),
        updateDoc(doc(db, 'users', user.uid), { displayName: nombreTrim }),
      ]);
      toast.success('Nombre actualizado correctamente');
    } catch {
      toast.error('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="ajustes-layout">
      <div className="workout-card ajustes-card">
        <h3 className="card-title">Información de perfil</h3>
        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="label">NOMBRE DE USUARIO</label>
            <input
              className="input"
              value={nombre}
              onChange={(e) => e.target.value.length <= 50 && setNombre(e.target.value)}
              maxLength={50}
              placeholder="Tu nombre"
              required
            />
            <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0', textAlign: 'right' }}>{nombre.length}/50</p>
          </div>

          <div className="input-group">
            <label className="label">EMAIL</label>
            <input className="input" value={user.email || '—'} disabled style={{ color: '#aaa', cursor: 'not-allowed' }} />
          </div>

          <button type="submit" className="finish-btn" disabled={guardando || !nombre.trim()}>
            {guardando ? 'Guardando...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>
    </div>
  );
}
