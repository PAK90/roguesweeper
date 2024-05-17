import { GameState } from './state';

export type Modifier = {
  name: string;
  description: string;
  duration: number; // clicks or levels or no duration? unsure yet
  effects: {
    propName: keyof GameState;
    propModifier: number;
    effectType: 'ADDITIVE' | 'MULTIPLICATIVE' | 'ABSOLUTE';
  }[];
  weight: number;
};

export const negativeModifiers: Modifier[] = [
  {
    name: 'Stunted',
    description: '50% less click range',
    duration: 20,
    effects: [
      {
        propName: 'clickRange',
        effectType: 'MULTIPLICATIVE',
        propModifier: 0.5,
      },
    ],
    weight: 100,
  },
  {
    name: 'Pit Trap',
    description: 'Lose 2 lives',
    duration: 20,
    effects: [
      {
        propName: 'currentLives',
        effectType: 'ADDITIVE',
        propModifier: -2,
      },
    ],
    weight: 100,
  },
];

export const positiveModifiers: Modifier[] = [
  {
    name: 'Ranged',
    description: '50% more click range',
    duration: 20,
    effects: [
      {
        propName: 'clickRange',
        effectType: 'MULTIPLICATIVE',
        propModifier: 2,
      },
    ],
    weight: 100,
  },
];
