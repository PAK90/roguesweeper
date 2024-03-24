import { CellUpdateData } from '../state';
import Rand from 'rand-seed';

// const equalsCheck = (a: Mine | Coordinate, b: Mine | Coordinate) =>
//   a.length === b.length && a.every((v, i) => v === b[i]);
export default function generateLayerObjects(
  gridWidth: number,
  gridHeight: number,
  totalMines: number,
  layer: number,
): { mines: CellUpdateData; mineIndex: string[] } {
  let mines: CellUpdateData = {};
  const mineIndex: string[] = [];

  const random = new Rand();
  for (let i = 0; i < totalMines; i++) {
    const makeNewMine = (): { cellData: CellUpdateData; indexData: string } => {
      // const mineX = Math.floor(random.next() * gridWidth);
      // const mineY = Math.floor(random.next() * gridHeight);
      // return [mineX, mineY];
      const mineX = Math.floor(random.next() * gridWidth);
      const mineY = Math.floor(random.next() * gridHeight);
      return {
        cellData: {
          [`${mineX}:${mineY}:${layer}`]: {
            mined: true,
            clicked: false,
            flagged: false,
          },
        },
        indexData: `${mineX}:${mineY}`,
      };
    };
    let newMineData = makeNewMine();

    // check that mines doesn't already contain this x/y pair.
    // while (mines.some((m) => equalsCheck(m, newMine))) {
    //   console.log('~~~ had to dedup! ~~~');
    //   newMine = makeNewMine();
    // }
    while (mines[Object.keys(newMineData.cellData)[0]]) {
      console.log('~~~ had to dedup! ~~~');
      newMineData = makeNewMine();
    }
    mines = { ...mines, ...newMineData.cellData };
    mineIndex.push(newMineData.indexData);
  }
  console.log(mines);
  return { mines, mineIndex };
}
