<!-- ede764f5-f3f4-4ecf-9f2f-aaab3c92214a 7be92468-4076-40bb-9b6e-af18c962687a -->
# Web3 Bug Bounty Tracker — Curator-Approved Payouts (Polygon Amoy)

## Overview

- EVM smart contract holds escrowed bounties per issue. Curators approve a submission to auto-release funds to the developer.
- Deployed on Polygon Amoy testnet (free faucets). Frontend: React + TypeScript with wagmi/viem + RainbowKit.

## Stack

- Contracts: Hardhat + TypeScript, OpenZeppelin `AccessControl`
- Network: Polygon Amoy (chainId 80002)
- Frontend: Vite React TS, wagmi + viem + RainbowKit

## Contract Design (key parts)

- File: `contracts/BugBountyRegistry.sol`
- Roles: `DEFAULT_ADMIN_ROLE` (deployer), `CURATOR_ROLE`
- Struct:
  - `struct Bounty { address sponsor; uint256 amount; address payable hunter; string metadataURI; Status status; }`
  - `enum Status { Open, Submitted, Approved, Paid, Cancelled, Refunded }`
- Mappings:
  - `mapping(uint256 => Bounty) public bounties;`
- Core functions (signatures):
  - `function createBounty(uint256 bountyId, string calldata metadataURI) external payable;`
  - `function submitFix(uint256 bountyId, address payable hunter, string calldata submissionURI) external;`
  - `function approveFix(uint256 bountyId) external onlyRole(CURATOR_ROLE);`
  - `function refund(uint256 bountyId) external;`
  - Events: `BountyCreated`, `FixSubmitted`, `FixApproved`, `BountyPaid`, `Refunded`
- Notes:
  - Escrow is native token (MATIC). `createBounty` requires `msg.value > 0` and sets `amount`.
  - `approveFix` transfers `amount` to `hunter` and marks `Paid`.
  - Simple reentrancy guard via OpenZeppelin `ReentrancyGuard` on payout/refund.

## Hardhat Setup

- Files:
  - `hardhat.config.ts` (Amoy RPC, etherscan plugin optional)
  - `scripts/deploy.ts` (deploy with `CURATOR_ROLE` assignments)
  - `.env` (`PRIVATE_KEY`, `AMOY_RPC_URL`)
- Test: minimal unit tests for lifecycle Open → Submitted → Approved → Paid, plus Refund and guards

## Frontend

- Files (Vite):
  - `web/src/main.tsx` (wagmi config for Amoy, RainbowKit)
  - `web/src/lib/contract.ts` (ABI + address, viem helpers)
  - `web/src/components/CreateBountyForm.tsx`
  - `web/src/components/SubmitFixForm.tsx`
  - `web/src/components/CuratorApprovePanel.tsx`
  - `web/src/pages/Home.tsx` (list and interact; keep local state + on-chain reads)
- UX flow:
  - Sponsor connects wallet → Create bounty (enter `bountyId`, `metadataURI`, send MATIC)
  - Hunter connects → Submit fix (link to PR/commit in `submissionURI`)
  - Curator connects (has role) → Approve → Auto transfer to hunter

## Deployment & Env

- Amoy RPC: get from Alchemy/QuickNode or public RPC; faucet at `https://faucet.polygon.technology/`
- After deploy, paste contract address into `web/.env` → `VITE_REGISTRY_ADDRESS`

## Security & Limits (for hackathon)

- Curators are trusted for now; no N-of-M.
- No stablecoins/oracles; pure native token.
- Guard: prevent double-approve, only sponsor can refund before submission.

## Essential Snippets

- Grant curator role in deploy:
```ts
const registry = await Registry.deploy(admin);
await registry.waitForDeployment();
await registry.grantRole(await registry.CURATOR_ROLE(), curatorAddr);
```

- Payout pattern:
```solidity
(uint256 amount, address payable hunter) = (...);
require(amount > 0 && hunter != address(0));
bounties[id].status = Status.Paid;
Address.sendValue(hunter, amount);
emit BountyPaid(id, hunter, amount);
```


## Runbook

1) Faucet MATIC on Amoy for deployer and test wallets

2) `pnpm install` in root and `web/`

3) Deploy: `npx hardhat run --network amoy scripts/deploy.ts`

4) Update `web/.env` with address; `pnpm dev` in `web/`

5) Demo flows: create → submit → approve (observe wallet transfer)

### To-dos

- [ ] Initialize Hardhat TS project with OpenZeppelin deps
- [ ] Implement BugBountyRegistry with roles and escrow payouts
- [ ] Add basic lifecycle and guard tests for registry
- [ ] Deploy contract to Polygon Amoy and grant curator role
- [ ] Create Vite React TS app with wagmi/viem/RainbowKit
- [ ] Wire ABI/address, implement create/submit/approve flows
- [ ] Build simple forms and list for bounties on Home page
- [ ] Create a couple bounties and test payments on-chain