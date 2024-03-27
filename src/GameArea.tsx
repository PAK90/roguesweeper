import { useGameStore } from './state';
import range from './helpers/range.ts';
import Cell from './Cell.tsx';
import { useEffect } from 'react';
import ShopDialog from './ShopDialog.tsx';

function GameArea() {
  const setWidth = useGameStore((state) => state.setWidth);
  const setHeight = useGameStore((state) => state.setHeight);
  const setClickRange = useGameStore((state) => state.setClickRange);

  const resetGame = useGameStore((state) => state.resetGame);

  const currentCombo = useGameStore((state) => state.comboCount);
  const currentLayer = useGameStore((state) => state.layer);
  const currentLives = useGameStore((state) => state.lives);
  const currentClicksLeft = useGameStore((state) => state.clicks);
  const currentClickRange = useGameStore((state) => state.clickRange);

  const setLayer = useGameStore((state) => state.setLayer);
  const gridHeight = useGameStore((state) => state.height[currentLayer]);
  const gridWidth = useGameStore((state) => state.width[currentLayer]);

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <>
      <ShopDialog />
      <div className="flex justify-center p-3">
        <label className="p-1">
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
        <label className="p-1">
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
        <label className="p-1">
          Click range:{' '}
          <input
            type="number"
            min={1}
            max={30}
            className=""
            value={currentClickRange}
            onChange={(e) => setClickRange(parseInt(e.target.value))}
          />
        </label>
        <p className="p-1 rounded border-green-200 border-2">{`Combo: ${currentCombo}`}</p>
        <p className="m-1 p-0.5">{`Lives: ${currentLives}`}</p>
        <p className="m-1 p-0.5">{`Clicks: ${currentClicksLeft}`}</p>
        <button className="m-1 p-0.5 rounded bg-green-200 duration-100 hover:bg-green-300 " onClick={resetGame}>
          New Game
        </button>
        <button
          className="m-1 p-0.5 rounded bg-green-200 duration-100 hover:bg-green-300 "
          onClick={() => setLayer(currentLayer - 1)}
          disabled={currentLayer < 1}
        >
          Layer Up
        </button>
        <p className="m-1 p-0.5">{currentLayer + 1}</p>
        <button
          className="m-1 p-0.5 rounded bg-green-200 duration-100 hover:bg-green-300 "
          onClick={() => setLayer(currentLayer + 1)}
        >
          Layer Down
        </button>
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
