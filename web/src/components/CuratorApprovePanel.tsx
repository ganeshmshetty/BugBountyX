import { useState, FormEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { BUG_BOUNTY_REGISTRY_ABI, REGISTRY_ADDRESS } from '../lib/contract';
import { keccak256, toBytes } from 'viem';

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
        </div>

        <button type="submit" disabled={isPending || isConfirming} className="btn-approve">
          {isPending ? 'Confirming...' : isConfirming ? 'Approving...' : 'Approve & Pay'}
        </button>
      </form>

      {hash && (
        <div className="status">
          Transaction Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
        </div>
      )}
      
      {isConfirming && <div className="status">Waiting for confirmation...</div>}
      {isSuccess && <div className="status success">Fix approved and payment sent!</div>}
      {error && <div className="status error">Error: {error.message}</div>}
    </div>
  );
}
