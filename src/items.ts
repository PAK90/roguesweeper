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
};

const healthItem: Item = {
  name: 'The Replenishing Rock',
  description: "Not tasty, but it'll make you feel better",
  modifiers: [{ propName: 'lives', propModifier: 3, modifierType: 'ADDITIVE' }],
  maxStackSize: 1,
};

const clicksItem: Item = {
  name: 'Honk of Fear',
  description: 'Upon hearing it, you get a rush of energy',
  modifiers: [{ propName: 'clicks', propModifier: 30, modifierType: 'ADDITIVE' }],
  maxStackSize: 1,
};

const gold: Item = {
  name: 'Gold',
  description: 'Shiiiiiny!',
  modifiers: [],
  maxStackSize: 5,
};

export const items = [healthItem, clicksItem, gold];
