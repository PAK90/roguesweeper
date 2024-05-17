import { useGameStore } from '../state';
import { Item, items } from '../items.ts';

function ShopDialog() {
  const shopping = useGameStore((state) => state.shopping);
  const setShopping = useGameStore((state) => state.toggleShop);
  const inventory = useGameStore((state) => state.inventory);
  const buyItem = useGameStore((s) => s.useItem);

  const goldTotal = inventory.reduce((total, invItem) => {
    if (invItem.name === 'Gold') {
      return total + invItem.stackSize;
    }
    return total;
  }, 0);

  const itemDisplay = (item: Item) => {
    const disabled = !!((item?.cost || 0) > goldTotal);
    return (
      <div className={'m-1 p-1 bg-indigo-300 rounded-lg'}>
        <div className={'font-bold'}>{item.name}</div>
        <div>{item.description}</div>
        <button
          disabled={disabled}
          onClick={() => buyItem(item)}
          className={'text-amber-400 bg-indigo-500 cursor-pointer rounded-lg p-1'}
        >{`${item.cost} gold`}</button>
      </div>
    );
  };

  return (
    <>
      <div hidden={!shopping} className="bg-gray-200 shadow-2xl absolute top-1/4 left-1/4 w-1/2 h-1/2 z-20">
        {`You have ${goldTotal} gold`}
        {items.filter((i) => i?.cost).map(itemDisplay)}
        <button onClick={setShopping}>Close Shop</button>
      </div>
    </>
  );
}

export default ShopDialog;
