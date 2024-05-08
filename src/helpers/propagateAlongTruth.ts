import { CellUpdateData } from '../state';

export default function propagateAlongTruth(cellData: CellUpdateData, targetCellKey: string, range = 1) {
  console.log(range);
  // TODO: apply range
  const cellsToCheck = [{ key: targetCellKey, distance: 0 }];

  const minesFound = [];

  const checkedCells: { [key: string]: boolean } = { [targetCellKey]: true };

  // while (cellsToCheck.length > 0) {
  //   const cellKey = cellsToCheck[cellsToCheck.length - 1];
  //   const cell = cellData[cellKey];
  //   if (checkedCells[cellKey]) {
  //     cellsToCheck.splice(cellsToCheck.length - 1, 1);
  //     continue;
  //   }
  //   checkedCells[cellKey] = true;
  //   let mineFound = false;
  //   if (cell?.belowCell === 'MINE') {
  //     minesFound.push(cellKey);
  //     mineFound = true;
  //   }
  //   const [x, y, layer] = cellKey.split(':').map(Number);
  //
  //   // at the end of checking this cell, pop it off
  //   // cellsToCheck.splice(cellsToCheck.length - 1, 1);
  //   const indexToRemove = cellsToCheck.findIndex((c) => c === cellKey);
  //   cellsToCheck.splice(indexToRemove, 1);
  //
  //   // then add in the next batch of cells to check if we did find a mine.
  //   if (mineFound) {
  //     for (let i = x - range; i <= x + range; i++) {
  //       for (let j = y - range; j <= y + range; j++) {
  //         const newKey = `${i}:${j}:${layer}`;
  //         if ((i === x && j === y) || checkedCells[newKey]) continue;
  //         // // TODO: remove this includes.
  //         // if (minesFound.includes(newKey)) continue;
  //         cellsToCheck.push(newKey);
  //       }
  //     }
  //   }
  //   console.log(cellsToCheck);
  // }

  const isValid = (keyToCheck: string, x: number, y: number): boolean => {
    // if (distance > range) return false;
    if (x < 0 || y < 0 || y > 16 || x > 30) return false;
    if (checkedCells[keyToCheck]) return false;
    return true;
  };

  while (cellsToCheck.length > 0) {
    const { key: cellKey, distance } = cellsToCheck[0];
    const cell = cellData[cellKey];
    let mineFound = false;
    if (cell?.belowCell === 'MINE') {
      minesFound.push(cellKey);
      mineFound = true;
    }

    // pop the cell we just looked at
    cellsToCheck.shift();

    const [x, y, layer] = cellKey.split(':').map(Number);
    if (mineFound) {
      for (let i = x - range; i <= x + range; i++) {
        for (let j = y - range; j <= y + range; j++) {
          const newKey = `${i}:${j}:${layer}`;
          if (isValid(newKey, i, j)) {
            cellsToCheck.push({ key: newKey, distance: distance + 1 });
            checkedCells[newKey] = true;
          }
        }
      }
    }
  }

  return minesFound;
}
