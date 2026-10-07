import { AgeBreakdown, AstrologicalData } from '../types';

// Exact birth date: 7 October 2006, 11:30 PM (23:30)
export const BIRTH_DATE = new Date(2006, 9, 7, 23, 30, 0);

export function calculateAgeBreakdown(targetNow: Date = new Date()): AgeBreakdown {
  const diffMs = targetNow.getTime() - BIRTH_DATE.getTime();

  // If before birth date (safety)
  if (diffMs < 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      totalHours: 0,
      totalHeartbeats: 0,
      nextBirthdayDays: 0,
      nextBirthdayHours: 0,
      nextBirthdayMinutes: 0,
      nextBirthdaySeconds: 0,
      isBirthdayToday: false,
      ageTurning: 0,
    };
  }

  // Calculate calendar years, months, days
  let years = targetNow.getFullYear() - BIRTH_DATE.getFullYear();
  let birthThisYear = new Date(targetNow.getFullYear(), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate(), BIRTH_DATE.getHours(), BIRTH_DATE.getMinutes());

  if (targetNow < birthThisYear) {
    years -= 1;
  }

  // Exact calendar difference
  let tempDate = new Date(BIRTH_DATE);
  tempDate.setFullYear(tempDate.getFullYear() + years);

  let months = 0;
  while (true) {
    const nextMonth = new Date(tempDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= targetNow) {
      tempDate = nextMonth;
      months++;
    } else {
      break;
    }
  }

  const remainderMs = targetNow.getTime() - tempDate.getTime();
  const days = Math.floor(remainderMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainderMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainderMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainderMs % (1000 * 60)) / 1000);

  // Totals
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  // Average resting heartbeat ~75 bpm
  const totalHeartbeats = Math.floor((diffMs / 1000 / 60) * 75);

  // Next Birthday countdown
  const currentYear = targetNow.getFullYear();
  let nextBday = new Date(currentYear, 9, 7, 23, 30, 0);
  if (targetNow.getTime() > nextBday.getTime()) {
    nextBday = new Date(currentYear + 1, 9, 7, 23, 30, 0);
  }

  const nextDiffMs = Math.max(0, nextBday.getTime() - targetNow.getTime());
  const nextBirthdayDays = Math.floor(nextDiffMs / (1000 * 60 * 60 * 24));
  const nextBirthdayHours = Math.floor((nextDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const nextBirthdayMinutes = Math.floor((nextDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  const nextBirthdaySeconds = Math.floor((nextDiffMs % (1000 * 60)) / 1000);

  // Check if today is October 7
  const isBirthdayToday = targetNow.getMonth() === 9 && targetNow.getDate() === 7;
  const ageTurning = isBirthdayToday ? years : years + 1;

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalHeartbeats,
    nextBirthdayDays,
    nextBirthdayHours,
    nextBirthdayMinutes,
    nextBirthdaySeconds,
    isBirthdayToday,
    ageTurning,
  };
}

export const ASTROLOGICAL_PROFILE: AstrologicalData = {
  sunSign: 'Libra',
  sunSymbol: '♎',
  birthDateString: 'October 7, 2006',
  birthTime: '11:30 PM (23:30)',
  rulingPlanet: 'Venus (Goddess of Beauty & Harmony)',
  element: 'Air (Breezy, Intellectual & Radiant)',
  modality: 'Cardinal (Initiator, Visionary Diplomat)',
  moonSign: 'Aries (Fierce Inner Fire & Passionate Courage)',
  decan: 'Second Decan (Ruled by Uranus / Aquarius - Creative Genius)',
  gemstone: 'Opal & Rose Quartz',
  flower: 'Rose & Bluebell',
  luckyColors: ['Rose Quartz Pink', 'Warm Champagne Gold', 'Pastel Peach', 'Sky Blue'],
  luckyNumbers: [7, 15, 24],
  tarotCards: ['Justice (XI - Truth & Balance)', 'The Empress (III - Venusian Abundance)'],
  personalityTraits: [
    {
      title: 'Effortless Grace & Charm',
      description: 'Ruled by Venus, you bring natural aesthetic harmony, warmth, and gentleness to everyone in your orbit.',
      icon: '✨',
    },
    {
      title: 'Fierce Loyal Heart (Aries Moon)',
      description: 'Behind your peaceful Libra smile lies a deeply passionate, loyal, and brave heart that protects loved ones.',
      icon: '🔥',
    },
    {
      title: 'Creative Aesthetic Sense',
      description: 'An eye for sweet visual balance, soft pastel palettes, thoughtful music, and making life look and feel like art.',
      icon: '🎨',
    },
    {
      title: 'The Midnight Peacemaker',
      description: 'Born at 11:30 PM under starry skies, your intuition is luminous. You heal discord and sprinkle quiet joy.',
      icon: '🌙',
    },
  ],
};
