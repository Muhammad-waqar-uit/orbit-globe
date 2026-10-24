# OrbitGlobe

Rotating dotted globe with orbiting logo badges — React, canvas, no extra dependencies.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site, served by GitHub Pages
```

## Usage

Copy `src/OrbitGlobe/` into any React project:

```jsx
import OrbitGlobe from './OrbitGlobe';

<OrbitGlobe
  logos={[
    { id: 'binance', label: 'Binance', src: '/logos/binance.svg' },
    { id: 'custom', label: 'Mine', node: <MyIcon /> },
    { id: 'fx', label: 'FX', text: '$¥', textColor: '#2F5BEA' },
    { id: 'gecko', label: 'Gecko', emoji: '蜴', bg: '#f0fdf4' },
  ]}
  size={360}              // number, or 'auto' to fill the parent
  dotColor="#334155"
  rotationSpeed={6}       // deg/sec for the globe
  orbitSpeed={14}         // deg/sec for the badges
  tilt={18}
  orbitRadius={1.08}
  badgeSize={56}
  activeRingColor="#0f172a"
  autoCycle={3200}        // ms, 0 disables
  onActiveChange={(i, logo) => {}}
/>
```

## Props

`size`, `density`, `dotSize`, `dotColor`, `backDotColor`, `oceanDots`, `globeScale`,
`tilt`, `rotationSpeed`, `orbitSpeed`, `orbitRadius`, `badgeSize`, `badgeBg`,
`badgeShadow`, `activeRingColor`, `activeIndex` (controlled), `defaultActiveIndex`,
`autoCycle`, `pauseOnHover`, `draggable`, `onActiveChange`, `className`, `style`.

## Per-logo fields

`id`, `label`, one of `src | node | emoji | text` (+ `textColor`), `bg`,
`inclination` (deg), `node_angle` (deg), `phase` (deg), `speed` (multiplier),
`radius` (multiplier), `onClick`.

Default badges in `defaultLogos.jsx` are simple stand-in marks. Swap in the official
assets you are licensed to use. Drag the globe to spin it. Respects
`prefers-reduced-motion`.

## License

MIT