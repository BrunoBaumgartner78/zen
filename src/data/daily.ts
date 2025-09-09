// src/data/daily.ts
export type DailyCard = { id: string; image: string; quote: string; author?: string }

export const DAILY_CARDS: DailyCard[] = [
  {
    id: '1',
    image: '/daily/1.png',
    quote: 'Ruhe ist die höchste Form der Stärke.',
    author: 'Laozi',
  },
  {
    id: '2',
    image: '/daily/2.png',
    quote: 'Wer loslässt, hat beide Hände frei.',
  },
  {
    id: '3',
    image: '/daily/3.png',
    quote: 'Atme ein, lächle. Atme aus, lächle.',
  },
  {
    id: '4',
    image: '/daily/4.png',
    quote: 'Die Wellen beruhigen den Stein und den Geist.',
  },
  {
    id: '5',
    image: '/daily/5.png',
    quote: 'Stille ist nicht leer. Sie ist voller Antworten.',
  },
  {
    id: '6',
    image: '/daily/6.png',
    quote: 'Der Weg ist der Garten.',
  },
  {
    id: '7',
    image: '/daily/7.png',
    quote: 'Heute reicht – morgen wächst von selbst.',
  },
]
