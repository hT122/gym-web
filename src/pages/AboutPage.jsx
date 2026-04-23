import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CinematicFooter } from '../components/ui/motion-footer';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Registra tus entrenos',
    desc: 'Añade ejercicios, series y repeticiones. El sistema calcula tus puntos automáticamente en tiempo real.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    title: 'Compite en ligas',
    desc: 'Únete a ligas con tus amigos usando códigos de 6 caracteres. Escala el leaderboard semana a semana.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Sigue tus récords',
    desc: 'Visualiza la evolución de cada ejercicio con gráficas. Cada PR que rompes suma 25 puntos extra.',
  },
];

const STEPS = [
  { num: '01', label: 'Crea tu cuenta', desc: 'Regístrate en segundos con email o Google.' },
  { num: '02', label: 'Registra tu primer entreno', desc: 'Añade ejercicios y series. El sistema puntúa solo.' },
  { num: '03', label: 'Únete a una liga', desc: 'Usa un código de invitación y compite con tus amigos.' },
];

const SCORING = [
  { value: '10', label: 'Asistencia', sub: 'por sesión' },
  { value: '25', label: 'Récord', sub: 'por PR nuevo' },
  { value: '+50', label: 'Racha 30d', sub: 'streak máximo' },
  { value: '2', label: 'Volumen', sub: 'por 1000 kg·rep' },
];

function FeatureCard({ icon, title, desc }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--color-surface)',
        borderRadius: '20px',
        padding: '32px',
        flex: '1 1 260px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ color: 'var(--color-text)', opacity: 0.7 }}>{icon}</div>
      <h3 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
        {desc}
      </p>
    </div>
  );
}

export default function AboutPage({ onLogin, onRegister }) {
  const heroRef   = useRef(null);
  const taglineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        taglineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.4 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Back button ── */}
      <button
        onClick={() => window.history.back()}
        style={{
          position: 'fixed', top: '24px', left: '24px', zIndex: 100,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '50px', padding: '10px 18px',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          color: 'var(--color-text)', fontFamily: 'inherit',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.2s',
        }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px',
          position: 'relative',
        }}
      >
        {/* Ambient blob */}
        <div
          style={{
            position: 'absolute', top: '20%', left: '50%',
            transform: 'translateX(-50%)',
            width: '60vw', height: '40vh',
            background: 'radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div ref={heroRef} style={{ position: 'relative' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '4px',
            textTransform: 'uppercase', color: 'var(--color-text-muted)',
            marginBottom: '24px',
          }}>
            Acerca de nosotros
          </p>

          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 0.9, margin: '0 0 32px',
            textWrap: 'balance',
          }}>
            Gym Fantasy
          </h1>
        </div>

        <div ref={taglineRef}>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: 'var(--color-text-muted)',
            maxWidth: '560px', lineHeight: 1.6, margin: '0 0 40px',
            textWrap: 'pretty',
          }}>
            La plataforma que convierte tu rutina de gym en una competición con tus amigos.
            Entrena, acumula puntos y domina el leaderboard.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onRegister}
              style={{
                padding: '16px 32px', borderRadius: '50px', border: 'none',
                background: 'var(--color-text)', color: 'var(--color-bg)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Empezar gratis
            </button>
            <button
              onClick={onLogin}
              style={{
                padding: '16px 32px', borderRadius: '50px',
                border: '1.5px solid var(--color-border)',
                background: 'transparent', color: 'var(--color-text)',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          color: 'var(--color-text-faint)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          <span>Scroll</span>
          <div style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(to bottom, var(--color-text-faint), transparent)',
          }} />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '4px',
          textTransform: 'uppercase', color: 'var(--color-text-muted)',
          marginBottom: '16px', textAlign: 'center',
        }}>
          Funcionalidades
        </p>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center',
          margin: '0 0 64px', textWrap: 'balance',
        }}>
          Todo lo que necesitas para competir
        </h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── Scoring ── */}
      <section style={{
        padding: '100px 40px',
        background: 'var(--color-surface)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '4px',
            textTransform: 'uppercase', color: 'var(--color-text-muted)',
            marginBottom: '16px', textAlign: 'center',
          }}>
            Puntuación
          </p>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center',
            margin: '0 0 64px', textWrap: 'balance',
          }}>
            Así se calculan los puntos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2px',
            borderRadius: '20px', overflow: 'hidden',
          }}>
            {SCORING.map(({ value, label, sub }) => (
              <div
                key={label}
                style={{
                  background: 'var(--color-bg)',
                  padding: '40px 24px', textAlign: 'center',
                }}
              >
                <p style={{
                  fontFamily: 'Manrope, sans-serif', fontSize: '52px',
                  fontWeight: 900, margin: '0 0 8px',
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--color-text)',
                }}>
                  {value}
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>pts</span>
                </p>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '15px', color: 'var(--color-text)' }}>
                  {label}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '4px',
          textTransform: 'uppercase', color: 'var(--color-text-muted)',
          marginBottom: '16px', textAlign: 'center',
        }}>
          Cómo funciona
        </p>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center',
          margin: '0 0 64px', textWrap: 'balance',
        }}>
          Tres pasos para dominar
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {STEPS.map(({ num, label, desc }, i) => (
            <div
              key={num}
              style={{
                display: 'flex', alignItems: 'center', gap: '32px',
                padding: '32px 0',
                borderTop: i === 0 ? '1px solid var(--color-border)' : 'none',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span style={{
                fontFamily: 'Manrope, sans-serif', fontSize: '13px',
                fontWeight: 800, color: 'var(--color-text-faint)',
                letterSpacing: '1px', flexShrink: 0, width: '36px',
              }}>
                {num}
              </span>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: '0 0 6px', fontFamily: 'Manrope, sans-serif',
                  fontSize: '20px', fontWeight: 800, color: 'var(--color-text)',
                }}>
                  {label}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cinematic Footer ── */}
      <CinematicFooter onLogin={onLogin} onRegister={onRegister} />
    </div>
  );
}
