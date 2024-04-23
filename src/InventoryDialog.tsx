import { useGameStore } from './state';

function ShopDialog() {
  const browsing = useGameStore((state) => state.browsingInventory);
  const setInventory = useGameStore((state) => state.toggleInventory);
  const inventory = useGameStore((s) => s.inventory);
  console.log(inventory);
  return (
    <>
      <div hidden={!browsing} className="bg-gray-200 shadow-2xl absolute top-1/4 left-1/4 w-1/2 h-1/2">
        HELLO I AM BAG
        {inventory.map((item) => {
          return <div>{item.name}</div>;
        })}
        <button onClick={setInventory}>Close Inventory</button>
      </div>
    </>
  );
}

export default ShopDialog;
