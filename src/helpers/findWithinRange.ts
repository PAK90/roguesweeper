import { CellUpdateData } from '../state';

export default function findWithinRange(cellData: CellUpdateData, targetCellKey: string, range = 1) {
  const cellsToCheck = [targetCellKey];

  const minesFound = [];

  while (cellsToCheck.length > 0) {
    const cellKey = cellsToCheck[cellsToCheck.length - 1];
    const cell = cellData[cellKey];
    let mineFound = false;
    if (cell?.belowCell === 'MINE') {
      minesFound.push(cellKey);
      mineFound = true;
    }
    const [x, y, layer] = cellKey.split(':').map(Number);

    // at the end of checking this cell, pop it off
    // cellsToCheck.splice(cellsToCheck.length - 1, 1);
    const indexToRemove = cellsToCheck.findIndex((c) => c === cellKey);
    cellsToCheck.splice(indexToRemove, 1);

    // then add in the next batch of cells to check if we did find a mine.
    if (mineFound) {
      for (let i = x - range; i <= x + range; i++) {
        for (let j = y - range; j <= y + range; j++) {
          if (i === x && j === y) continue;
          const newKey = `${i}:${j}:${layer}`;
          // TODO: remove this includes.
          if (minesFound.includes(newKey)) continue;
          cellsToCheck.push(newKey);
        }
      }
    }
    console.log(cellsToCheck);
  }
  return minesFound;
}
