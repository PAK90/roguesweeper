import { CellUpdateData } from '../state';

export default function calculateCellNumber(
  coords: { x: number; y: number },
  objectsOfInterest: CellUpdateData,
  layer: number,
  range = 1,
): number {
  let interestingThingsCount = 0;
  // console.log(objectsOfInterest);

  for (let i = coords.x - range; i <= coords.x + range; i++) {
    for (let j = coords.y - range; j <= coords.y + range; j++) {
      const cellKey = `${i}:${j}:${layer}`;
      const hasMine = objectsOfInterest[cellKey]?.mined || objectsOfInterest[cellKey]?.gold;
      if (hasMine) interestingThingsCount++;
    }
  }

  // console.log(interestingThingsCount);
  return interestingThingsCount;
}
