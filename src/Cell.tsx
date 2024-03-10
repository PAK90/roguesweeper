import { useGameStore } from './state';
import calculateCellNumber from './helpers/calculateCellNumber.ts';
import React from 'react';

function Cell({ x, y }: { x: number; y: number }) {
  const currentMines = useGameStore((state) => state.mines);
  const currentClicked = useGameStore((state) => state.clicked);
  const currentFlags = useGameStore((state) => state.flags);
  const clickCell = useGameStore((state) => state.clickCell);
  const toggleFlag = useGameStore((state) => state.addFlag);

  const isClicked = currentClicked.findIndex((cc) => cc[0] === x && cc[1] === y) !== -1;
  const hasFlag = currentFlags.findIndex((cc) => cc[0] === x && cc[1] === y) !== -1;

  let display = '';
  const hasMine = currentMines.findIndex((cm) => cm[0] === x && cm[1] === y) !== -1;
  if (!hasMine) {
    const cellNum = calculateCellNumber({ x, y }, currentMines, 1);
    // only show number if it's not 0
    if (cellNum) display = cellNum.toString();
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
        className={`w-8 h-8 ${hasFlag ? 'bg-red-500' : 'bg-blue-200'} rounded-l`}
      />
    );
  }

  const colourMap = {
    M: 'text-black-500',
    '1': 'text-blue-500',
    '2': 'text-green-500',
    '3': 'text-red-500',
    '4': 'text-purple-500',
  };

  return (
    <div className={`w-8 h-8 ${colourMap[display as keyof typeof colourMap]}`}>{hasMine ? 'M' : `${display}`}</div>
  );
}

export default Cell;
