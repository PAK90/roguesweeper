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
      cellData: {
        [`${xPos}:${yPos}:${layer}`]: {
          mined: false,
          clicked: false,
          flagged: false,
          gold: 0,
          darkness: 15,
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
  return { objects, objectIndex };
}
