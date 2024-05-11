import { useGameStore } from './state';
import range from './helpers/range.ts';
import Cell from './Cell.tsx';
import { useEffect } from 'react';
import ShopDialog from './ShopDialog.tsx';
import InventoryDialog from './InventoryDialog.tsx';

function GameArea() {
  // const setWidth = useGameStore((state) => state.setWidth);
  // const setHeight = useGameStore((state) => state.setHeight);
  // const setClickRange = useGameStore((state) => state.setClickRange);

  const resetGame = useGameStore((state) => state.resetGame);

  const currentCombo = useGameStore((state) => state.comboCount);
  const currentLayer = useGameStore((state) => state.layer);
  const currentLives = useGameStore((state) => state.lives);
  const currentClicksLeft = useGameStore((state) => state.clicks);
  const currentTorchesLeft = useGameStore((s) => s.torches);
  // const currentClickRange = useGameStore((state) => state.clickRange);
  const currentCellData = useGameStore((state) => state.cellData);
  const currentPosition = useGameStore((state) => state.position);

  // const setLayer = useGameStore((state) => state.setLayer);
  const gridHeight = useGameStore((state) => state.height[currentLayer]);
  const gridWidth = useGameStore((state) => state.width[currentLayer]);
  const setTorch = useGameStore((s) => s.placeTorch);

  const setInventory = useGameStore((state) => state.toggleInventory);
  const toggleShop = useGameStore((state) => state.toggleShop);

  let nearestGold = '';
  const getNearestGold = () => {
    const maxSearchRadius = 5;
    loop1: for (let r = 1; r <= maxSearchRadius; r++)
      for (let i = currentPosition[0] - r; i <= currentPosition[0] + r; i++) {
        for (let j = currentPosition[1] - r; j <= currentPosition[1] + r; j++) {
          const cellToLookFor = `${i}:${j}:${currentLayer}`;
          if (
            currentCellData[cellToLookFor]?.belowCell === 'GOLD' ||
            currentCellData[cellToLookFor]?.belowCell === 'DOOR'
          ) {
            const xVal = currentPosition[0] - i;
            const yVal = currentPosition[1] - j;
            // this is INVERSE to code I've used before; it uses svg where the y val is inverted
            // whereas here it's not.
            const foundCellAngle = ((Math.atan2(xVal, -yVal) * 180) / Math.PI + 180) % 360;
            if (foundCellAngle >= 360 - 22.5 || foundCellAngle < 22.5) {
              nearestGold = 'N';
            } else if (foundCellAngle >= 22.5 && foundCellAngle < 45 + 22.5) {
              nearestGold = 'NE';
            } else if (foundCellAngle >= 45 + 22.5 && foundCellAngle < 90 + 22.5) {
              nearestGold = 'E';
            } else if (foundCellAngle >= 90 + 22.5 && foundCellAngle < 135 + 22.5) {
              nearestGold = 'SE';
            } else if (foundCellAngle >= 135 + 22.5 && foundCellAngle < 180 + 22.5) {
              nearestGold = 'S';
            } else if (foundCellAngle >= 180 + 22.5 && foundCellAngle < 225 + 22.5) {
              nearestGold = 'SW';
            } else if (foundCellAngle >= 225 + 22.5 && foundCellAngle < 270 + 22.5) {
              nearestGold = 'W';
            } else if (foundCellAngle >= 270 + 22.5 && foundCellAngle < 315 + 22.5) {
              nearestGold = 'NW';
            }
            break loop1;
          }
        }
      }
  };
  getNearestGold();

  const depthRecord = localStorage.getItem('depthRecord') || '0';

  const goToStore = () => {
    if (currentLayer > parseInt(depthRecord)) {
      localStorage.setItem('depthRecord', currentLayer.toString());
    }
    toggleShop();
  };

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (currentClicksLeft <= 0) {
      if (currentLayer > parseInt(depthRecord)) {
        localStorage.setItem('depthRecord', currentLayer.toString());
      }
      window.alert('You ran out of clicks! Try buying a click supplement in the Store');
    }
  }, [currentClicksLeft, depthRecord, currentLayer]);
  useEffect(() => {
    if (currentLives <= 0) {
      if (currentLayer > parseInt(depthRecord)) {
        localStorage.setItem('depthRecord', currentLayer.toString());
      }
      window.alert('You ran out of lives! Try buying a life supplement in the Store');
    }
  }, [currentLives, depthRecord, currentLayer]);

  return (
    <>
      <ShopDialog />
      <InventoryDialog />
      <div className="flex justify-center p-3">
        {/*<label className="p-1">*/}
        {/*  Width:{' '}*/}
        {/*  <input*/}
        {/*    type="number"*/}
        {/*    min={10}*/}
        {/*    max={30}*/}
        {/*    className=""*/}
        {/*    value={gridWidth}*/}
        {/*    onChange={(e) => setWidth(parseInt(e.target.value))}*/}
        {/*  />*/}
        {/*</label>*/}
        {/*<label className="p-1">*/}
        {/*  Height:{' '}*/}
        {/*  <input*/}
        {/*    type="number"*/}
        {/*    min={10}*/}
        {/*    max={30}*/}
        {/*    className=""*/}
        {/*    value={gridHeight}*/}
        {/*    onChange={(e) => setHeight(parseInt(e.target.value))}*/}
        {/*  />*/}
        {/*</label>*/}
        {/*<label className="p-1">*/}
        {/*  Click range:{' '}*/}
        {/*  <input*/}
        {/*    type="number"*/}
        {/*    min={1}*/}
        {/*    max={30}*/}
        {/*    className=""*/}
        {/*    value={currentClickRange}*/}
        {/*    onChange={(e) => setClickRange(parseInt(e.target.value))}*/}
        {/*  />*/}
        {/*</label>*/}
        <p className="p-1 m-1 rounded border-green-200 border-2">{`Combo: ${currentCombo}`}</p>
        <p className="p-1 m-1 rounded border-orange-400 border-2">{`Treasure: ${nearestGold}`}</p>
        <p className="p-1 m-1 rounded border-red-200 border-2">{`Lives: ${currentLives}`}</p>
        <p className="p-1 m-1 rounded border-cyan-100 border-2">{`Clicks: ${currentClicksLeft}`}</p>
        <button
          className="m-1 p-0.5 rounded bg-amber-200 duration-100 hover:bg-amber-300 "
          disabled={
            currentCellData[`${currentPosition[0]}:${currentPosition[1]}:${currentLayer}`]?.aboveCell === 'TORCH' &&
            currentTorchesLeft > 0
          }
          onClick={() => setTorch(currentPosition)}
        >
          {`Set Torch (${currentTorchesLeft})`}
        </button>
        <button className="m-1 p-0.5 rounded bg-blue-200 duration-100 hover:bg-blue-300 " onClick={setInventory}>
          Open Inventory
        </button>
        <button className="m-1 p-0.5 rounded bg-amber-600 duration-100 hover:bg-amber-700 " onClick={goToStore}>
          Go to Store
        </button>
        <button className="m-1 p-0.5 rounded bg-green-200 duration-100 hover:bg-green-300 " onClick={resetGame}>
          New Game
        </button>
        {/*<button*/}
        {/*  className="m-1 p-0.5 rounded bg-green-200 duration-100 hover:bg-green-300 "*/}
        {/*  onClick={() => setLayer(currentLayer - 1)}*/}
        {/*  disabled={currentLayer < 1}*/}
        {/*>*/}
        {/*  Layer Up*/}
        {/*</button>*/}
        <p className="m-1 p-1 rounded border-2 border-gray-200">{`Current Depth:\n${currentLayer + 1}`}</p>
        <p className="m-1 p-1 rounded border-2 border-gray-400">{`Record Depth:\n${parseInt(depthRecord) + 1}`}</p>
        {/*<button*/}
        {/*  className="m-1 p-0.5 rounded bg-green-200 duration-100 hover:bg-green-300 "*/}
        {/*  onClick={() => setLayer(currentLayer + 1)}*/}
        {/*>*/}
        {/*  Layer Down*/}
        {/*</button>*/}
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
