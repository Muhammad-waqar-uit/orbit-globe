import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { isLand } from './landMask.js';
import { defaultLogos } from './defaultLogos.jsx';
import './OrbitGlobe.css';

const TAU = Math.PI * 2;
const rad = (d) => (d * Math.PI) / 180;

/** Evenly spread points on a sphere, kept only where there is land. */
function buildLandPoints(density, oceanDots) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < density; i++) {
    const y = 1 - (i / (density - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = (Math.atan2(x, z) * 180) / Math.PI; // lon 0 faces +z at yaw 0
    const land = isLand(lat, lon);
    if (land || (oceanDots && i % 5 === 0)) pts.push(x, y, z, land ? 1 : 0);
  }
  return new Float32Array(pts);
}

function LogoFace({ logo }) {
  if (logo.node) return <span className="og-face">{logo.node}</span>;
  if (logo.src) return <img className="og-img" src={logo.src} alt={logo.label || ''} draggable={false} />;
  if (logo.emoji) return <span className="og-emoji">{logo.emoji}</span>;
  if (logo.text)
    return (
      <span className="og-text" style={{ color: logo.textColor }}>
        {logo.text}
      </span>
    );
  return null;
}

/**
 * OrbitGlobe
 *
 * logos: [{ id, label, src | node | emoji | text, textColor, bg, inclination, phase, speed, radius, onClick }]
 */
export default function OrbitGlobe({
  logos = defaultLogos,
  size = 360,               // number (px) or 'auto' to fill the parent width
  density = 7000,           // points generated on the sphere before land filtering
  dotSize = 1.6,            // px at size 360, scales with globe
  dotColor = '#334155',
  backDotColor = '#94a3b8',
  oceanDots = false,
  globeScale = 0.72,        // globe radius as a fraction of half the canvas
  tilt = 18,                // degrees, axial tilt toward the viewer
  rotationSpeed = 6,        // globe degrees per second (negative reverses)
  orbitSpeed = 14,          // badge degrees per second
  orbitRadius = 1.08,       // 1 = on the surface
  badgeSize = 56,           // px at size 360
  badgeBg = '#ffffff',
  badgeShadow = '0 6px 18px rgba(15,23,42,.14)',
  activeRingColor = '#0f172a',
  activeIndex,              // controlled active badge (index). omit for uncontrolled
  defaultActiveIndex = 0,
  autoCycle = 3200,         // ms between auto-selected badges, 0 to disable
  pauseOnHover = false,       // true: hovering stops globe + badge rotation
  draggable = true,
  onActiveChange,
  className = '',
  style,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const badgeRefs = useRef([]);
  const state = useRef({ yaw: 0, orbit: 0, dragYaw: 0, vel: 0, dragging: false, hover: false, lastX: 0 });
  const [px, setPx] = useState(typeof size === 'number' ? size : 360);
  const [inner, setInner] = useState(defaultActiveIndex);
  const active = activeIndex ?? inner;

  const points = useMemo(() => buildLandPoints(density, oceanDots), [density, oceanDots]);

  // Per-badge orbit setup (users can override per logo)
  const orbits = useMemo(
    () =>
      logos.map((l, i) => ({
        incl: rad(l.inclination ?? [-8, 38, -42, 62, 18, -62, 78][i % 7]),
        node: rad(l.node_angle ?? i * 47),
        phase: rad(l.phase ?? (i / logos.length) * 360),
        speed: l.speed ?? 1 + ((i % 3) - 1) * 0.12,
        r: l.radius ?? 1,
      })),
    [logos],
  );

  // Responsive sizing
  useEffect(() => {
    if (typeof size === 'number') return setPx(size);
    const el = wrapRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setPx(Math.max(200, Math.round(el.clientWidth))));
    ro.observe(el);
    setPx(Math.max(200, Math.round(el.clientWidth)));
    return () => ro.disconnect();
  }, [size]);

  const setActive = useCallback(
    (i) => {
      if (activeIndex === undefined) setInner(i);
      onActiveChange?.(i, logos[i]);
    },
    [activeIndex, logos, onActiveChange],
  );

  // Auto cycle
  useEffect(() => {
    if (!autoCycle || logos.length < 2) return;
    const id = setInterval(() => {
      if (pauseOnHover && state.current.hover) return;
      setActive(((active ?? 0) + 1) % logos.length);
    }, autoCycle);
    return () => clearInterval(id);
  }, [autoCycle, logos.length, pauseOnHover, setActive, active]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = px * dpr;
    canvas.height = px * dpr;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const S = state.current;
    const cx = px / 2;
    const R = (px / 2) * globeScale;
    const k = px / 360;
    const ds = dotSize * k;
    const bs = badgeSize * k;
    const tl = rad(tilt);
    const cT = Math.cos(tl), sT = Math.sin(tl);
    let raf, last = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const paused = reduce || (pauseOnHover && S.hover);
      if (!paused && !S.dragging) {
        S.yaw += rad(rotationSpeed) * dt;
        S.orbit += rad(orbitSpeed) * dt;
      }
      if (!S.dragging && Math.abs(S.vel) > 1e-4) {
        S.dragYaw += S.vel;
        S.vel *= 0.94;
      }
      const yaw = S.yaw + S.dragYaw;
      const cY = Math.cos(yaw), sY = Math.sin(yaw);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, px, px);

      // Globe dots
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass === 0 ? backDotColor : dotColor;
        ctx.globalAlpha = pass === 0 ? 0.28 : 0.9;
        for (let i = 0; i < points.length; i += 4) {
          const x = points[i], y = points[i + 1], z = points[i + 2];
          const land = points[i + 3];
          // yaw about Y
          const x1 = x * cY + z * sY;
          const z1 = -x * sY + z * cY;
          // tilt about X
          const y2 = y * cT - z1 * sT;
          const z2 = y * sT + z1 * cT;
          const front = z2 > 0;
          if ((pass === 1) !== front) continue;
          const a = front ? 0.35 + 0.65 * z2 : 1;
          if (front) ctx.globalAlpha = land ? a : a * 0.25;
          const s = front ? ds * (0.7 + 0.5 * z2) : ds * 0.8;
          ctx.fillRect(cx + x1 * R - s / 2, cx - y2 * R - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;

      // Badges
      for (let i = 0; i < orbits.length; i++) {
        const el = badgeRefs.current[i];
        if (!el) continue;
        const o = orbits[i];
        const a = o.phase + S.orbit * o.speed;
        let x = Math.cos(a), y = 0, z = Math.sin(a);
        // inclination about X
        let y1 = y * Math.cos(o.incl) - z * Math.sin(o.incl);
        let z1 = y * Math.sin(o.incl) + z * Math.cos(o.incl);
        // rotate orbit plane about Y
        const cn = Math.cos(o.node), sn = Math.sin(o.node);
        const x2 = x * cn + z1 * sn;
        const z2 = -x * sn + z1 * cn;
        // global tilt
        const y3 = y1 * cT - z2 * sT;
        const z3 = y1 * sT + z2 * cT;
        const rr = R * orbitRadius * o.r;
        const sc = 0.72 + 0.34 * ((z3 + 1) / 2);
        const isActive = i === active;
        el.style.transform = `translate(${cx + x2 * rr - bs / 2}px, ${cx - y3 * rr - bs / 2}px) scale(${isActive ? sc * 1.08 : sc})`;
        el.style.opacity = z3 < -0.25 ? 0.35 + (z3 + 1) * 0.2 : 1;
        el.style.zIndex = isActive ? 1000 : Math.round((z3 + 1) * 100);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [px, points, orbits, active, dotColor, backDotColor, dotSize, globeScale, tilt, rotationSpeed, orbitSpeed, orbitRadius, badgeSize, pauseOnHover]);

  // Drag to spin
  const onDown = (e) => {
    if (!draggable) return;
    const S = state.current;
    S.dragging = true;
    S.lastX = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const S = state.current;
    if (!S.dragging) return;
    const d = rad((e.clientX - S.lastX) * 0.45);
    S.dragYaw += d;
    S.vel = d;
    S.lastX = e.clientX;
  };
  const onUp = () => (state.current.dragging = false);

  const bs = badgeSize * (px / 360);

  return (
    <div
      ref={wrapRef}
      className={`og-root ${className}`}
      style={{ width: px, height: px, touchAction: draggable ? 'pan-y' : 'auto', ...style }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerEnter={() => (state.current.hover = true)}
      onPointerLeave={() => {
        state.current.hover = false;
        state.current.dragging = false;
      }}
    >
      <canvas ref={canvasRef} className="og-canvas" style={{ width: px, height: px }} />
      {logos.map((logo, i) => (
        <button
          key={logo.id ?? i}
          type="button"
          ref={(el) => (badgeRefs.current[i] = el)}
          className={`og-badge${i === active ? ' is-active' : ''}`}
          aria-label={logo.label}
          aria-pressed={i === active}
          title={logo.label}
          style={{
            width: bs,
            height: bs,
            background: logo.bg ?? badgeBg,
            boxShadow: badgeShadow,
            '--og-ring': activeRingColor,
            '--og-pad': `${bs * 0.22}px`,
            '--og-font': `${bs * 0.34}px`,
          }}
          onClick={() => {
            setActive(i);
            logo.onClick?.(logo, i);
          }}
        >
          <LogoFace logo={logo} />
        </button>
      ))}
    </div>
  );
}
