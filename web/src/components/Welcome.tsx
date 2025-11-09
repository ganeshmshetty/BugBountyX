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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <circle cx="12" cy="11" r="3"></circle>
                </svg>
              </div>
              <h3>Find Vulnerability</h3>
              <p>
                Security researchers discover vulnerabilities and document their findings with detailed proof-of-concept.
              </p>
              <ul>
                <li>Identify security vulnerabilities</li>
                <li>Document with proof-of-concept</li>
                <li>Assess impact and severity</li>
              </ul>
            </div>

            <div className="how-it-works-item">
              <div className="how-it-works-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>Submit Report</h3>
              <p>
                Submit vulnerability reports via the dApp with detailed descriptions, proof, and impact assessment.
              </p>
              <ul>
                <li>Submit detailed vulnerability reports</li>
                <li>Include proof and reproduction steps</li>
                <li>Track submission status on-chain</li>
              </ul>
            </div>

            <div className="how-it-works-item">
              <div className="how-it-works-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Review & Auto-Pay</h3>
              <p>
                Curators review submissions for validity. Once approved, the escrowed bounty is automatically paid to the researcher in crypto. All transactions are logged on-chain.
              </p>
              <ul>
                <li>Curator validates the report</li>
                <li>Automatic crypto payment on approval</li>
                <li>Transparent on-chain status logging</li>
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
