import { CellUpdateData } from '../state';

export default function calculateCellNumber(
  coords: { x: number; y: number },
  objectsOfInterest: CellUpdateData,
  layer: number,
  range = 1,
): number {
  let interestingThingsCount = 0;

  for (let i = coords.x - range; i <= coords.x + range; i++) {
    for (let j = coords.y - range; j <= coords.y + range; j++) {
      // TODO; make this not hardcoded.
      if (i < 0 || j < 0 || j >= 16 || i >= 30) continue;
      const cellKey = `${i}:${j}:${layer}`;

      // need to check the cell exists first, otherwise it'll count 'edge' ones as interesting.
      const hasInterestingThing = objectsOfInterest[cellKey] && objectsOfInterest[cellKey].belowCell !== 'EMPTY';
      if (hasInterestingThing) interestingThingsCount++;
    }
  }

  // console.log(interestingThingsCount);
  return interestingThingsCount;
}
