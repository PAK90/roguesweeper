import { useGameStore } from './state';
import { items } from './items.ts';

function ShopDialog() {
  const shopping = useGameStore((state) => state.shopping);
  const setShopping = useGameStore((state) => state.toggleShop);
  return (
    <>
      <div hidden={!shopping} className="bg-gray-200 shadow-2xl absolute top-1/4 left-1/4 w-1/2 h-1/2">
        HELLO I AM SHOP
        {items.map((item) => {
          return <div>{item.name}</div>;
        })}
        <button onClick={setShopping}>Close Shop</button>
      </div>
    </>
  );
}

export default ShopDialog;
