import { useState, FormEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { BUG_BOUNTY_REGISTRY_ABI, REGISTRY_ADDRESS } from '../lib/contract';

export function SubmitFixForm() {
  const [bountyId, setBountyId] = useState('');
  const [submissionURI, setSubmissionURI] = useState('');
  const { address } = useAccount();

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      writeContract({
        address: REGISTRY_ADDRESS,
        abi: BUG_BOUNTY_REGISTRY_ABI,
        functionName: 'submitFix',
        args: [BigInt(bountyId), address, submissionURI],
      });
    } catch (err) {
      console.error('Error submitting fix:', err);
    }
  };

  return (
    <div className="card">
      <h2>Submit Fix</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="submitBountyId">Bounty ID:</label>
          <input
            id="submitBountyId"
            type="number"
            value={bountyId}
            onChange={(e) => setBountyId(e.target.value)}
            placeholder="e.g., 1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="submissionURI">Submission URI (e.g., GitHub PR):</label>
          <input
            id="submissionURI"
            type="text"
            value={submissionURI}
            onChange={(e) => setSubmissionURI(e.target.value)}
            placeholder="https://github.com/user/repo/pull/1"
            required
          />
        </div>

        <button type="submit" disabled={isPending || isConfirming || !address}>
          {isPending ? 'Confirming...' : isConfirming ? 'Submitting...' : 'Submit Fix'}
        </button>
      </form>

      {hash && (
        <div className="status">
          Transaction Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
        </div>
      )}
      
      {isConfirming && <div className="status">Waiting for confirmation...</div>}
      {isSuccess && <div className="status success">Fix submitted successfully!</div>}
      {error && <div className="status error">Error: {error.message}</div>}
    </div>
  );
}
