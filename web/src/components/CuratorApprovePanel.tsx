import { useState, type FormEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { BUG_BOUNTY_REGISTRY_ABI, REGISTRY_ADDRESS, BountyStatus } from '../lib/contract';
import { keccak256, toBytes, formatEther } from 'viem';

export function CuratorApprovePanel() {
  const [bountyId, setBountyId] = useState('');
  const { address } = useAccount();

  // Check if user has curator role
  const CURATOR_ROLE = keccak256(toBytes('CURATOR_ROLE'));
  
  const { data: isCurator } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BUG_BOUNTY_REGISTRY_ABI,
    functionName: 'hasRole',
    args: address ? [CURATOR_ROLE, address] : undefined,
  });

  // Get bounty details to show who will receive payment
  const { data: bountyData } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BUG_BOUNTY_REGISTRY_ABI,
    functionName: 'getBounty',
    args: bountyId ? [BigInt(bountyId)] : undefined,
  });

  const bountyExists = bountyData && bountyData[0] !== '0x0000000000000000000000000000000000000000';
  const bountyStatus = bountyData ? Number(bountyData[5]) : null;
  const hunterAddress = bountyData ? bountyData[2] : null;
  const bountyAmount = bountyData ? bountyData[1] : null;
  const canApprove = bountyStatus === BountyStatus.Submitted;

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleApprove = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isCurator) {
      alert('You do not have curator role');
      return;
    }

    if (!canApprove) {
      alert('Bounty must be in "Submitted" status to approve');
      return;
    }

    try {
      writeContract({
        address: REGISTRY_ADDRESS,
        abi: BUG_BOUNTY_REGISTRY_ABI,
        functionName: 'approveFix',
        args: [BigInt(bountyId)],
      });
    } catch (err) {
      console.error('Error approving fix:', err);
    }
  };

  if (!address) {
    return (
      <div className="card">
        <h2>Curator Panel</h2>
        <p>Please connect your wallet to access curator functions.</p>
      </div>
    );
  }

  if (!isCurator) {
    return (
      <div className="card">
        <h2>Curator Panel</h2>
        <p className="warning">You do not have curator permissions.</p>
      </div>
    );
  }

  return (
    <div className="card curator-panel">
      <h2>🔒 Curator Panel</h2>
      <p className="curator-badge">✓ You have curator permissions</p>
      
      <div style={{ 
        background: '#e3f2fd', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '1.5rem',
        border: '1px solid #2196F3'
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#1565C0' }}>
          ℹ️ <strong>How it works:</strong> When you approve a fix, the escrowed MATIC 
          is automatically sent to the <strong>hunter</strong> (not you). You only pay 
          the small gas fee to execute the approval transaction.
        </p>
      </div>
      
      <form onSubmit={handleApprove}>
        <div className="form-group">
          <label htmlFor="approveBountyId">Bounty ID to Approve:</label>
          <input
            id="approveBountyId"
            type="number"
            value={bountyId}
            onChange={(e) => setBountyId(e.target.value)}
            placeholder="e.g., 1"
            required
          />
          
          {bountyId && bountyExists && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
                Bounty Preview:
              </h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Status:</strong>{' '}
                  <span style={{ 
                    color: canApprove ? '#4CAF50' : '#f44336',
                    fontWeight: 'bold'
                  }}>
                    {bountyStatus === BountyStatus.Submitted ? '✅ Submitted (Ready to Approve)' :
                     bountyStatus === BountyStatus.Open ? '⚠️ Open (No fix submitted yet)' :
                     bountyStatus === BountyStatus.Paid ? '✓ Already Paid' :
                     bountyStatus === BountyStatus.Approved ? 'Approved' :
                     bountyStatus === BountyStatus.Cancelled ? 'Cancelled' :
                     bountyStatus === BountyStatus.Refunded ? 'Refunded' : 'Unknown'}
                  </span>
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Hunter (who receives payment):</strong>{' '}
                  <code style={{ fontSize: '0.75rem' }}>
                    {hunterAddress && hunterAddress !== '0x0000000000000000000000000000000000000000'
                      ? `${hunterAddress.slice(0, 6)}...${hunterAddress.slice(-4)}`
                      : 'Not assigned'}
                  </code>
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Payment Amount:</strong>{' '}
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {bountyAmount ? formatEther(bountyAmount) : '0'} MATIC
                  </span>
                </p>
              </div>
            </div>
          )}
          
          {bountyId && !bountyExists && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#f44336' }}>
              ❌ Bounty ID {bountyId} does not exist
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isPending || isConfirming || !canApprove} 
          className="btn-approve"
        >
          {isPending ? 'Confirming...' : 
           isConfirming ? 'Approving & Sending Payment...' : 
           'Approve & Send Payment to Hunter'}
        </button>
      </form>

      {hash && (
        <div className="status">
          Transaction Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
        </div>
      )}
      
      {isConfirming && (
        <div className="status">
          ⏳ Waiting for confirmation... Payment will be sent to hunter automatically.
        </div>
      )}
      {isSuccess && (
        <div className="status success">
          ✅ Fix approved! Payment of {bountyAmount ? formatEther(bountyAmount) : '0'} MATIC 
          has been sent to the hunter at {hunterAddress ? `${hunterAddress.slice(0, 6)}...${hunterAddress.slice(-4)}` : 'hunter'}! 💰
        </div>
      )}
      {error && <div className="status error">Error: {error.message}</div>}
    </div>
  );
}
