import { Mine } from '../state';

export default function calculateCellNumber(coords: { x: number; y: number }, mines: Mine[], range = 1): number {
  let mineCount = 0;
  // console.log(mines);

  for (let i = coords.x - range; i <= coords.x + range; i++) {
    for (let j = coords.y - range; j <= coords.y + range; j++) {
      const hasMine = mines.findIndex((m) => m[0] === i && m[1] === j) !== -1;
      if (hasMine) mineCount++;
    }
  }

  // console.log(mineCount);
  return mineCount;
}
