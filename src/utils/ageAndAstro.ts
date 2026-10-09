import { AgeBreakdown, AstrologicalData } from '../types';

// Exact birth date: 13 October 2005
// Moolank 4 (1+3=4 from date 13), ruled by Rahu in numerology
// Zodiac: Taurus (Vedic/Western), Earth sign, Fixed modality, ruled by Venus
export const BIRTH_DATE = new Date(2005, 9, 13, 0, 0, 0); // October 13, 2005
export const BIRTH_YEAR = 2005;

export function calculateAgeBreakdown(targetNow: Date = new Date()): AgeBreakdown {
  const diffMs = targetNow.getTime() - BIRTH_DATE.getTime();

  if (diffMs < 0) {
    return {
      years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
      totalDays: 0, totalHours: 0, totalHeartbeats: 0,
      nextBirthdayDays: 0, nextBirthdayHours: 0, nextBirthdayMinutes: 0, nextBirthdaySeconds: 0,
      isBirthdayToday: false, ageTurning: 0,
    };
  }

  let years = targetNow.getFullYear() - BIRTH_DATE.getFullYear();
  let birthThisYear = new Date(targetNow.getFullYear(), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate(), BIRTH_DATE.getHours(), BIRTH_DATE.getMinutes());
  if (targetNow < birthThisYear) years -= 1;

  let tempDate = new Date(BIRTH_DATE);
  tempDate.setFullYear(tempDate.getFullYear() + years);

  let months = 0;
  while (true) {
    const nextMonth = new Date(tempDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= targetNow) { tempDate = nextMonth; months++; } else break;
  }

  const remainderMs = targetNow.getTime() - tempDate.getTime();
  const days = Math.floor(remainderMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainderMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainderMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainderMs % (1000 * 60)) / 1000);

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalHeartbeats = Math.floor((diffMs / 1000 / 60) * 75);

  const currentYear = targetNow.getFullYear();
  let nextBday = new Date(currentYear, 9, 13, 0, 0, 0);
  if (targetNow.getTime() > nextBday.getTime()) {
    nextBday = new Date(currentYear + 1, 9, 13, 0, 0, 0);
  }

  const nextDiffMs = Math.max(0, nextBday.getTime() - targetNow.getTime());
  const nextBirthdayDays = Math.floor(nextDiffMs / (1000 * 60 * 60 * 24));
  const nextBirthdayHours = Math.floor((nextDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const nextBirthdayMinutes = Math.floor((nextDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  const nextBirthdaySeconds = Math.floor((nextDiffMs % (1000 * 60)) / 1000);

  const isBirthdayToday = targetNow.getMonth() === 9 && targetNow.getDate() === 13;
  const ageTurning = isBirthdayToday ? years : years + 1;

  return {
    years, months, days, hours, minutes, seconds,
    totalDays, totalHours, totalHeartbeats,
    nextBirthdayDays, nextBirthdayHours, nextBirthdayMinutes, nextBirthdaySeconds,
    isBirthdayToday, ageTurning,
  };
}

export const ASTROLOGICAL_PROFILE: AstrologicalData = {
  sunSign: 'Taurus',
  sunSymbol: '♉',
  birthDateString: 'October 13, 2005',
  birthTime: 'Moolank 4 • Rahu',
  rulingPlanet: 'Venus (Planet of Love, Beauty & Luxury) • Rahu (Moolank 4)',
  element: 'Earth (Grounded, Reliable, Sensual & Strong)',
  modality: 'Fixed (Stable, Determined, Loyal & Steadfast)',
  moonSign: 'Taurus / Aries (Passionate, Determined Protector)',
  decan: 'Second Decan (Ruled by Mercury - Intellectual Depth & Wit)',
  gemstone: 'Diamond & Emerald (Moolank 4: Gomed/Hessonite)',
  flower: 'Rose & Poppy',
  luckyColors: ['Royal Blue', 'Deep Emerald Green', 'Rose Gold', 'Midnight Black'],
  luckyNumbers: [4, 13, 22, 31],
  tarotCards: ['The Emperor (IV - Structure & Power)', 'The Hierophant (V - Wisdom)'],
  personalityTraits: [
    {
      title: 'Rock-Steady Loyalty (Taurus Earth)',
      description: 'As a true Taurus bull, you are fiercely loyal, reliable, and the strongest shoulder for everyone you love. Once you care, you care forever.',
      icon: '🐂',
    },
    {
      title: 'Moolank 4 - Rahu Energy',
      description: 'Born with root number 4 under Rahu&apos;s gaze, you possess a magnetic, unconventional mind, sharp intelligence, and the power to break rules and build your own path.',
      icon: '🔮',
    },
    {
      title: 'Venusian Heart & Taste',
      description: 'Ruled by Venus too, you have an eye for beauty, great taste in music and aesthetics, and a soft romantic heart hidden beneath that strong exterior.',
      icon: '💖',
    },
    {
      title: 'Determined Protector',
      description: 'When you set your mind on something or someone, nothing can shake you. You protect your people with a quiet, unshakable strength that makes everyone feel safe around you.',
      icon: '🛡️',
    },
  ],
};
