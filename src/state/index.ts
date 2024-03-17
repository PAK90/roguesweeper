import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import calculateCellNumber from '../helpers/calculateCellNumber.ts';
import generateMines from '../helpers/generateMines.ts';

export type Mine = [number, number];
export type Coordinate = [number, number];
export type Flag = [number, number];

type State = {
  lives: number;
  clicks: number;
  width: number;
  height: number;
  layer: number;
  startingMines: number;
  mines: [Mine[]];
  clicked: Coordinate[];
  flags: Flag[];
};

type Actions = {
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
  resetGame: () => void;
};

export const useGameStore = create<State & Actions>()(
  immer((set, get) => ({
    width: 10,
    height: 10,
    startingMines: 10,
    lives: 5,
    clicks: 10,
    layer: 0,
    mines: [[]],
    clicked: [],
    flags: [],

    getCurrentLayerMines: () => {
      const state = get();
      return state.mines[state.layer];
    },

    setWidth: (w: number) =>
      set((state) => {
        state.width = w;
      }),
    setHeight: (h: number) =>
      set((state) => {
        state.height = h;
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
        if (!state.mines[v]) {
          state.mines[state.layer] = generateMines(state.height, state.width, state.startingMines);
        }
      }),
    addFlag: (c: Coordinate) => {
      set((state) => {
        // flags are toggle-able.
        const flagIndex = state.flags.findIndex((flag) => equalsCheck(flag, c));
        if (flagIndex === -1) {
          state.flags.push(c as Flag);
        } else {
          state.flags.splice(flagIndex, 1);
        }
      });
    },
    clickCell: (c: Coordinate, cellValue: string) => {
      set((state) => {
        // take a click
        state.reduceClicks();
        // if the cell's value is 0, we want to 'click' all adjacent 0 cells, and to do this recursively.
        if (cellValue === '') {
          const clickAdjacent = (coord: Coordinate) => {
            // make sure we're not re-checking the same dang cell
            if (state.clicked.some((clicked) => equalsCheck(clicked, coord))) return;
            state.clicked.push(coord);

            const isThisCellEmpty = calculateCellNumber({ x: coord[0], y: coord[1] }, state.mines[state.layer]) === 0;

            for (let i = coord[0] - 1; i <= coord[0] + 1; i++) {
              for (let j = coord[1] - 1; j <= coord[1] + 1; j++) {
                if (isThisCellEmpty && i >= 0 && i < state.width && j >= 0 && j < state.height) {
                  clickAdjacent([i, j]);
                }
              }
            }
          };
          clickAdjacent(c);
        }

        // TODO: maybe ever find out why this check is necessary; sometimes it over-counts clicks.
        // but at least this line solves the bug, so click counting is reliable.
        // solved (I think); the clear origin cell gets added twice; once in the recursion and another time here.
        // so instead of the expensive loop check, just don't re-push if it was a clear cell to start!
        // if (!state.clicked.some((clicked) => equalsCheck(clicked, c))) {
        if (cellValue !== '') {
          state.clicked.push(c);
        }
        if (cellValue === 'M') {
          state.takeLife();
        }
      });
    },
    resetGame: () => {
      set((state) => {
        state.mines[0] = generateMines(state.width, state.height, state.startingMines);
        state.clicked = [];
        state.flags = [];
        state.layer = 0;
        state.lives = 5;
        state.clicks = 100;
      });
    },
  })),
);

const equalsCheck = (a: Coordinate, b: Coordinate) => a.length === b.length && a.every((v, i) => v === b[i]);
