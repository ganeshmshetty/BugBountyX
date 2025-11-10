import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Home } from './pages/Home';
import { Welcome } from './components/Welcome';
import bugLogo from './assets/bug.png';
import { Analytics } from "@vercel/analytics/react";
import './App.css';

function App() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <Welcome />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src={bugLogo} alt="BugBountyX" className="logo-image" />
            <h1>BugBountyX</h1>
          </div>
          <ConnectButton />
        </div>
      </header>
      <main>
        <Home />
      </main>
      <Analytics />
    </div>
  );
}

export default App;
