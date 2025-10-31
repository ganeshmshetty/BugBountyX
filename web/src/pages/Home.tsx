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
      <h1>🐛 BugBountyX - Web3 Bug Bounty Platform</h1>
      <p className="subtitle">Polygon Amoy Testnet</p>

      <div className="info-box">
        <h3>ℹ️ How It Works</h3>
        <ul>
          <li><strong>Sponsors:</strong> Create bounties by escrowing MATIC tokens on-chain</li>
          <li><strong>Hunters:</strong> Submit fixes for open bounties with proof of work</li>
          <li><strong>Curators:</strong> Approve valid submissions to trigger automatic payments</li>
        </ul>
      </div>

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
        <p>Contract Address: {REGISTRY_ADDRESS}</p>
        <p>
          Get testnet MATIC from:{' '}
          <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer">
            Polygon Faucet
          </a>
        </p>
      </div>
    </div>
  );
}
