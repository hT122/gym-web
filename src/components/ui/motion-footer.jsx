import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: color-mix(in oklch, var(--color-foreground, #111) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--color-foreground, #111) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--color-background, #f2f1ef) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--color-foreground, #111) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--color-background, #f2f1ef) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--color-foreground, #111) 8%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, var(--color-foreground, #111) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--color-foreground, #111) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--color-foreground, #111) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--color-background, #f2f1ef) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--color-foreground, #111) 20%, transparent);
}

@keyframes footer-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1);   filter: drop-shadow(0 0 5px  color-mix(in oklch, var(--color-destructive, #c0392b) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--color-destructive, #c0392b) 80%, transparent)); }
  30%       { transform: scale(1); }
}

.animate-footer-breathe         { animation: footer-breathe        8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee  { animation: footer-scroll-marquee 40s linear infinite; }
.animate-footer-heartbeat       { animation: footer-heartbeat       2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right,  color-mix(in oklch, var(--color-foreground, #111) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--color-foreground, #111) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--color-primary, #111) 15%, transparent) 0%,
    color-mix(in oklch, var(--color-secondary, #888) 15%, transparent) 40%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--color-foreground, #111);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--color-foreground, #111) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--color-foreground, #111) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--color-foreground, #111) 0%, color-mix(in oklch, var(--color-foreground, #111) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--color-foreground, #111) 15%, transparent));
}
`;

// ── Magnetic Button ──────────────────────────────────────────────────────────
const MagneticButton = React.forwardRef(
  ({ className, children, as: Component = "button", onClick, href, ...props }, forwardedRef) => {
    const localRef = useRef(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(element, {
            x: x * 0.4, y: y * 0.4,
            rotationX: -y * 0.15, rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out", duration: 0.4,
          });
        };
        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1,
            ease: "elastic.out(1, 0.3)", duration: 1.2,
          });
        };
        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn("cursor-pointer", className)}
        onClick={onClick}
        href={href}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// ── Marquee ──────────────────────────────────────────────────────────────────
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Entrena cada día</span>
    <span style={{ color: 'var(--color-primary)', opacity: 0.5 }}>✦</span>
    <span>Gana puntos</span>
    <span style={{ color: 'var(--color-secondary)', opacity: 0.5 }}>✦</span>
    <span>Rompe tus récords</span>
    <span style={{ color: 'var(--color-primary)', opacity: 0.5 }}>✦</span>
    <span>Únete a ligas</span>
    <span style={{ color: 'var(--color-secondary)', opacity: 0.5 }}>✦</span>
    <span>Sube de nivel</span>
    <span style={{ color: 'var(--color-primary)', opacity: 0.5 }}>✦</span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export function CinematicFooter({ onLogin, onRegister }) {
  const wrapperRef    = useRef(null);
  const giantTextRef  = useRef(null);
  const headingRef    = useRef(null);
  const linksRef      = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh", scale: 1, opacity: 1, ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%", end: "bottom bottom", scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%", end: "bottom bottom", scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: "100svh", clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer
          className="fixed bottom-0 left-0 flex w-full flex-col justify-between overflow-hidden cinematic-footer-wrapper"
          style={{ height: "100svh", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
        >
          {/* Ambient glow */}
          <div
            className="footer-aurora absolute left-1/2 top-1/2 animate-footer-breathe rounded-[50%] pointer-events-none"
            style={{ height: "60vh", width: "80vw", transform: "translate(-50%,-50%)", filter: "blur(80px)", zIndex: 0 }}
          />
          {/* Grid */}
          <div className="footer-bg-grid absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute whitespace-nowrap pointer-events-none select-none"
            style={{ bottom: "-5vh", left: "50%", transform: "translateX(-50%)", zIndex: 0 }}
          >
            GYM
          </div>

          {/* Marquee */}
          <div
            className="absolute left-0 w-full overflow-hidden py-4"
            style={{
              top: "3rem",
              borderTop: "1px solid color-mix(in oklch, var(--color-border) 50%, transparent)",
              borderBottom: "1px solid color-mix(in oklch, var(--color-border) 50%, transparent)",
              backgroundColor: "color-mix(in oklch, var(--color-bg) 60%, transparent)",
              backdropFilter: "blur(12px)",
              zIndex: 10,
              transform: "rotate(-2deg) scaleX(1.1)",
            }}
          >
            <div className="flex w-max animate-footer-scroll-marquee text-xs font-bold tracking-[0.3em] uppercase" style={{ color: "var(--color-text-muted)" }}>
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* Main content */}
          <div
            className="relative flex flex-1 flex-col items-center justify-center px-6 w-full max-w-5xl mx-auto"
            style={{ marginTop: "5rem", zIndex: 10 }}
          >
            <h2
              ref={headingRef}
              className="footer-text-glow font-black tracking-tighter text-center mb-12"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              ¿Listo para empezar?
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* Primary CTAs */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton
                  as="button"
                  onClick={onRegister}
                  className="footer-glass-pill px-10 py-5 rounded-full font-bold text-sm flex items-center gap-3"
                  style={{ color: "var(--color-text)" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Crear cuenta gratis
                </MagneticButton>

                <MagneticButton
                  as="button"
                  onClick={onLogin}
                  className="footer-glass-pill px-10 py-5 rounded-full font-bold text-sm flex items-center gap-3"
                  style={{ color: "var(--color-text)" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión
                </MagneticButton>
              </div>

              {/* Secondary links */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {["Privacidad", "Términos", "Soporte"].map((label) => (
                  <MagneticButton
                    key={label}
                    as="button"
                    className="footer-glass-pill px-6 py-3 rounded-full font-medium text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {label}
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="relative w-full pb-8 px-6 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ zIndex: 20 }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase order-2 md:order-1" style={{ color: "var(--color-text-muted)" }}>
              © 2026 Gym Fantasy. Todos los derechos reservados.
            </p>

            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Hecho con</span>
              <span className="animate-footer-heartbeat text-sm" style={{ color: "var(--color-danger-text)" }}>❤</span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>para los que</span>
              <span className="font-black text-sm ml-1" style={{ color: "var(--color-text)" }}>entrenan</span>
            </div>

            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center group order-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ transition: "transform 0.3s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
