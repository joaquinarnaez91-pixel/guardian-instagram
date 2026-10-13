import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Diamond, Glow, Wordmark, sans, serif } from './brand';

export type Mood = 'violet' | 'teal' | 'gold' | 'ember';

export type QuoteProps = {
  mood: Mood;
  label?: string;
  lead: string;
  emphasis?: string;
  sub?: string;
  centered?: boolean;
  mark?: 'none' | 'quote' | 'diamond';
  size?: number;
};

const MOODS: Record<Mood, { label: string; glow: string; emphasis: string; glowAt: [number, number]; glowOpacity: number }> = {
  violet: { label: C.violetSoft, glow: C.logoTile, emphasis: C.lilac, glowAt: [340, 260], glowOpacity: 0.35 },
  teal: { label: C.teal, glow: C.teal, emphasis: C.tealSoft, glowAt: [-260, 520], glowOpacity: 0.16 },
  gold: { label: C.gold, glow: C.gold, emphasis: C.goldSoft, glowAt: [140, 120], glowOpacity: 0.18 },
  ember: { label: C.ember, glow: C.ember, emphasis: C.emberSoft, glowAt: [460, -180], glowOpacity: 0.16 },
};

/** Every still post: one line in the serif, the feeling in italic colour, a short line under it. */
export const Quote: React.FC<QuoteProps> = ({ mood, label, lead, emphasis, sub, centered = false, mark = 'none', size = 100 }) => {
  const m = MOODS[mood];
  return (
    <AbsoluteFill style={{ background: C.ground, color: C.text, fontFamily: sans, padding: '110px 104px 96px', display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'stretch', textAlign: centered ? 'center' : 'left', overflow: 'hidden' }}>
      <Glow color={m.glow} x={m.glowAt[0]} y={m.glowAt[1]} size={880} opacity={m.glowOpacity} />
      {label && !centered && (
        <div style={{ position: 'relative', fontSize: 24, fontWeight: 800, letterSpacing: '0.2em', color: m.label }}>{label}</div>
      )}
      <div style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: centered ? 'center' : 'flex-start', gap: 52 }}>
        {mark === 'quote' && (
          <div style={{ fontFamily: serif, fontSize: 220, lineHeight: 0.5, height: 90, color: m.label }}>“</div>
        )}
        {mark === 'diamond' && <Diamond size={96} color={m.label} />}
        {label && centered && (
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.24em', color: m.label }}>{label}</div>
        )}
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 872 }}>
          {lead}
          {emphasis && <span style={{ fontStyle: 'italic', color: m.emphasis }}> {emphasis}</span>}
        </h1>
        {sub && (
          <p style={{ margin: 0, fontSize: 36, lineHeight: 1.5, fontWeight: 500, color: C.muted, maxWidth: 800, whiteSpace: 'pre-line' }}>{sub}</p>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <Wordmark />
      </div>
    </AbsoluteFill>
  );
};
