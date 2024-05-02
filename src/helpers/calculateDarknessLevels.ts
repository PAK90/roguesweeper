import { Coordinate } from '../state';

export default function calculateDarknessLevels(lightSources: Coordinate[], layer: number) {
  const maxLightLevel = 5;

  const getFlooredDistance = (p1, p2) => {
    const flatDistance = Math.floor(Math.sqrt(Math.abs(p1[0] - p2[0]) ** 2 + Math.abs(p1[1] - p2[1]) ** 2));
    return maxLightLevel - Math.min(maxLightLevel, Math.max(0, flatDistance));
  };

  const darknessArray = [];

  lightSources.forEach((light) => {
    for (let i = light[0] - maxLightLevel; i <= light[0] + maxLightLevel; i++) {
      for (let j = light[1] - maxLightLevel; j <= light[1] + maxLightLevel; j++) {
        const lightLevel = getFlooredDistance(light, [i, j]);
        darknessArray.push({ cellKey: `${i}:${j}:${layer}`, lightLevel });
      }
    }
  });
  return darknessArray;
}
