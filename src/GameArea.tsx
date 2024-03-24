import { useGameStore } from './state';
import range from './helpers/range.ts';
import Cell from './Cell.tsx';
import { useEffect } from 'react';
import ShopDialog from './ShopDialog.tsx';

function GameArea() {
  // const totalMines = useGameStore((state) => state.startingMines);

  const setWidth = useGameStore((state) => state.setWidth);
  const setHeight = useGameStore((state) => state.setHeight);
  // const setStartingMines = useGameStore((state) => state.setStartingMines);

  const resetGame = useGameStore((state) => state.resetGame);

  // const currentClicksDone = useGameStore((state) => state.clicked);
  const currentLayer = useGameStore((state) => state.layer);
  const currentLives = useGameStore((state) => state.lives);
  const currentClicksLeft = useGameStore((state) => state.clicks);

  const setLayer = useGameStore((state) => state.setLayer);
  const gridHeight = useGameStore((state) => state.height[currentLayer]);
  const gridWidth = useGameStore((state) => state.width[currentLayer]);

  useEffect(() => {
    resetGame();
  }, []);

  // useEffect(() => {
  //   if (gridHeight * gridWidth === currentClicksDone.length + totalMines) {
  //     alert('Congrats on clearing the grid!');
  //   }
  // }, [currentClicksDone, totalMines]);

  return (
    <>
      <ShopDialog />
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
        <p>{`Lives: ${currentLives}`}</p>
        <p>{`Clicks: ${currentClicksLeft}`}</p>
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
