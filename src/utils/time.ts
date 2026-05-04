import type { Vector3Tuple } from 'three';

export type Mood = 'sunrise' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'night';

interface MoodColors {
  top: [number, number, number];
  bottom: [number, number, number];
}

// Gradient color pairs in RGB 0–1 for each mood
const MOOD_COLORS: Record<Mood, MoodColors> = {
  // TODO: convert hex constants to 0–1 RGB triples
  // Sunrise:   #FFC8A0 → #FFE4C8
  // Morning:   #E8F4FF → #FFFFFF
  // Noon:      #FFFFFF → #F0F8FF
  // Afternoon: #FFF8E8 → #FFE8C0
  // Sunset:    #FFB088 → #FF8060
  // Night:     #1A1A2E → #16213E
  sunrise:   { top: [1, 0.784, 0.627], bottom: [1, 0.894, 0.784] },
  morning:   { top: [0.910, 0.957, 1],   bottom: [1, 1, 1] },
  noon:      { top: [1, 1, 1],           bottom: [0.941, 0.973, 1] },
  afternoon: { top: [1, 0.973, 0.910],   bottom: [1, 0.910, 0.753] },
  sunset:    { top: [1, 0.690, 0.533],   bottom: [1, 0.502, 0.376] },
  night:     { top: [0.102, 0.102, 0.180], bottom: [0.086, 0.129, 0.243] },
};

// Hour ranges (Mexico City local time): [startHour, endHour)
const MOOD_RANGES: Array<[Mood, number, number]> = [
  ['sunrise',   5,  7],
  ['morning',   7, 12],
  ['noon',     12, 14],
  ['afternoon',14, 18],
  ['sunset',   18, 20],
  ['night',    20, 29], // 29 wraps through midnight to 5
];

function getMexicoCityHour(): { hour: number; minute: number } {
  // TODO: use Intl.DateTimeFormat with timeZone 'America/Mexico_City' to get local hour/minute
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '12', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);
  return { hour, minute };
}

export function getMood(): Mood {
  // TODO: map current Mexico City hour to Mood
  const { hour } = getMexicoCityHour();
  const h = hour % 24;
  for (const [mood, start, end] of MOOD_RANGES) {
    if (end <= 24) {
      if (h >= start && h < end) return mood;
    } else {
      if (h >= start || h < end - 24) return mood;
    }
  }
  return 'night';
}

export function getMoodColors(): MoodColors {
  return MOOD_COLORS[getMood()];
}

export function getMoodFloat(): number {
  // TODO: return 0–1 progress within the current mood's time window
  const { hour, minute } = getMexicoCityHour();
  const mood = getMood();
  const range = MOOD_RANGES.find(([m]) => m === mood);
  if (!range) return 0;
  const [, start, end] = range;
  const duration = (end - start) * 60; // minutes
  const elapsed = (hour - start) * 60 + minute;
  return Math.min(Math.max(elapsed / duration, 0), 1);
}
