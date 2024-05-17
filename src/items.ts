import { GameState } from './state';

export type Item = {
  name: string;
  description: string;
  effects: {
    propName: keyof GameState;
    propModifier: number;
    effectType: 'ADDITIVE' | 'MULTIPLICATIVE' | 'ABSOLUTE';
  }[];
  maxStackSize: number;
  cost?: number;
};

const healthItem: Item = {
  name: 'The Replenishing Rock',
  description: 'Gives +5 maximum lives',
  effects: [
    { propName: 'maxLives', propModifier: 5, effectType: 'ADDITIVE' },
    { propName: 'currentLives', propModifier: 5, effectType: 'ADDITIVE' },
  ],
  maxStackSize: 1,
  cost: 5,
};

// const clicksItem: Item = {
//   name: 'The Booster Juice',
//   description: 'Gives +40 clicks',
//   effects: [{ propName: 'clicks', propModifier: 40, effectType: 'ADDITIVE' }],
//   maxStackSize: 1,
//   cost: 5,
// };

const torch: Item = {
  name: 'Torches of Shining',
  description: 'A bundle of 10 torches',
  effects: [{ propName: 'torches', propModifier: 10, effectType: 'ADDITIVE' }],
  maxStackSize: 1,
  cost: 5,
};

const gold: Item = {
  name: 'Gold',
  description: 'Shiiiiiny!',
  effects: [],
  maxStackSize: 5,
};

export const items = [healthItem, torch, gold];
