import { useState, type FormEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { BUG_BOUNTY_REGISTRY_ABI, REGISTRY_ADDRESS } from '../lib/contract';

export function CreateBountyForm() {
  const [bountyId, setBountyId] = useState('');
  const [amount, setAmount] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
  const [description, setDescription] = useState('');

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      writeContract({
        address: REGISTRY_ADDRESS,
        abi: BUG_BOUNTY_REGISTRY_ABI,
        functionName: 'createBounty',
        args: [BigInt(bountyId), metadataURI, description],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error('Error creating bounty:', err);
    }
  };

  return (
    <div className="card">
      <h2>Create Bounty</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="bountyId">Bounty ID:</label>
          <input
            id="bountyId"
            type="number"
            value={bountyId}
            onChange={(e) => setBountyId(e.target.value)}
            placeholder="e.g., 1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (MATIC):</label>
          <input
            id="amount"
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1.0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="metadataURI">Metadata URI:</label>
          <input
            id="metadataURI"
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="ipfs://... or https://..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the bug and bounty requirements..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--bg-dark)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(100, 108, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button type="submit" disabled={isPending || isConfirming}>
          {isPending ? 'Confirming...' : isConfirming ? 'Creating...' : 'Create Bounty'}
        </button>
      </form>

      {hash && (
        <div className="status">
          Transaction Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
        </div>
      )}
      
      {isConfirming && <div className="status">Waiting for confirmation...</div>}
      {isSuccess && <div className="status success">Bounty created successfully!</div>}
      {error && <div className="status error">Error: {error.message}</div>}
    </div>
  );
}
