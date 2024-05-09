import { CellFragmentData, CellUpdateData } from '../state';
import Rand from 'rand-seed';

export default function generateLayerObjects(
  gridWidth: number,
  gridHeight: number,
  totalObjects: number,
  layer: number,
  cellDataOverride: CellFragmentData,
): { objects: CellUpdateData; objectIndex: string[] } {
  let objects: CellUpdateData = {};
  const objectIndex: string[] = [];
  const random = new Rand();

  // TODO: fix this up so it can be called once with multiple types of things to make

  const makeNewObjectOfInterest = (): { cellData: CellUpdateData; indexData: string } => {
    const xPos = Math.floor(random.next() * gridWidth);
    const yPos = Math.floor(random.next() * gridHeight);
    return {
      // @ts-expect-error because
      cellData: {
        [`${xPos}:${yPos}:${layer}`]: {
          ...cellDataOverride,
        },
      },
      indexData: `${xPos}:${yPos}`,
    };
  };

  for (let i = 0; i < totalObjects; i++) {
    let newObjectData = makeNewObjectOfInterest();

    while (objects[Object.keys(newObjectData.cellData)[0]]) {
      console.log('~~~ had to dedup! ~~~');
      newObjectData = makeNewObjectOfInterest();
    }
    objects = { ...objects, ...newObjectData.cellData };
    objectIndex.push(newObjectData.indexData);
  }
  console.log(objects);

  // THIS IS ENTIRELY A TEST SCRIPT
  // const spawnObjectsByWeight = (weightTargetPairs): { weight: number; target: number } => {
  //   // the idea to test is to loop over every cell and see if it spawns something based on the weights.
  //   // then we grab the totals and see by how much they deviate from the target numbers.
  //   // e.g. 30x16 is 480, so if we want to have mines in 10% of cells, we should get roughly 48 mines.
  //   // this method of generation is possibly preferred over having to keep a list to keep checking against
  //   // (to prevent collisions of existing notable objects)
  //   const results = [];
  //   const modifiableWeights = [];
  //   weightTargetPairs.forEach((weightTargetPair) => {
  //     results.push({ results: [], target: weightTargetPair.target });
  //     modifiableWeights.push(weightTargetPair.weight);
  //   });
  //   for (let i = 0; i < gridWidth; i++) {
  //     for (let j = 0; j < gridHeight; j++) {
  //       let cellHasThing = false;
  //       for (let k = 0; k < weightTargetPairs.length; k++) {
  //         // check if this thing spawns in this cell
  //         if (random.next() < modifiableWeights[k]) {
  //           if (!cellHasThing) {
  //             results[k].results.push(`${i}:${j}`);
  //             cellHasThing = true;
  //           } else {
  //             // bump up the probability of this thing occurring in the future?
  //             // try doing this by scaling its normal probability by how many cells are left.
  //             const scale = (gridWidth * gridHeight + i * j) / (gridWidth * gridHeight);
  //             modifiableWeights[k] = modifiableWeights[k] * scale;
  //           }
  //         }
  //       }
  //     }
  //   }
  //   console.log('test results: ', results);
  // };

  // generateLayerObjectV2(
  //   [
  //     { name: 'GOLD', frequency: 20 },
  //     { name: 'MINE', frequency: 50 },
  //     { name: 'EMPTY', frequency: 30 * 16 - 50 - 20 },
  //   ],
  //   gridWidth,
  //   gridHeight,
  //   layer,
  // );
  // END TEST
  // spawnObjectsByWeight([
  //   { weight: 0.1, target: gridHeight * gridWidth * 0.1 },
  //   { weight: 0.1, target: gridHeight * gridWidth * 0.1 },
  //   { weight: 0.1, target: gridHeight * gridWidth * 0.1 },
  // ]);

  return { objects, objectIndex };
}
