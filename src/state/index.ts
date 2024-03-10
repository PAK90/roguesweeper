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
  startingMines: number;
  mines: Mine[];
  clicked: Coordinate[];
  flags: Flag[];
};

type Actions = {
  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setStartingMines: (sm: number) => void;
  takeLife: () => void;
  reduceClicks: () => void;
  addMine: (m: Mine) => void;
  setMines: (m: Mine[]) => void;
  clickCell: (c: Coordinate, cellValue: string) => void;
  addFlag: (c: Coordinate) => void;
  resetGame: () => void;
};

export const useGameStore = create<State & Actions>()(
  immer((set) => ({
    width: 10,
    height: 10,
    startingMines: 10,
    lives: 5,
    clicks: 10,
    mines: [],
    clicked: [],
    flags: [],
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
    addMine: (m: Mine) =>
      set((state) => {
        state.mines.push(m);
      }),
    setMines: (m: Mine[]) =>
      set((state) => {
        state.mines = m;
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
        // if the cell's value is 0, we want to 'click' all adjacent 0 cells, and to do this recursively.
        if (cellValue === '') {
          const clickAdjacent = (coord: Coordinate) => {
            // make sure we're not re-checking the same dang cell
            if (state.clicked.some((clicked) => equalsCheck(clicked, coord))) return;
            state.clicked.push(coord);

            const isThisCellEmpty = calculateCellNumber({ x: coord[0], y: coord[1] }, state.mines) === 0;

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
        state.clicked.push(c);
      });
    },
    resetGame: () => {
      set((state) => {
        state.mines = generateMines(state.width, state.height, state.startingMines);
        state.clicked = [];
        state.flags = [];
      });
    },
  })),
);

const equalsCheck = (a: Coordinate, b: Coordinate) => a.length === b.length && a.every((v, i) => v === b[i]);
