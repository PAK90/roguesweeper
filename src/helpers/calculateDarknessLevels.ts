import { CellUpdateData } from '../state';

// Direction vectors
const dRow = [-1, 0, 1, 0];
const dCol = [0, 1, 0, -1];

export default function calculateDarknessLevels(
  lightSources: { coordinate: string; strength: number }[],
  cellData: CellUpdateData,
  layer: number,
  playerRange: number,
) {
  const maxLightLevel = 7;
  const maxDistance = maxLightLevel + playerRange;

  const darknessArray: { cellKey: string; lightLevel: number }[] = [];
  const darknessIndex: { [key: string]: number } = {};

  lightSources.forEach((lightSource) => {
    const [sourceX, sourceY] = lightSource.coordinate.split(':').map(Number);
    const checkedCells = { [`${sourceX}${sourceY}`]: true };

    const cellsToCheck = [{ cell: [sourceX, sourceY], distance: 0 }];

    const isValid = (x: number, y: number, distance: number): boolean => {
      if (x < 0 || y < 0 || y >= 30 || x >= 30) return false;
      if (checkedCells[`${x}${y}`]) return false;
      if (distance > maxDistance) return false;
      return true;
    };

    while (cellsToCheck.length > 0) {
      const { cell, distance } = cellsToCheck[0];
      const [x, y] = cell;

      cellsToCheck.shift();

      // register this cell's darkness
      const lightLevel = Math.max(0, lightSource.strength - distance, darknessIndex[`${x}${y}`] || 0);
      darknessIndex[`${x}${y}`] = lightLevel;
      darknessArray.push({ cellKey: `${x}:${y}:${layer}`, lightLevel });

      // only continue to adding other cells if this one's not unclicked

      if (!cellData[`${x}:${y}:${layer}`]?.clicked) continue;

      for (let i = 0; i < 4; i++) {
        const adjx = x + dRow[i];
        const adjy = y + dCol[i];

        if (isValid(adjx, adjy, distance + 1)) {
          cellsToCheck.push({ cell: [adjx, adjy], distance: distance + 1 });
          checkedCells[`${adjx}${adjy}`] = true;
        }
      }
    }
  });
  return darknessArray;
}
