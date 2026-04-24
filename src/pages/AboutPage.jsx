import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollExpandMedia from '../components/blocks/scroll-expansion-hero';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <button className="about-back-btn" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver
      </button>

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1280&q=80"
        bgImageSrc="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80"
        title="GYM FANTASY"
        date="FANTASY GYM LEAGUE"
        scrollToExpand="↓ Scroll para explorar"
        textBlend
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text)', fontFamily: 'Manrope, sans-serif' }}>
            Sobre el proyecto
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--color-text-2)', lineHeight: 1.8 }}>
            Gym Fantasy es una plataforma que convierte tu rutina de entrenamiento en una competición con tus amigos.
            Registra tus sesiones, acumula puntos y sube en el ranking de tu liga. Cada kilo levantado cuenta.
          </p>
          <p className="text-lg mb-8" style={{ color: 'var(--color-text-2)', lineHeight: 1.8 }}>
            Desarrollado como Trabajo de Fin de Grado, combina seguimiento deportivo real con la dinámica de las ligas fantasy,
            un asistente de IA personalizado, seguimiento nutricional y mensajería en tiempo real entre compañeros de liga.
          </p>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
