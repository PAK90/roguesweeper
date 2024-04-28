import Rand from 'rand-seed';
import range from './range.ts';
import { CellUpdateData, Coordinate } from '../state';

export default function generateLayerObjectV2(
  bagOfItems: { name: string; frequency: number }[],
  gridWidth: number,
  gridHeight: number,
  layer: number,
  mandatoryEmpty: Coordinate[] = [],
) {
  const random = new Rand();

  // empty formula: width * height - (count of all other items) - (number of mandatory empties)
  const bagWithEmpties = bagOfItems.concat({
    name: 'EMPTY',
    frequency:
      gridWidth * gridHeight - mandatoryEmpty.length - bagOfItems.reduce((total, item) => total + item.frequency, 0),
  });

  const totalCells = gridWidth * gridHeight;

  // transform the bag into an array of strings for easier picking
  let bagArray: string[] = [];
  const indices: { [key: string]: string[] } = {};
  bagWithEmpties.forEach((bagItem) => {
    bagArray = bagArray.concat(range(bagItem.frequency, bagItem.name));
    // for each item that isn't EMPTY, make an index for it
    if (bagItem.name !== 'EMPTY') {
      indices[bagItem.name] = [];
    }
  });

  const objectResults: CellUpdateData = {};

  let pickedTotal = mandatoryEmpty.length;

  // we can pass through cell keys that should have a certain value (EMPTY for now).
  // to handle them, just loop over those keys and add them to the objectResults
  const mandatoryEmptyKeys: string[] = [];
  mandatoryEmpty.forEach((m) => {
    const cellKey = `${m[0]}:${m[1]}:${layer}`;
    mandatoryEmptyKeys.push(cellKey);
    objectResults[cellKey] = {
      clicked: false,
      aboveCell: 'EMPTY',
      darkness: 0,
      belowCell: 'EMPTY',
    };
  });

  // loop over every cell, picking something from the bag each time.
  for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
      const cellKey = `${i}:${j}:${layer}`;
      // if we see a cell key that's meant to be empty, skip the rest of this loop.
      // break will break out of the entire j loop so won't work!
      if (mandatoryEmptyKeys.includes(cellKey)) continue;
      // generate a random bag index
      const pickedIndex = Math.floor(random.next() * (totalCells - pickedTotal));

      pickedTotal++;
      objectResults[cellKey] = {
        clicked: false,
        aboveCell: 'EMPTY',
        darkness: 0,
        belowCell: bagArray[pickedIndex] as 'MINE' | 'DOOR' | 'EMPTY' | 'GOLD',
      };
      // add this key to the item's index
      if (bagArray[pickedIndex] !== 'EMPTY') {
        indices[bagArray[pickedIndex]].push(cellKey);
      }
      // remove this from the bag!
      bagArray.splice(pickedIndex, 1);
    }
  }
  console.log(objectResults, indices);
  return { objectResults, indices };
}
