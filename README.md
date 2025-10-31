# BugBountyX

A Web3 Bug Bounty platform with curator-approved payouts on Polygon Amoy testnet.

## 🎯 Overview

BugBountyX is a decentralized bug bounty platform where:
- **Sponsors** create bounties by escrowing MATIC
- **Hunters** submit fixes for open bounties
- **Curators** approve submissions to auto-release funds
- All interactions are on-chain with full transparency

## 🏗️ Architecture

### Smart Contract
- **Network**: Polygon Amoy Testnet (ChainID: 80002)
- **Language**: Solidity 0.8.27
- **Features**:
  - Role-based access control (Admin & Curator roles)
  - Reentrancy protection
  - Escrow mechanism for bounty funds
  - Full lifecycle management (Open → Submitted → Approved → Paid)

### Frontend
- **Framework**: React + TypeScript + Vite
- **Web3**: wagmi + viem + RainbowKit
- **Network**: Polygon Amoy support

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm (package manager)
- MetaMask or compatible Web3 wallet
- Polygon Amoy testnet MATIC (from [faucet](https://faucet.polygon.technology/))

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install web dependencies
cd web && pnpm install
```

### 2. Configure Environment

Create `.env` file in the root:

```env
PRIVATE_KEY=your_private_key_here
AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
CURATOR_ADDRESS=your_curator_wallet_address_here
```

Create `web/.env` file:

```env
VITE_REGISTRY_ADDRESS=your_deployed_contract_address
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Compile & Test Smart Contract

```bash
# Compile contracts
pnpm compile

# Run tests
pnpm test
```

### 4. Deploy to Polygon Amoy

```bash
# Deploy contract
pnpm deploy:amoy
```

This will:
- Deploy the BugBountyRegistry contract
- Grant curator role to specified address
- Output contract address to copy into `web/.env`

### 5. Run Frontend

```bash
cd web
pnpm dev
```

Visit `http://localhost:5173` to interact with the dapp.

## 🎮 How to Use

### For Sponsors (Creating Bounties)

1. Connect your wallet with Polygon Amoy network
2. Navigate to "Create Bounty" section
3. Enter:
   - Unique Bounty ID
   - Amount in MATIC to escrow
   - Metadata URI (description, requirements, etc.)
4. Confirm transaction
5. Funds are locked until approved or refunded

### For Hunters (Submitting Fixes)

1. Connect your wallet
2. Find an open bounty
3. Navigate to "Submit Fix" section
4. Enter:
   - Bounty ID
   - Submission URI (GitHub PR, commit, etc.)
5. Confirm transaction
6. Wait for curator approval

### For Curators (Approving Submissions)

1. Connect wallet with curator role
2. Review submitted fixes
3. Navigate to "Curator Panel"
4. Enter Bounty ID to approve
5. Confirm transaction
6. Payment automatically sent to hunter

## 📜 Smart Contract Functions

### Public Functions
- `createBounty(uint256 bountyId, string metadataURI)` - Create new bounty with escrowed funds
- `submitFix(uint256 bountyId, address hunter, string submissionURI)` - Submit a fix
- `getBounty(uint256 bountyId)` - View bounty details

### Curator Functions
- `approveFix(uint256 bountyId)` - Approve submission and release payment

### Sponsor Functions
- `cancelBounty(uint256 bountyId)` - Cancel an open bounty
- `refund(uint256 bountyId)` - Refund escrowed funds

## 🧪 Testing

Run the comprehensive test suite:

```bash
pnpm test
```

Tests cover:
- Bounty creation and validation
- Fix submission workflow
- Curator approval and payment
- Refund mechanisms
- Access control
- Full lifecycle scenarios

## 🛠️ Tech Stack

**Blockchain**
- Solidity 0.8.27
- Hardhat
- OpenZeppelin Contracts
- Ethers.js v6

**Frontend**
- React 19
- TypeScript
- Vite
- wagmi v2
- viem v2
- RainbowKit v2
- TanStack Query

## 📝 Project Structure

```
BugBountyX/
├── contracts/
│   └── BugBountyRegistry.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── BugBountyRegistry.test.ts
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateBountyForm.tsx
│   │   │   ├── SubmitFixForm.tsx
│   │   │   └── CuratorApprovePanel.tsx
│   │   ├── lib/
│   │   │   └── contract.ts
│   │   ├── pages/
│   │   │   └── Home.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── wagmi.ts
│   └── package.json
├── hardhat.config.ts
├── package.json
└── README.md
```

## 🔐 Security

- ReentrancyGuard on all fund transfers
- Role-based access control
- Input validation on all functions
- Checks-Effects-Interactions pattern

## 🌐 Resources

- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [WalletConnect Project ID](https://cloud.walletconnect.com/)

## 📄 License

ISC
