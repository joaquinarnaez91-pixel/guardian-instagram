import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { C, Mark, sans, serif } from './brand';

// "Two ways tonight ends": Veo clips cut together, with Guardian's own type, curtain and close.
export const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

type Cut = { clip?: string; from: number; len: number; grade?: 'cold'; volume?: number; start?: number };
const CUTS: Cut[] = [
  { clip: 'k1_scroll', from: 0, len: 5.5 },
  { clip: 'k2_pull', from: 5.5, len: 4 },
  { clip: 'a1_glow', from: 9.5, len: 3.5, grade: 'cold', volume: 0.12 }, // the room goes quiet under the heartbeat
  { clip: 'a2_morning', from: 13, len: 4, grade: 'cold', volume: 0.6, start: 1 },
  { from: 17, len: 1.5 }, // "Or..."
  { clip: 'b1_curtain', from: 18.5, len: 5, start: 3 }, // the push-in to his phone, to the frame it rests on
  { from: 23.5, len: 3.5 }, // that last frame, the curtain on his screen
  { clip: 'b2_breathe', from: 27, len: 6.5 },
  { clip: 'm1_run', from: 33.5, len: 4 },
  { clip: 'm2_breakfast', from: 37.5, len: 4 },
  { from: 41.5, len: 4 }, // close
];
export const STORY_SECONDS = 45.5;

const ease = Easing.inOut(Easing.sin);
const fade = (frame: number, at: number, dur = 0.6) => interpolate(frame, [s(at), s(at + dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

const Clip: React.FC<{ cut: Cut }> = ({ cut }) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(`reel/${cut.clip}_veo.mp4`)}
      startFrom={s(cut.start ?? 0)}
      volume={cut.volume ?? 1}
      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: cut.grade === 'cold' ? 'saturate(0.3) brightness(0.82) contrast(1.05)' : 'none' }}
    />
    {cut.grade === 'cold' && <AbsoluteFill style={{ background: '#1B2A44', mixBlendMode: 'multiply', opacity: 0.35 }} />}
  </AbsoluteFill>
);

/** Text over footage: a soft shadow so it reads on any frame. */
const Line: React.FC<{ at: number; until: number; y: 'top' | 'middle' | 'bottom'; children: React.ReactNode }> = ({ at, until, y, children }) => {
  const frame = useCurrentFrame();
  const o = Math.min(fade(frame, at), 1 - fade(frame, until - 0.5, 0.5));
  if (o <= 0) return null;
  const place = y === 'top' ? { top: 260 } : y === 'middle' ? { top: 760 } : { bottom: 420 };
  return (
    <div style={{ position: 'absolute', left: 80, right: 80, ...place, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, textAlign: 'center', textShadow: '0 2px 24px rgba(7,10,22,0.85), 0 0 2px rgba(7,10,22,0.6)' }}>
      {children}
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.lilac }) => (
  <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.22em', color }}>{children}</div>
);
const Big: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 88 }) => (
  <div style={{ fontFamily: serif, fontWeight: 400, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.02em', color: C.text }}>{children}</div>
);

/** CSS matrix3d that maps a w×h box onto a quad (top-left, top-right, bottom-right, bottom-left). */
function warp(w: number, h: number, q: [number, number][]): string {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${x0},${y0},0,1)`;
}

// The screen's corners in the zoom's last frame (720×1280 footage shown at 1080×1920).
const SCREEN: [number, number][] = [[155, 339], [350, 334], [410, 767], [212, 797]].map(([x, y]) => [x * 1.5, y * 1.5]) as [number, number][];
const SW = 400, SH = 872;

/** Guardian's Safari curtain as curtain.html/css draws it, at phone size. */
const Curtain: React.FC<{ tap: number }> = ({ tap }) => (
  <div style={{ width: SW, height: SH, borderRadius: 46, background: C.ground, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center', fontFamily: sans, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: '31%', width: '38%', height: 30, background: '#05060B', borderRadius: '0 0 18px 18px' }} />
    <Img src={staticFile('icon.png')} style={{ width: 92, height: 92, borderRadius: 23, boxShadow: '0 0 60px rgba(139,124,255,0.4)' }} />
    <div style={{ marginTop: 28, color: C.violetSoft, fontSize: 15, fontWeight: 800, letterSpacing: '0.12em' }}>GUARDIAN</div>
    <div style={{ marginTop: 8, color: C.text, fontSize: 34, fontWeight: 800 }}>Take a breath</div>
    <div style={{ marginTop: 12, color: C.muted, fontSize: 18, lineHeight: 1.45, fontWeight: 500 }}>This is one of the moments you asked Guardian to help with. The choice is yours.</div>
    <div style={{ marginTop: 36, width: '100%', height: 60, borderRadius: 30, background: C.violet, color: C.ground, fontSize: 21, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${5 - 4 * tap}px 0 #5B4FCC`, transform: `translateY(${4 * tap}px) scale(${1 - 0.03 * tap})`, filter: `brightness(${1 + 0.25 * tap})` }}>I've got this</div>
    <div style={{ marginTop: 18, color: '#6B7394', fontSize: 17, fontWeight: 700 }}>Continue anyway</div>
  </div>
);

/** The push-in comes to rest on his phone; the curtain lights up his screen, the camera keeps easing in, he taps. */
const OnHisScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [0, s(0.5)], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const push = interpolate(frame, [0, s(3.5)], [1, 1.45], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const tap = interpolate(frame, [s(2.4), s(2.55), s(2.8)], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Push toward the middle of the screen.
  const cx = (SCREEN[0][0] + SCREEN[2][0]) / 2, cy = (SCREEN[0][1] + SCREEN[2][1]) / 2;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${cx}px ${cy}px` }}>
        <Img src={staticFile('reel/b1_last.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: warp(SW, SH, SCREEN), opacity: show * 0.97, filter: 'blur(0.4px)' }}>
          <Curtain tap={tap} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, s(0.8)], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const b = interpolate(frame, [s(0.9), s(1.7)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ background: C.ground, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 96px' }}>
      <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: 400, background: C.logoTile, opacity: 0.4, filter: 'blur(170px)' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <div style={{ opacity: a, width: 150, height: 150, borderRadius: 38, background: C.logoTile, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mark size={96} color="#FFFFFF" />
        </div>
        <div style={{ opacity: a }}>
          <Big size={84}>Guardian helps you fight for <span style={{ fontStyle: 'italic', color: C.lilac }}>what matters most to you.</span></Big>
        </div>
        <div style={{ opacity: b, fontFamily: sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.2em', color: C.muted }}>COMING SOON · iOS & ANDROID</div>
      </div>
    </AbsoluteFill>
  );
};

export const StoryReel: React.FC = () => {
  const or = CUTS[4], screen = CUTS[6], close = CUTS[10];
  return (
    <AbsoluteFill style={{ background: C.groundDeep }}>
      {CUTS.filter((c) => c.clip).map((c) => (
        <Sequence key={c.clip} from={s(c.from)} durationInFrames={s(c.len)}><Clip cut={c} /></Sequence>
      ))}
      <Sequence from={s(or.from)} durationInFrames={s(or.len)}>
        <AbsoluteFill style={{ background: C.ground, alignItems: 'center', justifyContent: 'center' }}>
          <Big size={150}><span style={{ fontStyle: 'italic', color: C.lilac }}>Or…</span></Big>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={s(screen.from)} durationInFrames={s(screen.len)}><OnHisScreen /></Sequence>
      <Sequence from={s(close.from)} durationInFrames={s(close.len)}><Close /></Sequence>

      {/* The pull: his heartbeat rises from the close-up, a muffled video plays from the phone. */}
      <Sequence from={s(7.5)} durationInFrames={s(6)}>
        <Audio src={staticFile('sfx/heartbeat.wav')} volume={(f) => interpolate(f, [0, s(1.5), s(5), s(6)], [0, 0.9, 0.9, 0], { extrapolateRight: 'clamp' })} />
      </Sequence>
      <Sequence from={s(9.5)} durationInFrames={s(3.5)}>
        <Audio src={staticFile('sfx/muffled.wav')} volume={(f) => interpolate(f, [0, s(0.4), s(3), s(3.5)], [0, 0.45, 0.45, 0], { extrapolateRight: 'clamp' })} />
      </Sequence>

      <Line at={0.5} until={5} y="top"><Label>11:47 PM</Label></Line>
      <Line at={6.3} until={9.5} y="bottom"><Big>Two ways tonight ends.</Big></Line>
      <Line at={9.8} until={13} y="top"><Label color="#B8C2DC">ONE WAY</Label></Line>
      <Line at={10.2} until={13} y="bottom"><Big size={84}><span style={{ fontStyle: 'italic', color: '#C9D0E6' }}>“Just one video…”</span></Big></Line>
      <Line at={13.4} until={17} y="bottom">
        <Big size={76}>You deserve better than this feeling.</Big>
        <div style={{ marginTop: 28, fontFamily: sans, fontWeight: 500, fontSize: 32, lineHeight: 1.45, color: '#C9D0E6' }}>And every view feeds an industry that profits from harm.</div>
      </Line>
      <Line at={18.8} until={23} y="top"><Label>THE OTHER WAY</Label></Line>
      <Line at={27.7} until={33} y="top"><Big size={96}><span style={{ fontStyle: 'italic', color: C.lilac }}>Breathe.</span></Big></Line>
      <Line at={34.1} until={37.5} y="bottom"><Big size={80}>Wake up proud.</Big></Line>
      <Line at={38.1} until={41.5} y="bottom"><Big size={80}>Be <span style={{ fontStyle: 'italic', color: C.lilac }}>fully there.</span></Big></Line>
    </AbsoluteFill>
  );
};
