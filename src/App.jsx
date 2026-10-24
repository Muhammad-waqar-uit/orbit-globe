import React, { useState } from 'react';
import OrbitGlobe, { defaultLogos } from './OrbitGlobe';

const copy = {
  binance: 'Our primary crypto feed: live prices, order book depth, volume, and funding rates from the world’s largest exchange. This is what powers your crypto charts, price alerts, and the volatility metrics in the app.',
  tradingview: 'Charting and technical analysis widgets used across the app.',
  hyperliquid: 'On-chain perpetuals data and funding rates.',
  coinmarketcap: 'Market cap rankings and broad asset coverage.',
  forex: 'Currency conversion rates for multi-currency portfolios.',
  coingecko: 'Independent price and metadata cross-checks.',
  rings: 'Your own custom source goes here.',
};

function Slider({ label, value, set, min, max, step = 1 }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr 44px', gap: 8, alignItems: 'center', fontSize: 13 }}>
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
      <span style={{ textAlign: 'right' }}>{value}</span>
    </label>
  );
}

export default function App() {
  const [logos, setLogos] = useState(defaultLogos);
  const [idx, setIdx] = useState(0);
  const [url, setUrl] = useState('');
  const [cfg, setCfg] = useState({ size: 360, rotationSpeed: 6, orbitSpeed: 14, tilt: 18, orbitRadius: 1.08, badgeSize: 56, dotSize: 1.6 });
  const [dotColor, setDotColor] = useState('#334155');
  const set = (k) => (v) => setCfg((c) => ({ ...c, [k]: v }));
  const current = logos[idx];

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '32px 20px 64px' }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 36, textAlign: 'center', margin: 0 }}>{current?.label}</h2>
      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 20, lineHeight: 1.6, minHeight: 160 }}>{copy[current?.id] ?? 'Custom data source.'}</p>

      <OrbitGlobe logos={logos} {...cfg} size={Math.min(cfg.size, 480)} dotColor={dotColor} activeIndex={idx} onActiveChange={setIdx} />

      <section style={{ marginTop: 40, display: 'grid', gap: 10, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <strong>Customize</strong>
        <Slider label="Size" value={cfg.size} set={set('size')} min={240} max={480} step={10} />
        <Slider label="Globe spin" value={cfg.rotationSpeed} set={set('rotationSpeed')} min={-30} max={30} />
        <Slider label="Orbit speed" value={cfg.orbitSpeed} set={set('orbitSpeed')} min={-60} max={60} />
        <Slider label="Tilt" value={cfg.tilt} set={set('tilt')} min={0} max={50} />
        <Slider label="Orbit radius" value={cfg.orbitRadius} set={set('orbitRadius')} min={0.8} max={1.4} step={0.02} />
        <Slider label="Badge size" value={cfg.badgeSize} set={set('badgeSize')} min={32} max={80} />
        <Slider label="Dot size" value={cfg.dotSize} set={set('dotSize')} min={1} max={3} step={0.1} />
        <label style={{ fontSize: 13 }}>Dot color <input type="color" value={dotColor} onChange={(e) => setDotColor(e.target.value)} /></label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Logo image URL" style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
          <button
            onClick={() => url && (setLogos([...logos, { id: 'c' + logos.length, label: 'Custom ' + (logos.length + 1), src: url }]), setUrl(''))}
            style={{ padding: '8px 14px', borderRadius: 8, border: 0, background: '#111', color: '#fff', cursor: 'pointer' }}
          >Add logo</button>
          <button onClick={() => setLogos(logos.slice(0, -1))} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Remove last</button>
        </div>
      </section>
    </main>
  );
}
