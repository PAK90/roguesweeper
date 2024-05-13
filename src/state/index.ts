import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import calculateCellNumber from '../helpers/calculateCellNumber.ts';
import { Item, items } from '../items.ts';
import generateLayerObjectV2 from '../helpers/generateLayerObjectsV2.ts';
import propagateAlongTruth from '../helpers/propagateAlongTruth.ts';
import calculateDarknessLevels from '../helpers/calculateDarknessLevels.ts';

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
  aboveCell?: 'FLAG' | 'TORCH' | 'EMPTY';
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
interface TorchedCell extends BaseCell {
  aboveCell: 'TORCH';
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

export type CellFragmentData = GildedCell | DarkCell | MinedCell | ClickedCell | FlaggedCell | TorchedCell | DoorCell;

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
  maxLives: number;
  currentLives: number;
  clicks: number[];
  torches: number;
  inventory: ItemData[];
  width: number[];
  height: number[];
  layer: number;
  comboCount: number;
  position: Coordinate;
  lastPosition: Coordinate;
  clickRange: number;
  startingMines: number;
  cellData: CellUpdateData;
  darknessData: { [key: string]: number };

  mineIndex: string[][];
  torchIndex: string[][];
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
  digUpGold: (c: Coordinate) => void;
  placeTorch: (c: Coordinate) => void;

  addItemToInventory: (itemName: string, n: number) => void;

  useItem: (i: Item) => void;

  resetGame: () => void;
};

const WIDTH = 30;
const HEIGHT = 30;
const MINES = 70;
const GOLDS = 20;
const DOORS = 10;

const LIVES = 5;
// const CLICKS = 40;
const TORCHES = 10;

export const useGameStore = create<GameState & Actions>()(
  immer((set) => ({
    shopping: false,
    browsingInventory: false,
    width: [WIDTH],
    height: [HEIGHT],
    startingMines: MINES,
    maxLives: LIVES,
    currentLives: LIVES,
    clicks: [0],
    torches: TORCHES,
    inventory: [],
    layer: 0,
    position: [Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2)],
    lastPosition: [0, 0],
    comboCount: 0,
    clickRange: 3,
    cellData: {},
    darknessData: {},
    mineIndex: [],
    torchIndex: [],

    digUpGold: (c: Coordinate) =>
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
    useItem: (item: Item) => {
      set((state) => {
        // apply item effects
        item.modifiers.forEach((modifier) => {
          if (modifier.modifierType === 'ADDITIVE') {
            // @ts-expect-error something something never
            state[modifier.propName] += modifier.propModifier;
          }
        });
        // pay the item's cost (assuming we've checked elsewhere if we have enough gold to pay for it)
        let costToPay = item.cost || 0;
        for (let i = state.inventory.length - 1; i >= 0; i--) {
          if (costToPay <= 0) break;
          // go from the 'end' of the inventory, which is more likely to be a lower down item...
          // doesn't really matter but it's good practise
          const thisStack = state.inventory[i];
          if (thisStack.stackSize > costToPay) {
            state.inventory[i].stackSize -= costToPay;
            costToPay = 0;
          } else {
            // remove this stack
            costToPay -= thisStack.stackSize;
            state.inventory.splice(i, 1);
          }
        }
      });
    },
    toggleShop: () =>
      set((state) => {
        state.shopping = !state.shopping;
        if (state.shopping) {
          // reset most of the game
          state.position = [Math.floor(state.width[0] / 2), Math.floor(state.height[0] / 2)];
          const { objectResults, indices } = generateLayerObjectV2(
            [
              { name: 'GOLD', frequency: GOLDS },
              { name: 'MINE', frequency: MINES },
              { name: 'DOOR', frequency: DOORS },
            ],
            WIDTH,
            HEIGHT,
            0,
            [
              state.position,
              [state.position[0] + 1, state.position[1]],
              [state.position[0] - 1, state.position[1]],
              [state.position[0], state.position[1] + 1],
              [state.position[0], state.position[1] - 1],
            ],
          );
          state.cellData = objectResults;
          state.mineIndex = []; // empty the arrays, else this causes problems on game resets.
          state.torchIndex = [];
          state.mineIndex[0] = indices['MINE'];
          state.torchIndex[0] = [];
          state.darknessData = {};
          state.comboCount = 0;
          state.layer = 0;

          // set lives to full?
          state.currentLives = state.maxLives;

          state.cellData[`${state.position[0]}:${state.position[1]}:${0}`].clicked = true;
          state.cellData[`${state.position[0] + 1}:${state.position[1]}:${0}`].clicked = true;
          state.cellData[`${state.position[0] - 1}:${state.position[1]}:${0}`].clicked = true;
          state.cellData[`${state.position[0]}:${state.position[1] + 1}:${0}`].clicked = true;
          state.cellData[`${state.position[0]}:${state.position[1] - 1}:${0}`].clicked = true;

          const darknesses = calculateDarknessLevels(
            [
              { coordinate: `${state.position[0]}:${state.position[1]}:${0}`, strength: 5 },
              ...state.torchIndex[state.layer].map((t) => ({ coordinate: t, strength: 9 })),
            ],
            state.cellData,
            state.layer,
            state.clickRange,
          );
          darknesses.forEach((d) => (state.cellData[d.cellKey].darkness = d.lightLevel));
        }
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
        state.currentLives -= 1;
      }),
    reduceClicks: () =>
      set((state) => {
        state.clicks[state.layer] -= 1;
      }),
    placeTorch: (c: Coordinate) =>
      set((state) => {
        const cellKey = `${c[0]}:${c[1]}:${state.layer}`;
        state.torchIndex[state.layer].push(cellKey);
        state.cellData[cellKey].aboveCell = 'TORCH';
        state.torches -= 1;

        const darknesses = calculateDarknessLevels(
          [
            { coordinate: `${state.position[0]}:${state.position[1]}:${state.layer}`, strength: 5 },
            ...state.torchIndex[state.layer].map((t) => ({ coordinate: t, strength: 9 })),
          ],
          state.cellData,
          state.layer,
          state.clickRange,
        );
        darknesses.forEach((d) => (state.cellData[d.cellKey].darkness = d.lightLevel));
      }),
    setLayer: (v: number) =>
      set((state) => {
        const isGoingDown = state.layer < v;
        state.layer = v;
        // if there are no mines on this layer, make some.
        if (state.mineIndex[state.layer]) return;

        // register a new click repository for this layer
        state.clicks[state.layer] = 0;

        const layerScaling = Math.exp(state.layer / 17);
        // const layerScaling = 1; // temporary to work with lighting tests
        // if (!state.height[state.layer]) {
        //   state.height[state.layer] = Math.floor(state.height[0] * layerScaling);
        // }
        // if (!state.width[state.layer]) {
        //   state.width[state.layer] = Math.floor(state.width[0] * layerScaling);
        // }
        // for now we're not scaling the arena size as we go down.
        state.height[state.layer] = 30;
        state.width[state.layer] = 30;
        const { objectResults, indices } = generateLayerObjectV2(
          [
            { name: 'GOLD', frequency: Math.floor(GOLDS * layerScaling) },
            { name: 'MINE', frequency: Math.floor(MINES * layerScaling) },
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
        state.torchIndex[state.layer] = [];
        console.log(state.mineIndex[state.layer], state.mineIndex[state.layer].length / 900);

        // if we're going down, clear some cells around the current position
        if (isGoingDown) {
          state.cellData[`${state.position[0]}:${state.position[1]}:${v}`].clicked = true;
          state.cellData[`${state.position[0] + 1}:${state.position[1]}:${v}`].clicked = true;
          state.cellData[`${state.position[0] - 1}:${state.position[1]}:${v}`].clicked = true;
          state.cellData[`${state.position[0]}:${state.position[1] + 1}:${v}`].clicked = true;
          state.cellData[`${state.position[0]}:${state.position[1] - 1}:${v}`].clicked = true;
        }

        // update darkness?
        const darknesses = calculateDarknessLevels(
          [
            { coordinate: `${state.position[0]}:${state.position[1]}:${state.layer}`, strength: 5 },
            ...state.torchIndex[state.layer].map((t) => ({ coordinate: t, strength: 9 })),
          ],
          state.cellData,
          state.layer,
          state.clickRange,
        );
        darknesses.forEach((d) => (state.cellData[d.cellKey].darkness = d.lightLevel));
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
        // add a click to this layer's tracker
        state.clicks[state.layer] += 1;
        // set last position to current state position
        state.lastPosition = state.position;
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
              // state.lives -= 1;
              // something new; find all mines within radius X and trigger them all
              // to start; first build a list of all mines within radius X of this clicked one
              const minesToClick = propagateAlongTruth(state.cellData, cellKey, 1);
              const cellsToClick: string[] = [];
              minesToClick.forEach((mine) => {
                state.currentLives -= 1;
                state.cellData[mine] = {
                  ...state.cellData[mine],
                  clicked: true,
                };
                // also generate a list of surrounding cells to click
                const [x, y, layer] = mine.split(':').map(Number);
                for (let i = x - 1; i <= x + 1; i++) {
                  for (let j = y - 1; j <= y + 1; j++) {
                    const newKey = `${i}:${j}:${layer}`;
                    // TODO: remove this includes.
                    if (minesToClick.includes(newKey)) continue;
                    cellsToClick.push(newKey);
                  }
                }
              });
              console.log(minesToClick, cellsToClick);
              cellsToClick.forEach((cellToClick) => {
                state.cellData[cellToClick] = {
                  ...state.cellData[cellToClick],
                  clicked: true,
                };
              });
            }
          }
          state.cellData[cellKey] = {
            ...state.cellData[cellKey],
            clicked: true,
          };
        }

        // update darkness? only if we didn't go down a layer; we calculate darkness when we go down.
        // we insert the last click position here so we can 'turn off' any light that may linger behind a wall
        console.log('clicks: ', state.position, state.lastPosition);
        if (cellValue !== '↓') {
          const darknesses = calculateDarknessLevels(
            [
              { coordinate: cellKey, strength: 5 },
              { coordinate: `${state.lastPosition[0]}:${state.lastPosition[1]}:${state.layer}`, strength: 0 },
              ...state.torchIndex[state.layer].map((t) => ({ coordinate: t, strength: 9 })),
            ],
            state.cellData,
            state.layer,
            state.clickRange,
          );
          darknesses.forEach((d) => (state.cellData[d.cellKey].darkness = d.lightLevel));
        }
      });
    },
    resetGame: () => {
      set((state) => {
        state.position = [Math.floor(state.width[0] / 2), Math.floor(state.height[0] / 2)];
        const { objectResults, indices } = generateLayerObjectV2(
          [
            { name: 'GOLD', frequency: GOLDS },
            { name: 'MINE', frequency: MINES },
            { name: 'DOOR', frequency: DOORS },
          ],
          WIDTH,
          HEIGHT,
          0,
          [
            state.position,
            [state.position[0] + 1, state.position[1]],
            [state.position[0] - 1, state.position[1]],
            [state.position[0], state.position[1] + 1],
            [state.position[0], state.position[1] - 1],
          ],
        );
        state.cellData = objectResults;
        state.mineIndex = []; // empty the arrays, else this causes problems on game resets.
        state.torchIndex = [];
        state.mineIndex[0] = indices['MINE'];
        state.torchIndex[0] = [];
        state.darknessData = {};
        state.comboCount = 0;
        state.layer = 0;
        state.maxLives = LIVES;
        state.currentLives = LIVES;
        state.clicks = [0];
        state.torches = TORCHES;
        state.inventory = [{ name: 'Gold', stackSize: 5 }];

        state.cellData[`${state.position[0]}:${state.position[1]}:${0}`].clicked = true;
        state.cellData[`${state.position[0] + 1}:${state.position[1]}:${0}`].clicked = true;
        state.cellData[`${state.position[0] - 1}:${state.position[1]}:${0}`].clicked = true;
        state.cellData[`${state.position[0]}:${state.position[1] + 1}:${0}`].clicked = true;
        state.cellData[`${state.position[0]}:${state.position[1] - 1}:${0}`].clicked = true;

        const darknesses = calculateDarknessLevels(
          [
            { coordinate: `${state.position[0]}:${state.position[1]}:${0}`, strength: 5 },
            ...state.torchIndex[state.layer].map((t) => ({ coordinate: t, strength: 9 })),
          ],
          state.cellData,
          state.layer,
          state.clickRange,
        );
        darknesses.forEach((d) => (state.cellData[d.cellKey].darkness = d.lightLevel));
      });
    },
  })),
);
