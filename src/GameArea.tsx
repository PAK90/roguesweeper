import { useGameStore } from './state';
import range from './helpers/range.ts';
import Cell from './Cell.tsx';
import { useEffect } from 'react';

function GameArea() {
  const gridWidth = useGameStore((state) => state.width);
  const gridHeight = useGameStore((state) => state.height);
  const totalMines = useGameStore((state) => state.startingMines);

  const setWidth = useGameStore((state) => state.setWidth);
  const setHeight = useGameStore((state) => state.setHeight);
  const setStartingMines = useGameStore((state) => state.setStartingMines);

  const resetGame = useGameStore((state) => state.resetGame);

  const currentClicks = useGameStore((state) => state.clicked);
  const currentLayer = useGameStore((state) => state.layer);
  const setLayer = useGameStore((state) => state.setLayer);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (gridHeight * gridWidth === currentClicks.length + totalMines) {
      alert('Congrats on clearing the grid!');
    }
  }, [currentClicks, totalMines]);

  return (
    <>
      <div className="flex justify-center p-3">
        <label>
          Width:{' '}
          <input
            type="number"
            min={10}
            max={30}
            className=""
            value={gridWidth}
            onChange={(e) => setWidth(parseInt(e.target.value))}
          />
        </label>
        <label>
          Height:{' '}
          <input
            type="number"
            min={10}
            max={30}
            className=""
            value={gridHeight}
            onChange={(e) => setHeight(parseInt(e.target.value))}
          />
        </label>
        <label>
          Mines:{' '}
          <input
            type="number"
            min={10}
            max={99}
            className=""
            value={totalMines}
            onChange={(e) => setStartingMines(parseInt(e.target.value))}
          />
        </label>
        <button onClick={resetGame}>New Game</button>
        <button onClick={() => setLayer(currentLayer - 1)} disabled={currentLayer < 1}>
          Layer Up
        </button>
        <p>{currentLayer + 1}</p>
        <button onClick={() => setLayer(currentLayer + 1)}>Layer Down</button>
      </div>
      <div className="w-full flex justify-center">
        {range(gridWidth).map((_, rIx) => {
          return (
            <div key={`${rIx}`} className="">
              {range(gridHeight).map((_, cIx) => {
                return <Cell key={`${rIx}${cIx}`} x={rIx} y={cIx} />;
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default GameArea;
