import { ConnectButton } from '@rainbow-me/rainbowkit';
import bugLogo from '../assets/bug.png';

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
            <h3>Ready to get started?</h3>
            <div className="connect-button-wrapper">
              <ConnectButton />
            </div>
          </div>
        </div>

        <div className="welcome-card">
          <h2>How It Works</h2>
          
          <div className="how-it-works-grid">
            <div className="how-it-works-item">
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
    </div>
  );
}
