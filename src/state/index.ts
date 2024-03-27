import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import calculateCellNumber from '../helpers/calculateCellNumber.ts';
import generateLayerObjects from '../helpers/generateLayerObjects.ts';
// import { Item } from '../items.ts';

// export type Mine = [number, number];
export type Coordinate = [number, number];
export type Flag = [number, number];
export type Mines = { [key: string]: boolean };

interface BaseCell {
  mined?: boolean;
  clicked?: boolean;
  flagged?: boolean;
}

interface MinedCell extends BaseCell {
  mined: true;
}
interface ClickedCell extends BaseCell {
  clicked: true;
}
interface FlaggedCell extends BaseCell {
  flagged: true;
}

export type CellUpdateData = {
  [key: string]: MinedCell | ClickedCell | FlaggedCell;
};

export type GameState = {
  shopping: boolean;
  lives: number;
  clicks: number;
  width: number[];
  height: number[];
  layer: number;
  comboCount: number;
  position: Coordinate;
  startingMines: number;
  cellData: CellUpdateData;
  darknessData: { [key: string]: number };

  mineIndex: string[][];
};

type Actions = {
  toggleShop: () => void;
  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setStartingMines: (sm: number) => void;
  takeLife: () => void;
  reduceClicks: () => void;
  setLayer: (v: number) => void;
  clickCell: (c: Coordinate, cellValue: string) => void;
  addFlag: (c: Coordinate) => void;

  // useItem: (i: Item) => void;

  resetGame: () => void;
};

const WIDTH = 30;
const HEIGHT = 16;

export const useGameStore = create<GameState & Actions>()(
  immer((set) => ({
    shopping: false,
    width: [WIDTH],
    height: [HEIGHT],
    startingMines: 75,
    lives: 3,
    clicks: 30,
    layer: 0,
    position: [Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2)],
    comboCount: 0,
    cellData: {},
    darknessData: {},
    mineIndex: [],

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
    setLayer: (v: number) =>
      set((state) => {
        state.layer = v;
        // if there are no mines on this layer, make some.
        if (state.mineIndex[state.layer]) return;

        // const layerScaling = Math.exp(state.layer / 30);
        const layerScaling = 1; // temporary to work with lighting tests
        if (!state.height[state.layer]) {
          state.height[state.layer] = Math.floor(state.height[0] * layerScaling);
        }
        if (!state.width[state.layer]) {
          state.width[state.layer] = Math.floor(state.width[0] * layerScaling);
        }
        const { mines, mineIndex } = generateLayerObjects(
          Math.floor(state.height[0] * layerScaling),
          Math.floor(state.width[0] * layerScaling),
          Math.floor(state.startingMines * layerScaling ** 2),
          v,
        );
        state.cellData = { ...state.cellData, ...mines };
        state.mineIndex[state.layer] = mineIndex;
      }),
    addFlag: (c: Coordinate) => {
      set((state) => {
        // flags are toggle-able.
        const cellKey = `${c[0]}:${c[1]}:${state.layer}`;
        if (state.cellData[cellKey]) {
          state.cellData[cellKey].flagged = !state.cellData[cellKey].flagged;
        } else {
          state.cellData[cellKey] = { clicked: false, mined: false, flagged: true };
        }
      });
    },
    clickCell: (c: Coordinate, cellValue: string) => {
      set((state) => {
        // take a click
        state.clicks -= 1;
        // set current position at this click
        state.position = c;
        const cellKey = `${c[0]}:${c[1]}:${state.layer}`;
        // if the cell's value is 0, we want to 'click' all adjacent 0 cells, and to do this recursively.
        const floodClick = (coord: Coordinate, numberToPropagate: number) => {
          // don't expand the auto click zone beyond a radius of N cells
          // this is partially due to the future infinite grid being a thing
          const distanceToOriginal = Math.sqrt(Math.abs(c[0] - coord[0]) ** 2 + Math.abs(c[1] - coord[1]) ** 2);
          const blankCellKey = `${coord[0]}:${coord[1]}:${state.layer}`;
          // make sure we're not re-checking the same dang cell
          if (state.cellData[blankCellKey]?.clicked || distanceToOriginal > 6) return;
          // add this cell to obj of non-dark ones
          // if (!state.darknessData[`${coord[0]}:${coord[1]}`]) {
          //   state.darknessData = { ...state.darknessData, [`${coord[0]}:${coord[1]}`]: 1 };
          // } else {
          //   state.darknessData = {
          //     ...state.darknessData,
          //     [`${coord[0]}:${coord[1]}`]: state.darknessData[`${coord[0]}:${coord[1]}`] + 1,
          //   };
          // }

          state.cellData[blankCellKey] = {
            ...state.cellData[blankCellKey],
            clicked: true,
          };

          const doesThisCellSatisfyCellNumber =
            calculateCellNumber({ x: coord[0], y: coord[1] }, state.cellData, state.layer) === numberToPropagate;

          for (let i = coord[0] - 1; i <= coord[0] + 1; i++) {
            for (let j = coord[1] - 1; j <= coord[1] + 1; j++) {
              if (
                doesThisCellSatisfyCellNumber &&
                i >= 0 &&
                i < state.width[state.layer] &&
                j >= 0 &&
                j < state.height[state.layer]
              ) {
                floodClick([i, j], numberToPropagate);
              }
            }
          }
        };

        let floodClicksDone = 0;
        const linearFloodClick = (coord: Coordinate, howLongToGo: number) => {
          if (floodClicksDone > howLongToGo) return;
          floodClicksDone++;
          state.comboCount++;

          const thisCellKey = `${coord[0]}:${coord[1]}:${state.layer}`;

          state.cellData[thisCellKey] = {
            ...state.cellData[thisCellKey],
            clicked: true,
          };

          // check every adjacent cell to make sure it's not clear cell
          for (let i = coord[0] - 1; i <= coord[0] + 1; i++) {
            for (let j = coord[1] - 1; j <= coord[1] + 1; j++) {
              if (i >= 0 && i < state.width[state.layer] && j >= 0 && j < state.height[state.layer]) {
                const doesThisPropagate = calculateCellNumber({ x: i, y: j }, state.cellData, state.layer) !== 0;
                if (
                  doesThisPropagate &&
                  !state.cellData[`${i}:${j}:${state.layer}`]?.mined &&
                  !state.cellData[`${i}:${j}:${state.layer}`]?.clicked
                ) {
                  linearFloodClick([i, j], howLongToGo);
                  // break;
                }
              }
            }
          }
        };

        if (cellValue === '') {
          // clear the combo counter
          state.comboCount = 0;
          floodClick(c, 0);
        } else if (cellValue !== 'M') {
          // linearFloodClick(c, state.comboCount);
        }

        // solved (I think); the clear origin cell gets added twice; once in the recursion and another time here.
        // so instead of the expensive loop check, just don't re-push if it was a clear cell to start!
        if (cellValue !== '') {
          // increase the combo counter by the cell value
          if (cellValue !== 'M') {
            state.comboCount += parseInt(cellValue);
          } else {
            state.comboCount = 0;
            state.lives -= 1;
          }
          state.cellData[cellKey] = {
            ...state.cellData[cellKey],
            clicked: true,
          };

          // const darknessKey = `${c[0]}:${c[1]}`;
          // if (!state.darknessData[darknessKey]) {
          //   state.darknessData = { ...state.darknessData, [darknessKey]: 1 };
          // } else {
          //   state.darknessData = { ...state.darknessData, [darknessKey]: state.darknessData[darknessKey] + 1 };
          // }
        }
      });
    },
    // useItem: (i: Item) => {},
    resetGame: () => {
      set((state) => {
        const { mines, mineIndex } = generateLayerObjects(state.width[0], state.height[0], state.startingMines, 0);
        state.cellData = mines;
        state.mineIndex[0] = mineIndex;
        state.darknessData = {};
        state.layer = 0;
        state.lives = 3;
        state.clicks = 30;
      });
    },
  })),
);

// const equalsCheck = (a: Coordinate, b: Coordinate) => a.length === b.length && a.every((v, i) => v === b[i]);
