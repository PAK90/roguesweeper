import './App.css';
import GameArea from './components/GameArea.tsx';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div>
      <Analytics />
      <h1 className="text-5xl font-bold underline text-center p-5">RogueSweeper</h1>
      <GameArea />
    </div>
  );
}

export default App;
