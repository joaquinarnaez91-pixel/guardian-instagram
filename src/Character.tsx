import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, Glow, Wordmark, sans, serif } from './brand';

export type CharacterProps = {
  label: string;
  lead: string;
  emphasis: string;
  sub?: string;
  art: string;
  glow?: string;
};

/** One of the journey characters says the day's line. */
export const Character: React.FC<CharacterProps> = ({ label, lead, emphasis, sub, art, glow = C.gold }) => (
  <AbsoluteFill style={{ background: C.ground, color: C.text, fontFamily: sans, overflow: 'hidden' }}>
    <Glow color={glow} x={420} y={300} size={820} opacity={0.22} />
    <Img src={staticFile(`art/${art}.webp`)} style={{ position: 'absolute', right: -360, bottom: -40, width: 1180, height: 1180, objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(255,200,87,0.25))' }} />
    <div style={{ position: 'absolute', inset: 0, padding: '110px 104px 96px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.2em', color: glow }}>{label}</div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40, maxWidth: 520 }}>
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 84, lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 4px 30px rgba(11,16,32,0.9)' }}>
          {lead} <span style={{ fontStyle: 'italic', color: C.goldSoft }}>{emphasis}</span>
        </h1>
        {sub && <p style={{ margin: 0, fontSize: 32, lineHeight: 1.5, fontWeight: 500, color: C.muted, textShadow: '0 2px 20px rgba(11,16,32,0.9)' }}>{sub}</p>}
      </div>
      <Wordmark />
    </div>
  </AbsoluteFill>
);
