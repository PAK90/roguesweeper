import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import calculateCellNumber from '../helpers/calculateCellNumber.ts';
import { items } from '../items.ts';
import generateLayerObjectV2 from '../helpers/generateLayerObjectsV2.ts';
// import { Item } from '../items.ts';

// export type Mine = [number, number];
export type Coordinate = [number, number];
export type Flag = [number, number];
export type Mines = { [key: string]: boolean };

// interface BaseCell {
//   mined?: boolean;
//   clicked?: boolean;
//   flagged?: boolean;
//   darkness?: number;
//   gold?: number;
// }

interface BaseCell {
  clicked?: boolean;
  darkness?: number;
  aboveCell?: 'FLAG' | 'EMPTY';
  belowCell?: 'MINE' | 'GOLD' | 'DOOR' | 'EMPTY';
}

interface MinedCell extends BaseCell {
  belowCell: 'MINE';
}
interface ClickedCell extends BaseCell {
  clicked: true;
}
interface FlaggedCell extends BaseCell {
  aboveCell: 'FLAG';
}
interface DarkCell extends BaseCell {
  darkness: number;
}
interface GildedCell extends BaseCell {
  belowCell: 'GOLD';
}
interface DoorCell extends BaseCell {
  belowCell: 'DOOR';
}

export type CellFragmentData = GildedCell | DarkCell | MinedCell | ClickedCell | FlaggedCell | DoorCell;

export type CellUpdateData = {
  [key: string]: GildedCell | DarkCell | MinedCell | ClickedCell | FlaggedCell | DoorCell;
};

export type ItemData = {
  name: string;
  stackSize: number;
};

export type GameState = {
  shopping: boolean;
  browsingInventory: boolean;
  lives: number;
  clicks: number;
  inventory: ItemData[];
  width: number[];
  height: number[];
  layer: number;
  comboCount: number;
  position: Coordinate;
  clickRange: number;
  startingMines: number;
  cellData: CellUpdateData;
  darknessData: { [key: string]: number };

  mineIndex: string[][];
};

type Actions = {
  toggleShop: () => void;
  toggleInventory: () => void;
  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setClickRange: (cr: number) => void;
  setStartingMines: (sm: number) => void;
  takeLife: () => void;
  reduceClicks: () => void;
  setLayer: (v: number) => void;
  clickCell: (c: Coordinate, cellValue: string) => void;
  addFlag: (c: Coordinate) => void;
  consumeGold: (c: Coordinate) => void;

  addItemToInventory: (itemName: string, n: number) => void;

  // useItem: (i: Item) => void;

  resetGame: () => void;
};

const WIDTH = 30;
const HEIGHT = 16;
const MINES = 40;
const GOLDS = 20;
const DOORS = 10;

export const useGameStore = create<GameState & Actions>()(
  immer((set) => ({
    shopping: false,
    browsingInventory: false,
    width: [WIDTH],
    height: [HEIGHT],
    startingMines: MINES,
    lives: 3,
    clicks: 30,
    inventory: [],
    layer: 0,
    position: [Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2)],
    comboCount: 0,
    clickRange: 3,
    cellData: {},
    darknessData: {},
    mineIndex: [],

    consumeGold: (c: Coordinate) =>
      set((state) => {
        const cellKey = `${c[0]}:${c[1]}:${state.layer}`;
        // TODO: put gold into inventory... have to do it separately, this won't work.
        // state.addItemToInventory('Gold', 1);
        state.cellData[cellKey].belowCell = 'EMPTY';
      }),
    addItemToInventory: (itemName: string, n: number) =>
      set((state) => {
        // find the item's data in the items array
        const item = items.find((i) => i.name === itemName);
        if (!item) {
          throw new Error("Couldn't find item");
        }
        // try to find existing stacks of this item
        const existingStackIndices = [];
        for (let i = 0; i < state.inventory.length; i++) {
          if (state.inventory[i].name === itemName && state.inventory[i].stackSize < item.maxStackSize) {
            existingStackIndices.push(i);
            break;
          }
        }

        // two while loops; one that goes on while we have items left to add,
        // and an inner one that goes on while there's stacks left to add it to.
        let itemsLeftToAdd = n;

        while (itemsLeftToAdd > 0) {
          while (existingStackIndices.length) {
            // look at the first existing stack index and add to it
            const stackOverflow =
              state.inventory[existingStackIndices[0]].stackSize + itemsLeftToAdd - item.maxStackSize;
            const itemsRemoved = item.maxStackSize - state.inventory[existingStackIndices[0]].stackSize;
            if (stackOverflow > 0) {
              state.inventory[existingStackIndices[0]].stackSize = item.maxStackSize;
              existingStackIndices.splice(0, 1);
              itemsLeftToAdd -= itemsRemoved;
            } else {
              state.inventory[existingStackIndices[0]].stackSize += itemsLeftToAdd;
              itemsLeftToAdd = 0;
              break;
            }
          }
          if (itemsLeftToAdd >= item.maxStackSize) {
            // TODO: this just staples a new inventory info object onto the end of the array; account for spaces
            state.inventory[state.inventory.length] = { name: itemName, stackSize: item.maxStackSize };
            itemsLeftToAdd -= item.maxStackSize;
          } else if (itemsLeftToAdd > 0) {
            state.inventory[state.inventory.length] = { name: itemName, stackSize: itemsLeftToAdd };
            itemsLeftToAdd = 0;
          }
        }
      }),
    toggleShop: () =>
      set((state) => {
        state.shopping = !state.shopping;
      }),
    toggleInventory: () =>
      set((state) => {
        state.browsingInventory = !state.browsingInventory;
      }),
    setWidth: (w: number) =>
      set((state) => {
        state.width[0] = w;
      }),
    setHeight: (h: number) =>
      set((state) => {
        state.height[0] = h;
      }),
    setClickRange: (cr: number) =>
      set((state) => {
        state.clickRange = cr;
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
        const isGoingDown = state.layer < v;
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
        const { objectResults, indices } = generateLayerObjectV2(
          [
            { name: 'GOLD', frequency: GOLDS },
            { name: 'MINE', frequency: MINES },
            { name: 'DOOR', frequency: DOORS },
          ],
          WIDTH,
          HEIGHT,
          state.layer,
          [
            state.position,
            [state.position[0] + 1, state.position[1]],
            [state.position[0] - 1, state.position[1]],
            [state.position[0], state.position[1] + 1],
            [state.position[0], state.position[1] - 1],
          ],
        );
        // need to spread because we're adding data to existing data for other layers.
        state.cellData = { ...state.cellData, ...objectResults };
        state.mineIndex[state.layer] = indices['MINE'];

        // if we're going down, clear some cells around the current position
        if (isGoingDown) {
          state.cellData[`${state.position[0]}:${state.position[1]}:${v}`].clicked = true;
          state.cellData[`${state.position[0] + 1}:${state.position[1]}:${v}`].clicked = true;
          state.cellData[`${state.position[0] - 1}:${state.position[1]}:${v}`].clicked = true;
          state.cellData[`${state.position[0]}:${state.position[1] + 1}:${v}`].clicked = true;
          state.cellData[`${state.position[0]}:${state.position[1] - 1}:${v}`].clicked = true;
        }
      }),
    addFlag: (c: Coordinate) => {
      set((state) => {
        // flags are toggle-able.
        const cellKey = `${c[0]}:${c[1]}:${state.layer}`;
        if (state.cellData[cellKey]) {
          state.cellData[cellKey].aboveCell = state.cellData[cellKey].aboveCell === 'FLAG' ? 'EMPTY' : 'FLAG';
        } else {
          state.cellData[cellKey] = { ...state.cellData[cellKey], aboveCell: 'FLAG' };
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
        // remember if we've clicked this already
        const alreadyClicked = state.cellData[cellKey]?.clicked;
        // if the cell's value is 0, we want to 'click' all adjacent 0 cells, and to do this recursively.
        const floodClick = (coord: Coordinate, numberToPropagate: number) => {
          // don't expand the auto click zone beyond a radius of N cells
          // this is partially due to the future infinite grid being a thing
          const distanceToOriginal = Math.sqrt(Math.abs(c[0] - coord[0]) ** 2 + Math.abs(c[1] - coord[1]) ** 2);
          const blankCellKey = `${coord[0]}:${coord[1]}:${state.layer}`;
          // make sure we're not re-checking the same dang cell
          if (state.cellData[blankCellKey]?.clicked || distanceToOriginal > 6) return;

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

        // let floodClicksDone = 0;
        // const linearFloodClick = (coord: Coordinate, howLongToGo: number) => {
        //   if (floodClicksDone > howLongToGo) return;
        //   floodClicksDone++;
        //   state.comboCount++;
        //
        //   const thisCellKey = `${coord[0]}:${coord[1]}:${state.layer}`;
        //
        //   state.cellData[thisCellKey] = {
        //     ...state.cellData[thisCellKey],
        //     clicked: true,
        //   };
        //
        //   // check every adjacent cell to make sure it's not clear cell
        //   for (let i = coord[0] - 1; i <= coord[0] + 1; i++) {
        //     for (let j = coord[1] - 1; j <= coord[1] + 1; j++) {
        //       if (i >= 0 && i < state.width[state.layer] && j >= 0 && j < state.height[state.layer]) {
        //         const doesThisPropagate = calculateCellNumber({ x: i, y: j }, state.cellData, state.layer) !== 0;
        //         if (
        //           doesThisPropagate &&
        //           state.cellData[`${i}:${j}:${state.layer}`]?.belowCell !== 'MINE' &&
        //           !state.cellData[`${i}:${j}:${state.layer}`]?.clicked
        //         ) {
        //           linearFloodClick([i, j], howLongToGo);
        //           // break;
        //         }
        //       }
        //     }
        //   }
        // };

        if (cellValue === '') {
          // for now let's not reset combo/mana when clicking on empty
          // // clear the combo counter
          // state.comboCount = 0;
          floodClick(c, 0);
        } else if (cellValue !== 'M') {
          // linearFloodClick(c, state.comboCount);
        }

        // solved (I think); the clear origin cell gets added twice; once in the recursion and another time here.
        // so instead of the expensive loop check, just don't re-push if it was a clear cell to start!
        if (cellValue !== '') {
          // increase the combo counter by the cell value
          if (cellValue !== 'M' && cellValue !== 'G' && cellValue !== '↓') {
            // maybe have something to do with combo count when you hit a gold?
            // if we've already clicked this cell, don't add combo! (unless some relic/unique in the future...)
            if (!alreadyClicked) {
              state.comboCount += parseInt(cellValue);
            }
          } else {
            // nothing to do if it's purely not a number.
            if (cellValue === 'M') {
              // i.e. it's a mine.
              state.comboCount = 0;
              state.lives -= 1;
            }
          }
          state.cellData[cellKey] = {
            ...state.cellData[cellKey],
            clicked: true,
          };
        }
      });
    },
    // useItem: (i: Item) => {},
    resetGame: () => {
      set((state) => {
        const { objectResults, indices } = generateLayerObjectV2(
          [
            { name: 'GOLD', frequency: GOLDS },
            { name: 'MINE', frequency: MINES },
            { name: 'DOOR', frequency: DOORS },
          ],
          WIDTH,
          HEIGHT,
          0,
        );
        state.cellData = objectResults;
        state.mineIndex[0] = indices['MINE'];
        state.darknessData = {};
        state.comboCount = 0;
        state.layer = 0;
        state.lives = 3;
        state.clicks = 30;
        state.inventory = [];
        state.position = [Math.floor(state.width[0] / 2), Math.floor(state.height[0] / 2)];
      });
    },
  })),
);

// const equalsCheck = (a: Coordinate, b: Coordinate) => a.length === b.length && a.every((v, i) => v === b[i]);
