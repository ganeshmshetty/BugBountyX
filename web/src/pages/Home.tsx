import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { BUG_BOUNTY_REGISTRY_ABI, REGISTRY_ADDRESS, BountyStatus } from '../lib/contract';
import { CreateBountyForm } from '../components/CreateBountyForm';
import { SubmitFixForm } from '../components/SubmitFixForm';
import { CuratorApprovePanel } from '../components/CuratorApprovePanel';
import { BountyList } from '../components/BountyList';

const statusLabels = {
  [BountyStatus.Open]: 'Open',
  [BountyStatus.Submitted]: 'Submitted',
  [BountyStatus.Approved]: 'Approved',
  [BountyStatus.Paid]: 'Paid',
  [BountyStatus.Cancelled]: 'Cancelled',
  [BountyStatus.Refunded]: 'Refunded',
};

const statusColors = {
  [BountyStatus.Open]: '#4CAF50',
  [BountyStatus.Submitted]: '#2196F3',
  [BountyStatus.Approved]: '#9C27B0',
  [BountyStatus.Paid]: '#4CAF50',
  [BountyStatus.Cancelled]: '#757575',
  [BountyStatus.Refunded]: '#FF9800',
};

export function Home() {
  const [viewBountyId, setViewBountyId] = useState('1');
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'submit' | 'curator'>('browse');

  const { data: bounty, isError, isLoading, refetch } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BUG_BOUNTY_REGISTRY_ABI,
    functionName: 'getBounty',
    args: [BigInt(viewBountyId || '0')],
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="container">
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Bounties
        </button>
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Bounty
        </button>
        <button
          className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Fix
        </button>
        <button
          className={`tab-button ${activeTab === 'curator' ? 'active' : ''}`}
          onClick={() => setActiveTab('curator')}
        >
          Curator Panel
        </button>
      </div>

      {activeTab === 'browse' && (
        <>
          <div className="section">
            <h2>View Bounty Details</h2>
            <div className="bounty-viewer">
              <div className="form-group inline">
                <label htmlFor="viewBountyId">Bounty ID:</label>
                <input
                  id="viewBountyId"
                  type="number"
                  value={viewBountyId}
                  onChange={(e) => setViewBountyId(e.target.value)}
                  placeholder="Enter bounty ID"
                />
                <button onClick={handleRefresh}>Refresh</button>
              </div>

              {isLoading && <p>Loading bounty...</p>}
              {isError && <p className="error">Bounty not found or does not exist.</p>}
              
              {bounty && bounty[0] !== '0x0000000000000000000000000000000000000000' && (
                <div className="bounty-card">
                  <div className="bounty-header">
                    <h3>Bounty #{viewBountyId}</h3>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: statusColors[bounty[5] as BountyStatus] }}
                    >
                      {statusLabels[bounty[5] as BountyStatus]}
                    </span>
                  </div>
                  
                  <div className="bounty-details">
                    <div className="detail-row">
                      <strong>Sponsor:</strong>
                      <span className="address">{bounty[0]}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Amount:</strong>
                      <span className="amount">{formatEther(bounty[1])} MATIC</span>
                    </div>
                    <div className="detail-row">
                      <strong>Hunter:</strong>
                      <span className="address">
                        {bounty[2] === '0x0000000000000000000000000000000000000000' 
                          ? 'Not assigned' 
                          : bounty[2]}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Metadata URI:</strong>
                      <a href={bounty[3]} target="_blank" rel="noopener noreferrer" className="link">
                        {bounty[3]}
                      </a>
                    </div>
                    {bounty[4] && (
                      <div className="detail-row">
                        <strong>Submission URI:</strong>
                        <a href={bounty[4]} target="_blank" rel="noopener noreferrer" className="link">
                          {bounty[4]}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <BountyList onSelectBounty={(id) => setViewBountyId(id)} />
        </>
      )}

      {activeTab === 'create' && (
        <div className="forms-grid">
          <CreateBountyForm />
        </div>
      )}

      {activeTab === 'submit' && (
        <div className="forms-grid">
          <SubmitFixForm />
        </div>
      )}

      {activeTab === 'curator' && (
        <CuratorApprovePanel />
      )}

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
