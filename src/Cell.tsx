import { useGameStore } from './state';
import calculateCellNumber from './helpers/calculateCellNumber.ts';
import React from 'react';

function Cell({ x, y }: { x: number; y: number }) {
  // const currentMines = useGameStore((state) => state.getCurrentLayerMines());
  // const currentClicked = useGameStore((state) => state.getCurrentLayerClicks());
  // const currentFlags = useGameStore((state) => state.getCurrentLayerFlags());
  const currentCellData = useGameStore((state) => state.cellData);
  const clickCell = useGameStore((state) => state.clickCell);
  const toggleFlag = useGameStore((state) => state.addFlag);
  // const allClicked = useGameStore((state) => state.clicked);
  const currentLayer = useGameStore((state) => state.layer);

  // if (!currentMines) return;

  const getIsCellDark = () => {
    // a cell is dark if any of the cells in layers above it have not been clicked
    // loop upwards through the layers and break once one unclicked cell is found
    if (currentLayer === 0) return false;

    const cellBlockedAbove = false;
    // for (let i = currentLayer - 1; i >= 0; i--) {
    //   if (allClicked[i].findIndex((ac) => ac[0] === x && ac[1] === y) === -1) {
    //     cellBlockedAbove = true;
    //     break;
    //   }
    // }
    return cellBlockedAbove;
  };
  const isCellDark = getIsCellDark();
  const cellKey = `${x}:${y}:${currentLayer}`;
  // const isClicked = currentClicked.findIndex((cc) => cc[0] === x && cc[1] === y) !== -1;
  // const hasFlag = currentFlags.findIndex((cc) => cc[0] === x && cc[1] === y) !== -1;
  const isClicked = currentCellData[cellKey]?.clicked;
  const hasFlag = currentCellData[cellKey]?.flagged;

  let display = '';
  // const hasMine = currentMines.findIndex((cm) => cm[0] === x && cm[1] === y) !== -1;
  const hasMine = currentCellData[cellKey]?.mined;

  if (!hasMine) {
    const cellNum = calculateCellNumber({ x, y }, currentCellData, currentLayer);
    // only show number if it's not 0
    if (cellNum) display = cellNum.toString();
  } else {
    display = 'M';
  }

  const clickThis = (e: React.MouseEvent) => {
    if (e.type === 'contextmenu') {
      e.preventDefault();
      // right click, add a flag.
      toggleFlag([x, y]);
    } else if (!isClicked && !hasFlag) {
      clickCell([x, y], display);
    }
  };

  if (!isClicked) {
    return (
      <div
        onClick={clickThis}
        onContextMenu={clickThis}
        className={`w-8 h-8 ${isCellDark ? 'bg-black' : hasFlag ? 'bg-red-500' : 'bg-blue-200'} rounded-l`}
      />
    );
  }

  const colourMap = {
    M: 'text-black-500',
    $: 'text-orange-400',
    '1': 'text-blue-500',
    '2': 'text-green-500',
    '3': 'text-red-500',
    '4': 'text-purple-500',
  };

  return (
    <div className={`w-8 h-8 border-2 border-sky-200 bg-gray-50 ${colourMap[display as keyof typeof colourMap]}`}>
      {display}
    </div>
  );
}

export default Cell;
