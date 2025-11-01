import { ConnectButton } from '@rainbow-me/rainbowkit';
import bugLogo from '../assets/bug.png';
import { REGISTRY_ADDRESS } from '../lib/contract';

export function Welcome() {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <div className="welcome-logo">
            <img src={bugLogo} alt="BugBountyX" className="welcome-logo-image" />
          </div>
          <h1 className="welcome-title">
            BugBountyX
          </h1>
          <p className="welcome-subtitle">
            Web3 Bug Bounty Platform
          </p>
        </div>

        <div className="welcome-actions">
          <div className="connect-prompt">
            <div className="connect-button-wrapper">
              <ConnectButton />
            </div>
          </div>
        </div>

        <div className="welcome-card">
          <h2 >How It Works</h2>
          
          <div className="how-it-works-grid">
            <div className="how-it-works-item">
              <div className="how-it-works-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                  <path d="M12 18V6"></path>
                </svg>
              </div>
              <h3>For Sponsors</h3>
              <p>
                Create bug bounties by escrowing MATIC tokens on-chain. 
                Your funds are securely held in the smart contract until a valid fix is approved.
              </p>
              <ul>
                <li>Create bounties with custom rewards</li>
                <li>Add detailed bug descriptions via IPFS</li>
                <li>Automatic payment on approval</li>
              </ul>
            </div>

            <div className="how-it-works-item">
              <div className="how-it-works-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <h3>For Hunters</h3>
              <p>
                Browse open bounties, submit your fixes with proof of work, 
                and earn rewards when your submission is approved.
              </p>
              <ul>
                <li>Browse all available bounties</li>
                <li>Submit fixes with proof links</li>
                <li>Get paid automatically on approval</li>
              </ul>
            </div>

            <div className="how-it-works-item">
              <div className="how-it-works-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>For Curators</h3>
              <p>
                Review submitted fixes and approve valid submissions. 
                Curators ensure quality and trigger automatic payments to hunters.
              </p>
              <ul>
                <li>Review hunter submissions</li>
                <li>Approve quality fixes</li>
                <li>Maintain platform integrity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>BugBountyX</h4>
            <p>Web3 Bug Bounty Platform on Polygon Amoy Testnet</p>
          </div>
          
          <div className="footer-section">
            <h4>Contract</h4>
            <p className="contract-address">{REGISTRY_ADDRESS}</p>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <div className="footer-links">
              <a 
                href="https://github.com/ganeshmshetty/BugBountyX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a 
                href="https://faucet.polygon.technology/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                Polygon Faucet
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>Built with ❤️ on Polygon • Open Source on <a href="https://github.com/ganeshmshetty/BugBountyX" target="_blank" rel="noopener noreferrer">GitHub</a></p>
        </div>
      </div>
    </div>
  );
}
