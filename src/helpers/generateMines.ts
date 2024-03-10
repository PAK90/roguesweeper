import { Mine } from '../state';

const equalsCheck = (a: Mine, b: Mine) => a.length === b.length && a.every((v, i) => v === b[i]);
export default function generateMines(gridWidth: number, gridHeight: number, totalMines: number): Mine[] {
  const mines: Mine[] = [];

  for (let i = 0; i < totalMines; i++) {
    const makeMinePair = (): Mine => {
      const mineX = Math.floor(Math.random() * gridWidth);
      const mineY = Math.floor(Math.random() * gridHeight);
      return [mineX, mineY];
    };
    let newMinePair: Mine = makeMinePair();

    // check that mines doesn't already contain this x/y pair.
    while (mines.some((m) => equalsCheck(m, newMinePair))) {
      console.log('~~~ had to dedup! ~~~');
      newMinePair = makeMinePair();
    }
    mines.push(newMinePair);
  }

  console.log(mines);
  return mines;
}
