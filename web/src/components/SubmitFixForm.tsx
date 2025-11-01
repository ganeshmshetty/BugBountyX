import { useState, type FormEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { BUG_BOUNTY_REGISTRY_ABI, REGISTRY_ADDRESS, BountyStatus } from '../lib/contract';

export function SubmitFixForm() {
  const [bountyId, setBountyId] = useState('');
  const [submissionURI, setSubmissionURI] = useState('');
  const { address } = useAccount();

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read bounty details to validate before submitting
  const { data: bountyData } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BUG_BOUNTY_REGISTRY_ABI,
    functionName: 'getBounty',
    args: bountyId ? [BigInt(bountyId)] : undefined,
  });

  // Check if bounty exists and is open
  const bountyExists = bountyData && bountyData[0] !== '0x0000000000000000000000000000000000000000';
  const bountyStatus = bountyData ? bountyData[5] : null;
  const isOpen = bountyStatus === BountyStatus.Open;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!bountyExists) {
      alert(`Bounty ID ${bountyId} does not exist. Please create it first or use a different ID.`);
      return;
    }

    if (!isOpen) {
      const statusText = bountyStatus === BountyStatus.Submitted ? 'already submitted' :
                        bountyStatus === BountyStatus.Approved ? 'already approved' :
                        bountyStatus === BountyStatus.Paid ? 'already paid' :
                        bountyStatus === BountyStatus.Cancelled ? 'cancelled' :
                        bountyStatus === BountyStatus.Refunded ? 'refunded' : 'not open';
      alert(`Cannot submit fix: Bounty is ${statusText}. Only "Open" bounties accept submissions.`);
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
          {bountyId && bountyExists && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {isOpen ? (
                <span style={{ color: '#4CAF50' }}>✅ Bounty exists and is open for submissions</span>
              ) : (
                <span style={{ color: '#f44336' }}>
                  ⚠️ Bounty exists but is not open (Status: {
                    bountyStatus === BountyStatus.Submitted ? 'Submitted' :
                    bountyStatus === BountyStatus.Approved ? 'Approved' :
                    bountyStatus === BountyStatus.Paid ? 'Paid' :
                    bountyStatus === BountyStatus.Cancelled ? 'Cancelled' :
                    bountyStatus === BountyStatus.Refunded ? 'Refunded' : 'Unknown'
                  })
                </span>
              )}
            </div>
          )}
          {bountyId && !bountyExists && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#f44336' }}>
              ❌ Bounty ID {bountyId} does not exist. Create it first!
            </div>
          )}
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
          <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
            Link to your fix (GitHub PR, commit, or proof of work)
          </small>
        </div>

        <button 
          type="submit" 
          disabled={isPending || isConfirming || !address || !bountyExists || !isOpen}
        >
          {isPending ? 'Confirming...' : isConfirming ? 'Submitting...' : 'Submit Fix'}
        </button>
      </form>

      {hash && (
        <div className="status">
          Transaction Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
        </div>
      )}
      
      {isConfirming && <div className="status">Waiting for confirmation...</div>}
      {isSuccess && (
        <div className="status success">
          ✅ Fix submitted successfully! The curator will review your submission.
        </div>
      )}
      {error && (
        <div className="status error">
          Error: {error.message.includes('Bounty does not exist') 
            ? 'Bounty does not exist. Please create it first.'
            : error.message.includes('Bounty is not open')
            ? 'Bounty is not open for submissions.'
            : error.message}
        </div>
      )}
    </div>
  );
}
