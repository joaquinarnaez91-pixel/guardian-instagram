import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { C, Mark, sans, serif } from './brand';

export const CLIP_FPS = 30;
export const CLOSE_SECONDS = 3;

export type ClipLine = { at: number; until: number; lead?: string; emphasis?: string };
export type ClipReelProps = {
  /** A clip already made for the story Reel, from public/reel/<clip>_veo.mp4. */
  clip: string;
  start?: number;
  len: number;
  lines: ClipLine[];
  closing: string;
};

const s = (sec: number) => Math.round(sec * CLIP_FPS);
const ease = Easing.inOut(Easing.sin);

/** A short Reel cut from footage we already have: the shot, a line or two, Guardian's close. */
export const ClipReel: React.FC<ClipReelProps> = ({ clip, start = 0, len, lines, closing }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.groundDeep }}>
      <Sequence durationInFrames={s(len)}>
        <OffthreadVideo src={staticFile(`reel/${clip}_veo.mp4`)} startFrom={s(start)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 28, letterSpacing: '0.2em', color: C.muted }}>GUARDIAN · FOLLOW FOR LAUNCH</div>
      </div>
    </AbsoluteFill>
  );
};
