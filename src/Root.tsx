import React from 'react';
import { Composition, Still } from 'remotion';
import { Quote, QuoteProps } from './Quote';
import { Reel, ReelProps, REEL_SECONDS } from './Reel';

const quoteDefaults: QuoteProps = {
  mood: 'violet',
  label: 'WHY GUARDIAN EXISTS',
  lead: 'You were made for more than a screen at',
  emphasis: '2 a.m.',
};

const reelDefaults: ReelProps = {
  title: 'When the urge comes,',
  emphasis: 'breathe.',
  closing: 'It will pass. It always does.',
};

export const Root: React.FC = () => (
  <>
    <Still id="Quote" component={Quote} width={1080} height={1350} defaultProps={quoteDefaults} />
    <Composition id="Reel" component={Reel} width={1080} height={1920} fps={30} durationInFrames={REEL_SECONDS * 30} defaultProps={reelDefaults} />
  </>
);
