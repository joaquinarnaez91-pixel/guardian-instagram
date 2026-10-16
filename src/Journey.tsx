import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, Glow, Wordmark, sans, serif } from './brand';

export type JourneyProps = {
  label: string;
  lead: string;
  emphasis: string;
  /** Art files under public/art, smallest stage first. */
  stages: string[];
  captions: string[];
};

/** A character growing across its stages: the app's own journey art. */
export const Journey: React.FC<JourneyProps> = ({ label, lead, emphasis, stages, captions }) => {
  // The art is square with empty sides; each figure shows its middle two thirds.
  const heights = [460, 550, 660];
  return (
    <AbsoluteFill style={{ background: C.ground, color: C.text, fontFamily: sans, padding: '96px 0 88px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Glow color={C.logoTile} x={240} y={640} size={760} opacity={0.5} />
      <div style={{ position: 'relative', padding: '0 104px', display: 'flex', flexDirection: 'column', gap: 36 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.2em', color: C.violetSoft }}>{label}</div>
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 92, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
          {lead} <span style={{ fontStyle: 'italic', color: C.lilac }}>{emphasis}</span>
        </h1>
      </div>
      <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0 }}>
        <div style={{ position: 'absolute', left: 140, right: 140, bottom: 52, height: 60, borderRadius: '50%', background: C.violet, opacity: 0.18, filter: 'blur(30px)' }} />
        {stages.map((s, i) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 -6px', gap: 6 }}>
            <Img src={staticFile(`art/${s}.webp`)} style={{ width: Math.round(heights[i] * 0.66), height: heights[i], objectFit: 'cover', filter: i === stages.length - 1 ? 'drop-shadow(0 0 40px rgba(139,124,255,0.55))' : 'none', opacity: i === stages.length - 1 ? 1 : 0.88 }} />
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', color: i === stages.length - 1 ? C.gold : C.muted }}>{captions[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', padding: '28px 104px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark />
        <div style={{ fontSize: 26, fontWeight: 800, color: C.text, display: 'flex', alignItems: 'center', gap: 12 }}>
          Swipe
          <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={C.text} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
