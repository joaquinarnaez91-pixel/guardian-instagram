import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { C, Mark, sans, serif } from './brand';

export const CLIP_FPS = 30;
export const CLOSE_SECONDS = 3;

export type ClipLine = { at: number; until: number; lead?: string; emphasis?: string };
/** One shot of a multi-clip story. "cold" desaturates it for the bad-night half of the story. */
export type ClipCut = { clip: string; start?: number; len: number; grade?: 'cold' };
export type ClipReelProps = {
  /** A clip already made for the story Reel, from public/reel/<clip>_veo.mp4. */
  clip?: string;
  start?: number;
  /** Or several shots played back to back; len must then equal their total. */
  cuts?: ClipCut[];
  len: number;
  lines: ClipLine[];
  closing: string;
};

const s = (sec: number) => Math.round(sec * CLIP_FPS);
const ease = Easing.inOut(Easing.sin);

const Shot: React.FC<{ cut: ClipCut }> = ({ cut }) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(`reel/${cut.clip}_veo.mp4`)} startFrom={s(cut.start ?? 0)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: cut.grade === 'cold' ? 'saturate(0.3) brightness(0.82) contrast(1.05)' : 'none' }}
    />
    {cut.grade === 'cold' && <AbsoluteFill style={{ background: '#1B2A44', mixBlendMode: 'multiply', opacity: 0.35 }} />}
  </AbsoluteFill>
);

/** A short Reel cut from footage we already have: the shot (or a few), a line or two, Guardian's close. */
export const ClipReel: React.FC<ClipReelProps> = ({ clip, start = 0, cuts, len, lines, closing }) => {
  const frame = useCurrentFrame();
  const shots = cuts ?? [{ clip: clip!, start, len }];
  const starts = shots.map((_, i) => shots.slice(0, i).reduce((t, c) => t + c.len, 0));
  return (
    <AbsoluteFill style={{ background: C.groundDeep }}>
      {shots.map((cut, i) => (
        <Sequence key={i} from={s(starts[i])} durationInFrames={s(cut.len)}><Shot cut={cut} /></Sequence>
      ))}
      <Sequence durationInFrames={s(len)}>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(7,10,22,0.35) 0%, rgba(7,10,22,0) 25%, rgba(7,10,22,0) 55%, rgba(7,10,22,0.7) 85%)' }} />
      </Sequence>
      {lines.map((l, i) => {
        // A line at 0 is the hook: on screen from the first frame, so the scroll stops on words, not a fade.
        const o = Math.min(
          l.at <= 0 ? 1 : interpolate(frame, [s(l.at), s(l.at + 0.6)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }),
          interpolate(frame, [s(l.until - 0.5), s(l.until)], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        );
        if (o <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: 90, right: 90, bottom: 440, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, textAlign: 'center', fontFamily: serif, fontSize: 92, lineHeight: 1.1, letterSpacing: '-0.02em', color: C.text, textShadow: '0 2px 24px rgba(7,10,22,0.85)' }}>
            {l.lead}{l.lead && l.emphasis ? ' ' : ''}{l.emphasis && <span style={{ fontStyle: 'italic', color: C.lilac }}>{l.emphasis}</span>}
          </div>
        );
      })}
      <Sequence from={s(len)}>
        <Close text={closing} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Close: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, s(0.7)], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ background: C.ground, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 96px', opacity: a }}>
      <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: 400, background: C.logoTile, opacity: 0.4, filter: 'blur(170px)' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 52 }}>
        <div style={{ width: 132, height: 132, borderRadius: 34, background: C.logoTile, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mark size={84} color="#FFFFFF" />
        </div>
        <div style={{ fontFamily: serif, fontSize: 80, lineHeight: 1.12, letterSpacing: '-0.02em', color: C.text }}>{text}</div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 28, letterSpacing: '0.2em', color: C.muted }}>GUARDIAN · FOR iPHONE</div>
      </div>
    </AbsoluteFill>
  );
};
