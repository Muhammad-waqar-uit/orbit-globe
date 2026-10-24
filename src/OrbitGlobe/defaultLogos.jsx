import React from 'react';

/*
 * Default badges. Simple stand-in marks so the demo works offline.
 * Replace any of them with your own: { id, label, src } for an image,
 * { id, label, node } for any React node, or { id, label, text } / { id, label, emoji }.
 */
export const defaultLogos = [
  {
    id: 'binance',
    label: 'Binance',
    node: (
      <svg viewBox="0 0 32 32" width="100%" height="100%">
        <g fill="#F0B90B">
          <path d="M16 4l3.1 3.1L16 10.2 12.9 7.1z" />
          <path d="M8.5 11.5l3.1 3.1-3.1 3.1-3.1-3.1z" />
          <path d="M23.5 11.5l3.1 3.1-3.1 3.1-3.1-3.1z" />
          <path d="M16 13l3.1 3.1-3.1 3.1-3.1-3.1z" />
          <path d="M16 21.8l3.1 3.1L16 28l-3.1-3.1z" />
        </g>
      </svg>
    ),
  },
  {
    id: 'tradingview',
    label: 'TradingView',
    node: (
      <svg viewBox="0 0 32 32" width="100%" height="100%">
        <g fill="#1F9D6B">
          <rect x="3" y="9" width="8" height="5" rx="1" />
          <rect x="7" y="9" width="4" height="14" rx="1" />
          <path d="M14 9h5l-3 14h-5z" />
          <circle cx="23.5" cy="11.5" r="3" />
        </g>
      </svg>
    ),
  },
  {
    id: 'hyperliquid',
    label: 'Hyperliquid',
    node: (
      <svg viewBox="0 0 32 32" width="100%" height="100%">
        <rect x="3" y="3" width="26" height="26" fill="#000" />
        <path d="M10 8h3v6h6V8h3v16h-3v-7h-6v7h-3z" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'coinmarketcap',
    label: 'CoinMarketCap',
    node: (
      <svg viewBox="0 0 32 32" width="100%" height="100%">
        <path
          d="M7 21V13c0-2.6 4-3 4.600-.4L13 17l3-6c1-2 3.600-1.400 3.600.600V19c0 1.500 2.400 1.700 3 .200l1-2.400"
          fill="none" stroke="#111" strokeWidth="2.600" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M26 21a11 11 0 1 1-4-12" fill="none" stroke="#111" strokeWidth="2.600" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'forex',
    label: 'FX rates',
    text: '$¥',
    textColor: '#2F5BEA',
  },
  {
    id: 'coingecko',
    label: 'CoinGecko',
    emoji: '🦎',
  },
  {
    id: 'rings',
    label: 'Rings',
    node: (
      <svg viewBox="0 0 32 32" width="100%" height="100%">
        <g fill="none" stroke="#F59E0B" strokeWidth="3">
          <circle cx="12" cy="16" r="6" />
          <circle cx="20" cy="16" r="6" />
        </g>
      </svg>
    ),
  },
];
