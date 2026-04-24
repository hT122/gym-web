import * as React from "react"

export function LiquidButton({ children, onClick, style, className, size = "lg", ...props }) {
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)

  const sizeStyles = {
    sm:  { height: 36, padding: '0 16px', fontSize: 12 },
    lg:  { height: 44, padding: '0 22px', fontSize: 14 },
    xl:  { height: 52, padding: '0 28px', fontSize: 15 },
    xxl: { height: 60, padding: '0 36px', fontSize: 15 },
  }

  const sz = sizeStyles[size] || sizeStyles.lg

  const baseStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: sz.height,
    padding: sz.padding,
    fontSize: sz.fontSize,
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.3px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.22)',
    background: hovered
      ? 'rgba(255,255,255,0.18)'
      : 'rgba(255,255,255,0.10)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    color: 'rgba(255,255,255,0.95)',
    cursor: 'pointer',
    outline: 'none',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
    transform: pressed
      ? 'scale(0.97) translateY(0)'
      : hovered
        ? 'scale(1.04) translateY(-2px)'
        : 'scale(1) translateY(0)',
    boxShadow: hovered
      ? '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)'
      : '0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)',
    ...style,
  }

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {/* Inner shine highlight */}
      <span style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '50%',
        borderRadius: '999px 999px 0 0',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
      </span>
    </button>
  )
}
