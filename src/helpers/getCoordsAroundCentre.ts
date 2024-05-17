import { Coordinate } from '../state';

export default function getCoordsAroundCentre(centre: Coordinate, range: number, maxX: number, maxY: number) {
  const coordsToReturn = [];
  for (
    let i = Math.min(maxX, Math.max(0, centre[0] - range));
    i <= Math.min(maxX, Math.max(0, centre[0] + range));
    i++
  ) {
    for (
      let j = Math.min(maxY, Math.max(0, centre[1] - range));
      j <= Math.min(maxY, Math.max(0, centre[1] + range));
      j++
    ) {
      coordsToReturn.push([i, j]);
    }
  }
  return coordsToReturn;
}
