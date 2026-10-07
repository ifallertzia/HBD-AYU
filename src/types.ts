export interface Wish {
  id: string;
  name: string;
  relationship: string;
  message: string;
  sticker: string;
  theme: 'rose' | 'gold' | 'lavender' | 'peach' | 'mint';
  likes: number;
  createdAt: string;
}

export interface MemoryPhoto {
  id: string;
  year: number;
  age: number;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
  tag: string;
}

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalHeartbeats: number;
  nextBirthdayDays: number;
  nextBirthdayHours: number;
  nextBirthdayMinutes: number;
  nextBirthdaySeconds: number;
  isBirthdayToday: boolean;
  ageTurning: number;
}

export interface AstrologicalData {
  sunSign: string;
  sunSymbol: string;
  birthDateString: string;
  birthTime: string;
  rulingPlanet: string;
  element: string;
  modality: string;
  moonSign: string;
  decan: string;
  gemstone: string;
  flower: string;
  luckyColors: string[];
  luckyNumbers: number[];
  tarotCards: string[];
  personalityTraits: {
    title: string;
    description: string;
    icon: string;
  }[];
}
