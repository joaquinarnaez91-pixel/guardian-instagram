import React from 'react';
import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';

// Guardian's palette, from the app's Theme.swift.
export const C = {
  ground: '#0B1020',
  groundDeep: '#070A16',
  violet: '#8B7CFF',
  violetSoft: '#A79CFF',
  lilac: '#C4B5FD',
  logoTile: '#5B34B8',
  gold: '#FFC857',
  goldSoft: '#FFD98A',
  teal: '#3DDC97',
  tealSoft: '#A7F0CF',
  ember: '#FF9F6B',
  emberSoft: '#FFC2A0',
  text: '#EEF1FF',
  muted: '#9AA3C7',
};

export const serif = loadFraunces('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
loadFraunces('italic', { weights: ['400'], subsets: ['latin'] });
export const sans = loadManrope('normal', { weights: ['500', '800'], subsets: ['latin'] }).fontFamily;

const DIAMOND = 'M427 218H597L661 293L512 451L364 293Z';
const WINGS = 'M195 467C330 485 450 570 512 668C574 570 694 485 830 467C760 610 600 700 512 805C424 700 264 610 195 467Z';

export const Mark: React.FC<{ size: number; color?: string }> = ({ size, color = C.violetSoft }) => (
  <svg viewBox="160 200 704 620" width={size} height={size * 0.88} fill={color}>
    <path d={DIAMOND} />
    <path d={WINGS} />
  </svg>
);

export const Diamond: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="360 214 305 240" width={size} height={size * 0.79} fill={color}>
    <path d={DIAMOND} />
  </svg>
);

export const Wordmark: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 * scale, fontFamily: sans, fontWeight: 800, fontSize: 24 * scale, letterSpacing: '0.16em', color: C.text }}>
    <Mark size={34 * scale} />
    GUARDIAN
  </div>
);

/** The soft light behind each post: the one decoration the feed uses. */
export const Glow: React.FC<{ color: string; x: number; y: number; size: number; opacity: number }> = ({ color, x, y, size, opacity }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, background: color, opacity, filter: 'blur(170px)' }} />
);
