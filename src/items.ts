import { GameState } from './state';

export type Item = {
  name: string;
  description: string;
  modifiers: {
    propName: keyof GameState;
    propModifier: number;
    modifierType: 'ADDITIVE' | 'MULTIPLICATIVE' | 'ABSOLUTE';
  }[];
  maxStackSize: number;
  cost?: number;
};

const healthItem: Item = {
  name: 'The Replenishing Rock',
  description: 'Gives +5 lives',
  modifiers: [{ propName: 'lives', propModifier: 5, modifierType: 'ADDITIVE' }],
  maxStackSize: 1,
  cost: 5,
};

const clicksItem: Item = {
  name: 'The Booster Juice',
  description: 'Gives +40 clicks',
  modifiers: [{ propName: 'clicks', propModifier: 40, modifierType: 'ADDITIVE' }],
  maxStackSize: 1,
  cost: 5,
};

const torch: Item = {
  name: 'Torches of Shining',
  description: 'A bundle of 10 torches',
  modifiers: [{ propName: 'torches', propModifier: 10, modifierType: 'ADDITIVE' }],
  maxStackSize: 1,
  cost: 5,
};

const gold: Item = {
  name: 'Gold',
  description: 'Shiiiiiny!',
  modifiers: [],
  maxStackSize: 5,
};

export const items = [healthItem, clicksItem, torch, gold];
