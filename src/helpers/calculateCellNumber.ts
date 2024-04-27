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

      // need to check the cell exists first, otherwise it'll count 'edge' ones as interesting.
      const hasInterestingThing = objectsOfInterest[cellKey] && objectsOfInterest[cellKey].belowCell !== 'EMPTY';
      if (hasInterestingThing) interestingThingsCount++;
    }
  }

  // console.log(interestingThingsCount);
  return interestingThingsCount;
}
