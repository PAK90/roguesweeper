import './App.css';
import GameArea from './GameArea.tsx';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <Analytics />
      <h1 className="text-5xl font-bold underline text-center p-5">RogueSweeper</h1>
      <GameArea />
    </>
  );
}

export default App;
