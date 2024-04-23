import { useGameStore } from './state';
import calculateCellNumber from './helpers/calculateCellNumber.ts';
import React from 'react';

function Cell({ x, y }: { x: number; y: number }) {
  const currentCellData = useGameStore((state) => state.cellData);
  // const currentDarknessData = useGameStore((state) => state.darknessData);
  const clickCell = useGameStore((state) => state.clickCell);
  const toggleFlag = useGameStore((state) => state.addFlag);
  // const allClicked = useGameStore((state) => state.clicked);
  const currentLayer = useGameStore((state) => state.layer);
  const currentPosition = useGameStore((state) => state.position);
  const currentClickRange = useGameStore((state) => state.clickRange);

  const ungildCell = useGameStore((state) => state.consumeGold);
  const addToInventory = useGameStore((s) => s.addItemToInventory);

  const cellKey = `${x}:${y}:${currentLayer}`;
  let isCellDark = false;
  for (let i = 0; i < currentLayer; i++) {
    // descend through the layers to check if this cell in that layer is clicked
    // if not, it's dark
    if (!currentCellData[`${x}:${y}:${i}`]?.clicked) {
      isCellDark = true;
      break;
    }
  }
  const isClicked = currentCellData[cellKey]?.clicked;
  const hasFlag = currentCellData[cellKey]?.flagged;
  const isGilded = currentCellData[cellKey]?.gold;
  const isAtPosition = currentPosition[0] === x && currentPosition[1] === y;
  const isWithinClickRange =
    Math.floor(Math.sqrt(Math.abs(x - currentPosition[0]) ** 2 + Math.abs(y - currentPosition[1]) ** 2)) <=
    currentClickRange;

  let display = '';
  const hasMine = currentCellData[cellKey]?.mined;

  if (!hasMine) {
    if (isGilded) {
      display = 'G';
    } else {
      const cellNum = calculateCellNumber({ x, y }, currentCellData, currentLayer);
      // only show number if it's not 0
      if (cellNum) display = cellNum.toString();
    }
  } else {
    display = 'M';
  }

  const clickThis = (e: React.MouseEvent) => {
    if (!isWithinClickRange) return;
    if (e.type === 'contextmenu') {
      e.preventDefault();
      // right click, add a flag.
      toggleFlag([x, y]);
    } else if (!isClicked && !hasFlag) {
      clickCell([x, y], display);
    }
  };

  const clickThisClearCell = () => {
    if (!isWithinClickRange) return;
    if (isGilded) {
      ungildCell([x, y]);
      addToInventory('Gold', 4);
    } else if (isClicked && !hasFlag) {
      clickCell([x, y], display);
    }
  };

  if (!isClicked) {
    return (
      <div
        onClick={clickThis}
        onContextMenu={clickThis}
        className={`w-8 h-8 ${isCellDark ? 'bg-black' : hasFlag ? 'bg-red-500' : isWithinClickRange ? 'bg-green-300' : 'bg-blue-200'} rounded-l`}
      />
    );
  }

  const colourMap = {
    M: 'text-black-500',
    G: 'text-orange-400',
    '1': 'text-blue-500',
    '2': 'text-green-500',
    '3': 'text-red-500',
    '4': 'text-purple-500',
  };

  return (
    <div
      onClick={clickThisClearCell}
      className={`w-8 h-8 
        ${isAtPosition ? 'border-4' : 'border-2'} 
        ${isAtPosition || isWithinClickRange ? 'border-green-400' : 'border-sky-200'}
         bg-gray-50 ${colourMap[display as keyof typeof colourMap]}`}
    >
      {display}
    </div>
  );
}

export default Cell;
