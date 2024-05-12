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

  const ungildCell = useGameStore((state) => state.digUpGold);
  const addToInventory = useGameStore((s) => s.addItemToInventory);
  const setLayer = useGameStore((state) => state.setLayer);

  const cellKey = `${x}:${y}:${currentLayer}`;
  // let isCellDark = false;
  // for (let i = 0; i < currentLayer; i++) {
  //   // descend through the layers to check if this cell in that layer is clicked
  //   // if not, it's dark
  //   if (!currentCellData[`${x}:${y}:${i}`]?.clicked) {
  //     isCellDark = true;
  //     break;
  //   }
  // }
  const isClicked = currentCellData[cellKey]?.clicked;
  const hasFlag = currentCellData[cellKey]?.aboveCell === 'FLAG';
  const isGilded = currentCellData[cellKey]?.belowCell === 'GOLD';
  const isDoor = currentCellData[cellKey]?.belowCell === 'DOOR';
  const isAtPosition = currentPosition[0] === x && currentPosition[1] === y;
  const isWithinClickRange =
    Math.floor(Math.sqrt(Math.abs(x - currentPosition[0]) ** 2 + Math.abs(y - currentPosition[1]) ** 2)) <=
    currentClickRange;

  let display = '';
  const hasMine = currentCellData[cellKey]?.belowCell === 'MINE';

  if (!hasMine) {
    if (isGilded) {
      display = 'G';
    } else if (isDoor) {
      display = '↓';
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
    } else if (isDoor) {
      setLayer(currentLayer + 1);
    } else if (isClicked && !hasFlag) {
      clickCell([x, y], display);
    }
  };

  const delay = Math.sqrt(Math.abs(currentPosition[0] - x) ** 2 + Math.abs(currentPosition[1] - y) ** 2) * 40;

  const MAX_LIGHT_LEVEL = 7;
  const darkness = currentCellData[cellKey]?.darkness || 0;

  if (!isClicked) {
    return (
      <div>
        <div
          className={`bg-indigo-950 w-8 h-8 absolute pointer-events-none z-0 ${isWithinClickRange && 'border-green-400 border-2 border-opacity-30'}`}
          style={{
            opacity: `${((MAX_LIGHT_LEVEL - darkness) * 100) / MAX_LIGHT_LEVEL}%`,
            transitionDelay: `${delay}ms`,
          }}
        />
        <div
          onClick={clickThis}
          onContextMenu={clickThis}
          style={{ transitionDelay: `${delay}ms` }}
          // className={`w-8 h-8 ${isCellDark ? 'bg-black' : hasFlag ? 'bg-red-500' : isWithinClickRange ? 'bg-green-300' : 'bg-blue-200'} rounded`}
          className={`w-8 h-8 cursor-pointer ${hasFlag ? 'bg-red-500' : 'bg-amber-900'} ${isWithinClickRange && 'border-green-400 border-2'} rounded`}
        />
      </div>
    );
  }

  const colourMap = {
    M: 'text-black-500 bg-red-300',
    G: 'text-orange-400 bg-orange-200',
    '1': 'text-blue-500',
    '2': 'text-green-500',
    '3': 'text-red-500',
    '4': 'text-purple-500',
    '↓': 'text-white bg-gray-600',
  };

  // const opacityString = `opacity-${currentCellData[cellKey]?.darkness * 20}`;
  // const classString = `${opacityString} bg-black w-8 h-8 absolute pointer-events-none`;

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="bg-indigo-950 w-8 h-8 absolute pointer-events-none cursor-pointer z-0"
        style={{
          opacity: `${((MAX_LIGHT_LEVEL - darkness) * 100) / MAX_LIGHT_LEVEL}%`,
          transitionDelay: `${delay}ms`,
        }}
      />
      <div
        onClick={clickThisClearCell}
        style={{ transitionDelay: `${delay}ms` }}
        className={`w-8 h-8 select-none
        ${isAtPosition ? 'border-dashed border-4' : 'border-2'} 
        ${isAtPosition || isWithinClickRange ? 'border-green-400' : 'border-sky-200'}
         bg-gray-50 ${colourMap[display as keyof typeof colourMap]}`}
      >
        {darkness > 4 ? display : ''}
      </div>
    </div>
  );
}

export default Cell;
