import React from 'react';
import { Composition, Still } from 'remotion';
import { Quote, QuoteProps } from './Quote';
import { Reel, ReelProps, REEL_SECONDS } from './Reel';
import { Journey, JourneyProps } from './Journey';
import { Character, CharacterProps } from './Character';
import { PhotoQuote, PhotoQuoteProps } from './PhotoQuote';
import { StoryReel, STORY_SECONDS, FPS } from './StoryReel';
import { ClipReel, ClipReelProps, CLIP_FPS, CLOSE_SECONDS } from './ClipReel';

const clipDefaults: ClipReelProps = {
  clip: 'b2_breathe',
  len: 8,
  lines: [{ at: 0.5, until: 3.5, lead: 'Feel it rising?' }, { at: 4, until: 8, emphasis: 'Breathe.' }],
  closing: 'You just outlasted it.',
};

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

const journeyDefaults: JourneyProps = {
  label: 'THE JOURNEY',
  lead: 'Every day you hold on,',
  emphasis: 'you grow.',
  stages: ['journey_mage_stage_0', 'journey_mage_stage_4', 'journey_mage_stage_8'],
  captions: ['THE START', 'THE MIDDLE', 'WHO YOU BECOME'],
};

const characterDefaults: CharacterProps = {
  label: 'THE ASTRONAUT',
  lead: 'Lost the signal for a while?',
  emphasis: 'Find your course again.',
  art: 'journey_astronaut_stage_8',
};

const photoDefaults: PhotoQuoteProps = {
  image: 'photos/dawn.jpg',
  label: 'A NEW MORNING',
  lead: 'Last night you chose sleep.',
  emphasis: 'This morning, you feel it.',
};

export const Root: React.FC = () => (
  <>
    <Still id="Quote" component={Quote} width={1080} height={1350} defaultProps={quoteDefaults} />
    <Still id="Journey" component={Journey} width={1080} height={1350} defaultProps={journeyDefaults} />
    <Still id="Character" component={Character} width={1080} height={1350} defaultProps={characterDefaults} />
    <Still id="PhotoQuote" component={PhotoQuote} width={1080} height={1350} defaultProps={photoDefaults} />
    <Composition id="StoryReel" component={StoryReel} width={1080} height={1920} fps={FPS} durationInFrames={STORY_SECONDS * FPS} />
    <Composition
      id="ClipReel" component={ClipReel} width={1080} height={1920} fps={CLIP_FPS} durationInFrames={(8 + CLOSE_SECONDS) * CLIP_FPS} defaultProps={clipDefaults}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.round((props.len + CLOSE_SECONDS) * CLIP_FPS) })}
    />
    <Composition id="Reel" component={Reel} width={1080} height={1920} fps={30} durationInFrames={REEL_SECONDS * 30} defaultProps={reelDefaults} />
  </>
);
