import { Coordinate, Direction } from '../state';

export default function moveWithinBounds(
  direction: Direction,
  speed: number,
  position: Coordinate,
): { x: number; y: number } | false {
  const maxX = 30;
  const maxY = 30;

  let newX = position[0];
  let newY = position[1];

  switch (direction) {
    case 'N':
      newY = position[1] - speed;
      if (newY <= 1) return false;
      break;
    case 'S':
      newY = position[1] + speed;
      if (newY >= maxY - 1) return false;
      break;
    case 'E':
      newX = position[0] + speed;
      if (newX >= maxX - 1) return false;
      break;
    case 'W':
      newX = position[0] - speed;
      if (newX <= 1) return false;
      break;
  }

  return { x: newX, y: newY };
}
