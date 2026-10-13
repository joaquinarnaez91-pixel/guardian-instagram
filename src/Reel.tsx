import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Wordmark, sans, serif } from './brand';

export type ReelProps = {
  title: string;
  emphasis: string;
  closing: string;
};

// One round of 4-7-8 breathing, between a short opening and a closing line.
const OPEN = 2, IN = 4, HOLD = 7, OUT = 8, CLOSE = 3;
export const REEL_SECONDS = OPEN + IN + HOLD + OUT + CLOSE;

const ease = Easing.inOut(Easing.sin);

export const Reel: React.FC<ReelProps> = ({ title, emphasis, closing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const tIn = OPEN, tHold = OPEN + IN, tOut = tHold + HOLD, tClose = tOut + OUT;
  const scale = interpolate(t, [tIn, tHold, tOut, tClose], [0.62, 1, 1, 0.62], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

  let cue = '';
  let count = 0;
  if (t >= tIn && t < tHold) { cue = 'Breathe in'; count = Math.ceil(tHold - t); }
  else if (t >= tHold && t < tOut) { cue = 'Hold'; count = Math.ceil(tOut - t); }
  else if (t >= tOut && t < tClose) { cue = 'Breathe out'; count = Math.ceil(tClose - t); }

  const titleIn = interpolate(t, [0, 1.2], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const circleIn = interpolate(t, [0.6, 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const cueIn = interpolate(t, [tIn - 0.4, tIn + 0.3, tClose - 0.3, tClose + 0.3], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const closeIn = interpolate(t, [tClose, tClose + 1.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const pulse = 0.4 + 0.12 * Math.sin(t * 1.6);

  return (
    <AbsoluteFill style={{ background: C.groundDeep, color: C.text, fontFamily: sans, padding: '280px 104px 420px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}>
      <h1 style={{ margin: 0, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 24}px)`, fontFamily: serif, fontWeight: 400, fontSize: 100, lineHeight: 1.08, letterSpacing: '-0.02em', maxWidth: 860 }}>
        {title} <span style={{ fontStyle: 'italic', color: C.lilac }}>{emphasis}</span>
      </h1>
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: circleIn }}>
        <div style={{ position: 'relative', width: 720, height: 720, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 720, height: 720, borderRadius: 360, background: C.logoTile, opacity: pulse, filter: 'blur(90px)', transform: `scale(${scale})` }} />
          <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: 280, background: C.violet, opacity: 0.22, transform: `scale(${scale})` }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, background: C.violetSoft, opacity: 0.35, transform: `scale(${scale})` }} />
          <div style={{ position: 'relative', opacity: cueIn, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '0.04em', color: '#FFFFFF' }}>{cue}</div>
            <div style={{ fontFamily: serif, fontSize: 64, color: C.text, opacity: 0.75 }}>{count || ''}</div>
          </div>
        </div>
      </div>
      <p style={{ margin: '0 0 48px', opacity: closeIn, fontFamily: serif, fontStyle: 'italic', fontSize: 56, lineHeight: 1.3, color: C.text, maxWidth: 820 }}>{closing}</p>
      <div style={{ opacity: Math.max(titleIn * 0.6, closeIn) }}>
        <Wordmark scale={1.15} />
      </div>
    </AbsoluteFill>
  );
};
