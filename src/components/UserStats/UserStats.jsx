import React from 'react';

export default function UserStats({ user, userData, workoutsCount, siguiendo = 0, seguidores = 0 }) {
  const stats = [
    { value: userData?.puntosTotales ?? 0, label: 'Puntos totales' },
    { value: userData?.streak ?? 0, label: 'Días de racha' },
    { value: workoutsCount, label: 'Entrenamientos' },
  ];

  return (
    <div className="workout-card">
      <div className="profile-header">
        <img
          src={
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || 'U')}&background=111&color=fff&size=128`
          }
          alt="avatar"
          className="profile-avatar"
        />
        <div className="profile-info">
          <p className="profile-name">{userData?.displayName || user.displayName || 'Usuario'}</p>
          <p className="profile-email">{user.email}</p>
          {userData?.bio && (
            <p className="profile-bio">{userData.bio}</p>
          )}
          <div className="profile-follow-row">
            <span className="profile-follow-stat">
              <strong>{seguidores}</strong> seguidores
            </span>
            <span className="profile-follow-sep">·</span>
            <span className="profile-follow-stat">
              <strong>{siguiendo}</strong> siguiendo
            </span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
