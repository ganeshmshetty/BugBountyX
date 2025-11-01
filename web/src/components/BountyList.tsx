import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { BUG_BOUNTY_REGISTRY_ABI, REGISTRY_ADDRESS, BountyStatus } from '../lib/contract';

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

interface BountyListProps {
  onSelectBounty: (bountyId: string) => void;
}

export function BountyList({ onSelectBounty }: BountyListProps) {
  const [maxBountyId] = useState(10); // Check first 10 bounties
  const [filterStatus, setFilterStatus] = useState<BountyStatus | 'all'>('all');

  // Fetch multiple bounties
  const bountyIds = Array.from({ length: maxBountyId }, (_, i) => i + 1);
  
  const bounties = bountyIds.map(id => {
    const { data } = useReadContract({
      address: REGISTRY_ADDRESS,
      abi: BUG_BOUNTY_REGISTRY_ABI,
      functionName: 'getBounty',
      args: [BigInt(id)],
    });
    return { id, data };
  });

  // Filter out non-existent bounties and apply status filter
  const validBounties = bounties.filter(b => {
    if (!b.data || b.data[0] === '0x0000000000000000000000000000000000000000') {
      return false;
    }
    if (filterStatus === 'all') {
      return true;
    }
    return b.data[6] === filterStatus;
  }).reverse(); // Reverse to show newest bounties first

  const handleBountyClick = (bountyId: number) => {
    onSelectBounty(bountyId.toString());
  };

  return (
    <div className="bounty-list-container">
      <div className="section">
        <h2>All Bounties</h2>
        
        <div className="filter-controls">
          <button
            className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`filter-button ${filterStatus === BountyStatus.Open ? 'active' : ''}`}
            onClick={() => setFilterStatus(BountyStatus.Open)}
          >
            Open
          </button>
          <button
            className={`filter-button ${filterStatus === BountyStatus.Submitted ? 'active' : ''}`}
            onClick={() => setFilterStatus(BountyStatus.Submitted)}
          >
            Submitted
          </button>
          <button
            className={`filter-button ${filterStatus === BountyStatus.Paid ? 'active' : ''}`}
            onClick={() => setFilterStatus(BountyStatus.Paid)}
          >
            Paid
          </button>
        </div>

        {validBounties.length === 0 ? (
          <div className="empty-state">
            <p>No bounties found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {filterStatus !== 'all' 
                ? `No ${statusLabels[filterStatus]} bounties available`
                : 'Create your first bounty to get started!'}
            </p>
          </div>
        ) : (
          <div className="bounty-table-container">
            <table className="bounty-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {validBounties.map(({ id, data }) => {
                  if (!data) return null;
                  
                  const [, amount, , metadataURI, description, submissionURI, status] = data;
                  
                  return (
                    <tr 
                      key={id} 
                      className="bounty-table-row"
                      onClick={() => handleBountyClick(id)}
                    >
                      <td className="bounty-id-cell">
                        <span className="bounty-id-badge">#{id}</span>
                      </td>
                      <td className="bounty-amount-cell">
                        {formatEther(amount)} MATIC
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: statusColors[status as BountyStatus] }}
                        >
                          {statusLabels[status as BountyStatus]}
                        </span>
                      </td>
                      <td className="description-cell" title={description}>
                        {description 
                          ? description.length > 100 
                            ? `${description.slice(0, 100)}...` 
                            : description
                          : '-'}
                      </td>
                      <td className="actions-cell">
                        <a
                          href={metadataURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Details
                        </a>
                        {submissionURI && submissionURI !== '' && (
                          <>
                            {' • '}
                            <a
                              href={submissionURI}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="table-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Submission
                            </a>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
