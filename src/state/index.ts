import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import calculateCellNumber from '../helpers/calculateCellNumber.ts';
import generateLayerObjects from '../helpers/generateLayerObjects.ts';
// import { Item } from '../items.ts';

export type Mine = [number, number];
export type Coordinate = [number, number];
export type Flag = [number, number];

export type GameState = {
  shopping: boolean;
  lives: number;
  clicks: number;
  width: number[];
  height: number[];
  layer: number;
  startingMines: number;
  mines: [Mine[]];
  clicked: [Coordinate[]];
  flags: [Flag[]];
};

type Actions = {
  toggleShop: () => void;
  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setStartingMines: (sm: number) => void;
  takeLife: () => void;
  reduceClicks: () => void;
  // addMine: (m: Mine) => void;
  setMines: (m: Mine[]) => void;
  setLayer: (v: number) => void;
  clickCell: (c: Coordinate, cellValue: string) => void;
  addFlag: (c: Coordinate) => void;

  getCurrentLayerMines: () => Mine[];
  getCurrentLayerClicks: () => Coordinate[];
  getCurrentLayerFlags: () => Flag[];

  // useItem: (i: Item) => void;

  resetGame: () => void;
};

export const useGameStore = create<GameState & Actions>()(
  immer((set, get) => ({
    shopping: false,
    width: [15],
    height: [15],
    startingMines: 10,
    lives: 3,
    clicks: 30,
    layer: 0,
    mines: [[]],
    clicked: [[]],
    flags: [[]],

    getCurrentLayerMines: () => {
      const state = get();
      return state.mines[state.layer];
    },
    getCurrentLayerClicks: () => {
      const state = get();
      return state.clicked[state.layer];
    },
    getCurrentLayerFlags: () => {
      const state = get();
      return state.flags[state.layer];
    },

    toggleShop: () =>
      set((state) => {
        state.shopping = !state.shopping;
      }),
    setWidth: (w: number) =>
      set((state) => {
        state.width[0] = w;
      }),
    setHeight: (h: number) =>
      set((state) => {
        state.height[0] = h;
      }),
    setStartingMines: (sm: number) =>
      set((state) => {
        state.startingMines = sm;
      }),
    takeLife: () =>
      set((state) => {
        state.lives -= 1;
      }),
    reduceClicks: () =>
      set((state) => {
        state.clicks -= 1;
      }),
    // addMine: (m: Mine) =>
    //   set((state) => {
    //     state.mines.push(m);
    //   }),
    setMines: (m: Mine[]) =>
      set((state) => {
        state.mines[state.layer] = m;
      }),
    setLayer: (v: number) =>
      set((state) => {
        state.layer = v;
        // if there are no mines on this layer, make some.
        // this... may need to be an object/dict instead of just a plain array,
        // especially if layer skipping becomes a thing... or maybe not.
        // also might be necessary to buffer-generate layers, especially if transparency is a thing
        // const layerScaling = Math.exp(state.layer / 30);
        const layerScaling = 1; // temporary to work with lighting tests
        if (!state.height[state.layer]) {
          state.height[state.layer] = Math.floor(state.height[0] * layerScaling);
        }
        if (!state.width[state.layer]) {
          state.width[state.layer] = Math.floor(state.width[0] * layerScaling);
        }
        if (!state.mines[v]) {
          const mines = generateLayerObjects(
            Math.floor(state.height[0] * layerScaling),
            Math.floor(state.width[0] * layerScaling),
            Math.floor(state.startingMines * layerScaling ** 2),
          );
          state.mines[state.layer] = mines;
          // state.shops[state.layer] = shops;
        }
        if (!state.clicked[v]) {
          state.clicked[state.layer] = [];
        }
        if (!state.flags[v]) {
          state.flags[state.layer] = [];
        }
      }),
    addFlag: (c: Coordinate) => {
      set((state) => {
        // flags are toggle-able.
        const flagIndex = state.flags[state.layer].findIndex((flag) => equalsCheck(flag, c));
        if (flagIndex === -1) {
          state.flags[state.layer].push(c as Flag);
        } else {
          state.flags[state.layer].splice(flagIndex, 1);
        }
      });
    },
    clickCell: (c: Coordinate, cellValue: string) => {
      set((state) => {
        // take a click
        state.clicks -= 1;
        // if the cell's value is 0, we want to 'click' all adjacent 0 cells, and to do this recursively.
        if (cellValue === '') {
          const clickAdjacent = (coord: Coordinate) => {
            // make sure we're not re-checking the same dang cell
            if (state.clicked[state.layer].some((clicked) => equalsCheck(clicked, coord))) return;
            state.clicked[state.layer].push(coord);

            const isThisCellEmpty = calculateCellNumber({ x: coord[0], y: coord[1] }, state.mines[state.layer]) === 0;

            for (let i = coord[0] - 1; i <= coord[0] + 1; i++) {
              for (let j = coord[1] - 1; j <= coord[1] + 1; j++) {
                if (
                  isThisCellEmpty &&
                  i >= 0 &&
                  i < state.width[state.layer] &&
                  j >= 0 &&
                  j < state.height[state.layer]
                ) {
                  clickAdjacent([i, j]);
                }
              }
            }
          };
          clickAdjacent(c);
        }

        // solved (I think); the clear origin cell gets added twice; once in the recursion and another time here.
        // so instead of the expensive loop check, just don't re-push if it was a clear cell to start!
        if (cellValue !== '') {
          state.clicked[state.layer].push(c);
        }
        if (cellValue === 'M') {
          // state.takeLife();
          state.lives -= 1;
        }
      });
    },
    // useItem: (i: Item) => {},
    resetGame: () => {
      set((state) => {
        const mines = generateLayerObjects(state.width[0], state.height[0], state.startingMines);
        state.mines[0] = mines;
        // state.shops[0] = shops;
        state.clicked = [[]];
        state.flags = [[]];
        state.layer = 0;
        state.lives = 3;
        state.clicks = 30;
      });
    },
  })),
);

const equalsCheck = (a: Coordinate, b: Coordinate) => a.length === b.length && a.every((v, i) => v === b[i]);
