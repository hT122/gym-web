import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dumbbell, Trophy, Users, Flame, MessageCircle, Apple, BarChart2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: (i ?? 0) * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const FEATURES = [
  { Icon: Dumbbell,      title: 'Registro de entrenos',   desc: 'Anota ejercicios, series, peso y repeticiones. La app detecta automáticamente si bates un récord personal.' },
  { Icon: Trophy,        title: 'Ligas fantasy',          desc: 'Crea o únete a ligas con código de invitación. Compite en un ranking semanal con tus amigos del gym.' },
  { Icon: Flame,         title: 'Sistema de puntos',      desc: 'Cada sesión suma: 10 pts de asistencia, +2 por cada 1.000 kg de volumen, +25 por récord y bonuses por racha.' },
  { Icon: BarChart2,     title: 'Récords personales',     desc: 'Historial de PRs por ejercicio con gráficas de progresión en el tiempo. Ve cuánto has mejorado.' },
{ Icon: Apple,         title: 'Seguimiento nutricional',desc: 'Registra comidas con una base de alimentos integrada y controla tu ingesta calórica diaria.' },
  { Icon: MessageCircle, title: 'Chat en tiempo real',    desc: 'Mensajería 1:1 con compañeros de liga. Los IDs de chat son deterministas para evitar duplicados.' },
  { Icon: Users,         title: 'Perfil y estadísticas',  desc: 'Nivel, racha activa, puntos totales, volumen acumulado y gráfica de actividad semanal.' },
];

const SCORING = [
  { label: 'Asistencia base',        value: '+10 pts',  color: '#e05555' },
  { label: 'Por cada 1.000 kg·rep',  value: '+2 pts',   color: '#e07755' },
  { label: 'Récord personal',        value: '+25 pts',  color: '#e09955' },
  { label: 'Racha 3 días',           value: '+5 pts',   color: '#a0a0a0' },
  { label: 'Racha 7 días',           value: '+15 pts',  color: '#a0a0a0' },
  { label: 'Racha 30 días',          value: '+50 pts',  color: '#a0a0a0' },
  { label: 'Volumen < 90% anterior', value: '−5 pts',   color: '#888' },
];


const RED = '#e05555';

export default function AboutUs() {
  const navigate  = useNavigate();
  const heroRef   = useRef(null);
  const bgRef     = useRef(null);

  /* ── GSAP: parallax hero ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 28,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', height: '100dvh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={bgRef}
          style={{
            position: 'absolute', inset: '-25% 0',
            backgroundImage: 'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=85)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'grayscale(1)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.78) 100%)' }} />

        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 24, left: 24, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10,
            padding: '9px 18px', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        >
          ← Volver
        </button>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}
        >
          <p style={{ color: RED, fontWeight: 800, letterSpacing: '5px', fontSize: 11, textTransform: 'uppercase', margin: '0 0 24px' }}>
            FANTASY GYM LEAGUE
          </p>
          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(60px, 11vw, 130px)',
            fontWeight: 900, color: '#fff',
            lineHeight: 0.92, letterSpacing: '-4px',
            margin: 0, textTransform: 'uppercase',
          }}>
            GYM<br />FANTASY
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(15px, 2vw, 19px)', margin: '32px auto 0', maxWidth: 480, lineHeight: 1.65 }}>
            Las ligas fantasy que todos conocemos, aplicadas al mundo del entrenamiento. Compite con tus amigos por quién entrena más y mejor.
          </p>
          <motion.p
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginTop: 64, color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '2px' }}
          >
            ↓ SCROLL
          </motion.p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          QUÉ ES
      ══════════════════════════════════ */}
      <section style={{ padding: '110px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 72, alignItems: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p style={{ color: RED, fontWeight: 800, letterSpacing: '4px', fontSize: 11, textTransform: 'uppercase', margin: '0 0 20px' }}>
              ¿QUÉ ES GYM FANTASY?
            </p>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1.5px',
              color: 'var(--color-text)', margin: 0,
            }}>
              "El gym se convierte en deporte de equipo."
            </h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
            <p style={{ color: 'var(--color-text-2)', fontSize: 17, lineHeight: 1.82, marginBottom: 20 }}>
              Gym Fantasy es una plataforma que gamifica el entrenamiento en el gimnasio. Registras tus sesiones — ejercicios, series, peso — y el sistema traduce ese esfuerzo a puntos.
            </p>
            <p style={{ color: 'var(--color-text-2)', fontSize: 17, lineHeight: 1.82, marginBottom: 20 }}>
              Esos puntos compiten en ligas privadas entre amigos: el que más y mejor entrena sube en el ranking. Como las ligas fantasy del fútbol, pero levantando hierro.
            </p>
            <p style={{ color: 'var(--color-text-2)', fontSize: 17, lineHeight: 1.82, margin: 0 }}>
              La plataforma incluye seguimiento nutricional, récords personales con gráficas de progresión y mensajería en tiempo real entre compañeros de liga.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FUNCIONALIDADES
      ══════════════════════════════════ */}
      <section style={{ background: 'var(--color-surface)', padding: '110px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: RED, fontWeight: 800, letterSpacing: '4px', fontSize: 11, textTransform: 'uppercase', margin: '0 0 16px' }}>LO QUE INCLUYE</p>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--color-text)', margin: 0 }}>
              Funcionalidades
            </h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: `0 12px 36px rgba(224,85,85,0.1)`, borderColor: `${RED}66` }}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16, padding: '28px 24px',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: `${RED}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, color: RED,
                }}>
                  <f.Icon size={22} strokeWidth={2} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 15, margin: '0 0 10px', color: 'var(--color-text)' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.68, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SISTEMA DE PUNTOS
      ══════════════════════════════════ */}
      <section style={{ padding: '110px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: RED, fontWeight: 800, letterSpacing: '4px', fontSize: 11, textTransform: 'uppercase', margin: '0 0 16px' }}>CÓMO SE PUNTÚA</p>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--color-text)', margin: 0 }}>
              Sistema de puntos
            </h2>
            <p style={{ color: 'var(--color-text-2)', fontSize: 16, lineHeight: 1.7, marginTop: 20, maxWidth: 560, margin: '20px auto 0' }}>
              Los puntos se calculan al guardar cada entrenamiento y se agregan tanto en tu perfil como en todas las ligas en las que participas.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {SCORING.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={fadeUp}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 12, padding: '18px 24px',
                }}
              >
                <span style={{ fontSize: 15, color: 'var(--color-text-2)', fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 20, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════
          CTA
      ══════════════════════════════════ */}
      <section style={{ padding: '110px 24px', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(36px, 6vw, 80px)',
            fontWeight: 900, color: 'var(--color-text)',
            letterSpacing: '-2.5px', textTransform: 'uppercase',
            lineHeight: 0.93, margin: '0 0 28px',
          }}>
            ¿LISTO PARA<br />COMPETIR?
          </h2>
          <p style={{ color: 'var(--color-text-2)', fontSize: 18, lineHeight: 1.65, maxWidth: 440, margin: '0 auto 48px' }}>
            Regístrate, crea una liga e invita a tus compañeros del gym. El ranking no miente.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: RED, color: '#fff', borderRadius: 13,
              padding: '16px 38px', fontWeight: 800, fontSize: 16,
              textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.3px', transition: 'transform 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Empieza ahora →
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
