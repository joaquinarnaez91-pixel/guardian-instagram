import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, Wordmark, sans, serif } from './brand';

export type PhotoQuoteProps = {
  image: string;
  label: string;
  lead: string;
  emphasis: string;
  /** Extra scale to crop a frame some image models add; 1 for clean images. */
  zoom?: number;
  /** Vertical framing of the photo, 0 (top) to 100 (bottom). */
  focus?: number;
};

/** An AI-made photo, darkened at the bottom so the line reads; the type stays Guardian's. */
export const PhotoQuote: React.FC<PhotoQuoteProps> = ({ image, label, lead, emphasis, zoom = 1, focus = 35 }) => (
  <AbsoluteFill style={{ background: C.ground, color: C.text, fontFamily: sans, overflow: 'hidden' }}>
    {/* The tint pulls the photo into Guardian's navy. */}
    <Img src={staticFile(image)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${focus}%`, transform: `scale(${zoom})` }} />
    <div style={{ position: 'absolute', inset: 0, background: '#2B2A6E', mixBlendMode: 'multiply', opacity: 0.45 }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,16,32,0) 30%, rgba(11,16,32,0.75) 62%, #0B1020 92%)' }} />
    <div style={{ position: 'absolute', inset: 0, padding: '110px 104px 96px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 40 }}>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.2em', color: C.lilac }}>{label}</div>
      <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 96, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
        {lead} <span style={{ fontStyle: 'italic', color: C.lilac }}>{emphasis}</span>
      </h1>
      <div style={{ marginTop: 24 }}><Wordmark /></div>
    </div>
  </AbsoluteFill>
);
