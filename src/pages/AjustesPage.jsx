import React, { useState, useRef } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { toast } from 'sonner';

function comprimirImagen(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Error al comprimir imagen'));
      }, 'image/jpeg', 0.8);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AjustesPage({ user, userData, darkMode, onToggleDark, deferredInstall, onInstalled }) {
  const [nombre,    setNombre]    = useState(userData?.displayName || '');
  const [bio,       setBio]       = useState(userData?.bio || '');
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoPreview, setFotoPreview]   = useState(user.photoURL || null);
  const fileInputRef = useRef(null);

  const handleInstall = async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    if (outcome === 'accepted') onInstalled?.();
  };

  const handleFotoClick = () => fileInputRef.current?.click();

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La foto no puede superar 10 MB');
      return;
    }
    setSubiendoFoto(true);
    try {
      const blob = await comprimirImagen(file, 256);
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const downloadURL = await getDownloadURL(storageRef);
      await Promise.all([
        updateProfile(user, { photoURL: downloadURL }),
        updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL }),
      ]);
      setFotoPreview(downloadURL);
      toast.success('Foto de perfil actualizada');
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      setSubiendoFoto(false);
      e.target.value = '';
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim.length > 50) return;
    setGuardando(true);
    try {
      await Promise.all([
        updateProfile(user, { displayName: nombreTrim }),
        updateDoc(doc(db, 'users', user.uid), { displayName: nombreTrim, bio: bio.trim() }),
      ]);
      toast.success('Perfil actualizado correctamente');
    } catch {
      toast.error('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const avatarSrc = fotoPreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || 'U')}&background=111&color=fff&size=128`;

  return (
    <div className="ajustes-layout" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workout-card ajustes-card">
        <h3 className="card-title">Información de perfil</h3>

        {/* Avatar upload */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div className="avatar-upload-wrapper" onClick={handleFotoClick}>
            <img src={avatarSrc} alt="avatar" className="avatar-upload-img" />
            <div className="avatar-upload-overlay">
              {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFotoChange}
          />
        </div>

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
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0', textAlign: 'right' }}>{nombre.length}/50</p>
          </div>

          <div className="input-group">
            <label className="label">BIO</label>
            <textarea
              className="input"
              value={bio}
              onChange={(e) => e.target.value.length <= 150 && setBio(e.target.value)}
              maxLength={150}
              placeholder="Cuéntanos algo sobre ti..."
              rows={3}
              style={{ resize: 'none', lineHeight: 1.5 }}
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0', textAlign: 'right' }}>{bio.length}/150</p>
          </div>

          <div className="input-group">
            <label className="label">EMAIL</label>
            <input className="input" value={user.email || '—'} disabled style={{ color: 'var(--color-text-muted)', cursor: 'not-allowed' }} />
          </div>

          <button type="submit" className="finish-btn" disabled={guardando || !nombre.trim()}>
            {guardando ? 'Guardando...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>

      <div className="workout-card ajustes-card">
        <h3 className="card-title">Apariencia</h3>
        <div className="ajustes-row">
          <div>
            <p className="ajustes-row-label">Modo oscuro</p>
            <p className="ajustes-row-sub">Activo: sigue tu preferencia del sistema</p>
          </div>
          <button
            className={`ajustes-toggle ${darkMode ? 'ajustes-toggle--on' : ''}`}
            onClick={onToggleDark}
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span className="ajustes-toggle-knob" />
          </button>
        </div>
      </div>

      {deferredInstall && (
        <div className="workout-card ajustes-card">
          <h3 className="card-title">Instalar aplicación</h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16, margin: '0 0 16px' }}>
            Instala Gym Fantasy en tu dispositivo para acceso rápido y uso sin conexión.
          </p>
          <button className="finish-btn" onClick={handleInstall}>
            Instalar app
          </button>
        </div>
      )}
    </div>
  );
}
