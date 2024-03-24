import { CellUpdateData } from '../state';
import Rand from 'rand-seed';

// const equalsCheck = (a: Mine | Coordinate, b: Mine | Coordinate) =>
//   a.length === b.length && a.every((v, i) => v === b[i]);
export default function generateLayerObjects(
  gridWidth: number,
  gridHeight: number,
  totalMines: number,
  layer: number,
): CellUpdateData {
  let mines: CellUpdateData = {};

  const random = new Rand();
  for (let i = 0; i < totalMines; i++) {
    const makeNewMine = (): CellUpdateData => {
      // const mineX = Math.floor(random.next() * gridWidth);
      // const mineY = Math.floor(random.next() * gridHeight);
      // return [mineX, mineY];
      return {
        [`${Math.floor(random.next() * gridWidth)}:${Math.floor(random.next() * gridHeight)}:${layer}`]: {
          mined: true,
          clicked: false,
          flagged: false,
        },
      };
    };
    let newMine: CellUpdateData = makeNewMine();

    // check that mines doesn't already contain this x/y pair.
    // while (mines.some((m) => equalsCheck(m, newMine))) {
    //   console.log('~~~ had to dedup! ~~~');
    //   newMine = makeNewMine();
    // }
    if (mines[Object.keys(newMine)[0]]) {
      newMine = makeNewMine();
    }
    mines = { ...mines, ...newMine };
  }
  console.log(mines);
  return mines;
}
