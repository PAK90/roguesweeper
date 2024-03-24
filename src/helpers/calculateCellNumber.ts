import { CellUpdateData } from '../state';

export default function calculateCellNumber(
  coords: { x: number; y: number },
  mines: CellUpdateData,
  layer: number,
  range = 1,
): number {
  let mineCount = 0;
  // console.log(mines);

  for (let i = coords.x - range; i <= coords.x + range; i++) {
    for (let j = coords.y - range; j <= coords.y + range; j++) {
      // const hasMine = mines.findIndex((m) => m[0] === i && m[1] === j) !== -1;
      const hasMine = mines[`${i}:${j}:${layer}`]?.mined;
      if (hasMine) mineCount++;
    }
  }

  // console.log(mineCount);
  return mineCount;
}
