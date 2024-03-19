import { Coordinate, Mine } from '../state';
import Rand from 'rand-seed';

const equalsCheck = (a: Mine | Coordinate, b: Mine | Coordinate) =>
  a.length === b.length && a.every((v, i) => v === b[i]);
export default function generateLayerObjects(gridWidth: number, gridHeight: number, totalMines: number): Mine[] {
  const mines: Mine[] = [];
  // const shops: Coordinate[] = [];

  const random = new Rand();
  for (let i = 0; i < totalMines; i++) {
    const makeMinePair = (): Mine => {
      const mineX = Math.floor(random.next() * gridWidth);
      const mineY = Math.floor(random.next() * gridHeight);
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
  // for (let i = 0; i < totalShops; i++) {
  //   const makeShopPair = (): Mine => {
  //     const shopX = Math.floor(random.next() * gridWidth);
  //     const shopY = Math.floor(random.next() * gridHeight);
  //     return [shopX, shopY];
  //   };
  //   let newShopPair: Mine = makeShopPair();
  //
  //   // check that shops doesn't already contain this x/y pair.
  //   while (shops.concat(mines).some((m) => equalsCheck(m, newShopPair))) {
  //     console.log('~~~ had to dedup! ~~~');
  //     newShopPair = makeShopPair();
  //   }
  //   shops.push(newShopPair);
  // }

  // console.log({ mines, shops });
  // return { mines, shops };
  return mines;
}
