import Rand from 'rand-seed';
import range from './range.ts';
import { CellUpdateData } from '../state';

export default function generateLayerObjectV2(
  bagOfItems: { name: string; frequency: number }[],
  gridWidth: number,
  gridHeight: number,
  layer: number,
) {
  const random = new Rand();

  const totalCells = gridWidth * gridHeight;

  // transform the bag into an array of strings for easier picking
  let bagArray: string[] = [];
  const indices: { [key: string]: string[] } = {};
  bagOfItems.forEach((bagItem) => {
    bagArray = bagArray.concat(range(bagItem.frequency, bagItem.name));
    // for each item that isn't EMPTY, make an index for it
    if (bagItem.name !== 'EMPTY') {
      indices[bagItem.name] = [];
    }
  });

  const objectResults: CellUpdateData = {};

  let pickedTotal = 0;
  // loop over every cell, picking something from the bag each time.
  for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
      // generate a random bag index
      const pickedIndex = Math.floor(random.next() * (totalCells - pickedTotal));
      pickedTotal++;

      const cellKey = `${i}:${j}:${layer}`;
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
