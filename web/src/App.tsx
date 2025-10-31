import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Home } from './pages/Home';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🐛 BugBountyX</h1>
          <ConnectButton />
        </div>
      </header>
      <main>
        <Home />
      </main>
    </div>
  );
}

export default App;
