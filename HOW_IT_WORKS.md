# 🔍 BugBountyX - How It Works

## 📖 Project Overview

**BugBountyX** is a decentralized bug bounty platform built on the Polygon Amoy testnet that enables:
- **Sponsors** to create bug bounties by escrowing MATIC
- **Hunters** to submit fixes for open bounties
- **Curators** to approve submissions and automatically release payments
- Full transparency through blockchain technology

---

## 🏗️ Architecture Breakdown

### 1. Smart Contract Layer (Blockchain)

**File:** `contracts/BugBountyRegistry.sol`  
**Network:** Polygon Amoy Testnet (ChainID: 80002)  
**Language:** Solidity 0.8.27

#### Core Components:

**Roles:**
- `DEFAULT_ADMIN_ROLE` - Contract deployer (manages curator assignments)
- `CURATOR_ROLE` - Trusted addresses that can approve submissions

**Bounty Lifecycle:**
```
Open → Submitted → Approved → Paid
  ↓
Cancelled → Refunded
  ↓
Refunded (from Open state)
```

**Data Structure:**
```solidity
struct Bounty {
    address sponsor;           // Who created the bounty
    uint256 amount;            // MATIC held in escrow
    address payable hunter;    // Who submitted the fix
    string metadataURI;        // Bounty description/requirements
    string submissionURI;      // Link to the fix (PR, commit, etc.)
    Status status;             // Current state
}
```

#### Key Functions:

1. **`createBounty(uint256 bountyId, string metadataURI)`**
   - Creates a new bounty with escrowed MATIC
   - Locks funds in the contract
   - Sets status to `Open`
   - Anyone can call this function

2. **`submitFix(uint256 bountyId, address hunter, string submissionURI)`**
   - Submits a fix for an open bounty
   - Links to proof of work (GitHub PR, etc.)
   - Changes status to `Submitted`
   - Anyone can submit

3. **`approveFix(uint256 bountyId)`**
   - Approves a submission (curator only)
   - Automatically transfers escrowed MATIC to hunter
   - Changes status to `Paid`
   - Uses ReentrancyGuard for security

4. **`refund(uint256 bountyId)`**
   - Returns funds to sponsor
   - Only works for `Open` or `Cancelled` bounties
   - Sponsor-only function

5. **`cancelBounty(uint256 bountyId)`**
   - Cancels an open bounty
   - Allows refund afterward
   - Sponsor-only function

6. **`getBounty(uint256 bountyId)`**
   - View-only function to read bounty details
   - Returns all bounty information

#### Security Features:
- ✅ **ReentrancyGuard** - Prevents reentrancy attacks on fund transfers
- ✅ **AccessControl** - Role-based permissions via OpenZeppelin
- ✅ **Checks-Effects-Interactions** - Updates state before transfers
- ✅ **Input Validation** - Comprehensive require statements

---

### 2. Backend (Hardhat Development Environment)

**Configuration:** `hardhat.config.ts`

#### What Hardhat Does:
- Compiles Solidity smart contracts
- Runs automated tests
- Deploys contracts to networks
- Generates TypeScript types for contracts

#### Available Scripts:
```json
{
  "compile": "hardhat compile",          // Compile contracts
  "test": "hardhat test",                // Run 25 tests
  "deploy:amoy": "hardhat run scripts/deploy.ts --network amoy",
  "deploy:local": "hardhat run scripts/deploy.ts --network hardhat"
}
```

#### Deployment Script: `scripts/deploy.ts`

What it does:
1. Deploys the `BugBountyRegistry` contract
2. Grants `CURATOR_ROLE` to specified address
3. Verifies roles are correctly assigned
4. Outputs contract address for frontend configuration
5. Saves deployment info to `deployment.json`

---

### 3. Frontend Layer (React Web Application)

**Tech Stack:**
- React 19 + TypeScript
- Vite 7 (build tool)
- wagmi v2 (React hooks for Ethereum)
- viem v2 (TypeScript Ethereum library)
- RainbowKit v2 (wallet connection UI)
- TanStack Query (data fetching)

#### File Structure:

**Configuration:**
- `web/src/wagmi.ts` - Blockchain connection config
- `web/src/lib/contract.ts` - Contract ABI and utilities
- `web/src/main.tsx` - App entry point with providers

**Components:**
- `CreateBountyForm.tsx` - UI for sponsors to create bounties
- `SubmitFixForm.tsx` - UI for hunters to submit fixes
- `CuratorApprovePanel.tsx` - UI for curators to approve
- `BountyList.tsx` - Display bounty information

**Pages:**
- `Home.tsx` - Main dashboard with all forms and bounty viewer

#### How Frontend Connects to Blockchain:

1. **Wallet Connection (RainbowKit)**
   ```tsx
   <ConnectButton /> // Handles MetaMask, WalletConnect, etc.
   ```

2. **Reading Blockchain Data (wagmi hooks)**
   ```tsx
   const { data: bounty } = useReadContract({
     address: REGISTRY_ADDRESS,
     abi: REGISTRY_ABI,
     functionName: 'getBounty',
     args: [bountyId],
   });
   ```

3. **Writing to Blockchain (wagmi hooks)**
   ```tsx
   const { writeContract } = useWriteContract();
   
   writeContract({
     address: REGISTRY_ADDRESS,
     abi: REGISTRY_ABI,
     functionName: 'createBounty',
     args: [bountyId, metadataURI],
     value: parseEther(amount),
   });
   ```

4. **Network Configuration**
   - Automatically switches users to Polygon Amoy
   - Shows network status and warnings
   - Handles gas estimation

---

## 🔄 Complete User Flows

### Flow 1: Creating a Bounty (Sponsor)

1. **User Action:** Sponsor visits website, connects wallet
2. **Frontend:** RainbowKit displays wallet connection UI
3. **User Action:** Fills "Create Bounty" form (ID, amount, metadata URI)
4. **Frontend:** Calls `createBounty()` with wagmi's `useWriteContract`
5. **Blockchain:** Smart contract:
   - Validates inputs (amount > 0, unique ID)
   - Stores bounty data
   - Locks MATIC in contract
   - Emits `BountyCreated` event
6. **Frontend:** Displays transaction confirmation
7. **Result:** Bounty is now `Open` and visible to hunters

### Flow 2: Submitting a Fix (Hunter)

1. **User Action:** Hunter finds an open bounty
2. **Hunter Action:** Develops fix (e.g., GitHub PR)
3. **User Action:** Fills "Submit Fix" form (bounty ID, PR link)
4. **Frontend:** Calls `submitFix()` function
5. **Blockchain:** Smart contract:
   - Validates bounty exists and is `Open`
   - Updates hunter address
   - Stores submission URI
   - Changes status to `Submitted`
   - Emits `FixSubmitted` event
6. **Frontend:** Shows submission confirmation
7. **Result:** Bounty awaits curator approval

### Flow 3: Approving & Paying (Curator)

1. **User Action:** Curator reviews submission off-chain
2. **Curator Action:** Verifies fix quality
3. **User Action:** Fills "Curator Panel" form (bounty ID)
4. **Frontend:** Calls `approveFix()` with curator wallet
5. **Blockchain:** Smart contract:
   - Verifies caller has `CURATOR_ROLE`
   - Validates bounty is `Submitted`
   - Updates status to `Paid`
   - **Transfers MATIC to hunter automatically**
   - Emits `FixApproved` and `BountyPaid` events
6. **Frontend:** Shows payment success
7. **Result:** Hunter receives MATIC, bounty complete! 💰

### Flow 4: Refunding (Sponsor)

1. **User Action:** Sponsor decides to cancel bounty
2. **User Action:** Calls `cancelBounty()` (if still `Open`)
3. **User Action:** Calls `refund()` function
4. **Blockchain:** Smart contract:
   - Verifies caller is sponsor
   - Checks status is `Open` or `Cancelled`
   - Updates status to `Refunded`
   - **Transfers MATIC back to sponsor**
   - Emits `Refunded` event
5. **Frontend:** Shows refund confirmation
6. **Result:** Sponsor gets MATIC back

---

## 🔐 Security Mechanisms

### 1. ReentrancyGuard
```solidity
function approveFix(uint256 bountyId) 
    external 
    onlyRole(CURATOR_ROLE) 
    nonReentrant  // ← Prevents reentrancy attacks
{
    // Update state BEFORE transfer
    bounty.status = Status.Paid;
    
    // Then transfer funds
    hunter.sendValue(amount);
}
```

### 2. Access Control
```solidity
function approveFix(uint256 bountyId) 
    external 
    onlyRole(CURATOR_ROLE)  // ← Only curators can call
{
    // ...
}
```

### 3. Input Validation
```solidity
require(msg.value > 0, "Bounty amount must be greater than 0");
require(bounties[bountyId].sponsor == address(0), "Bounty ID already exists");
require(bytes(metadataURI).length > 0, "Metadata URI required");
```

### 4. State Checks
```solidity
require(bounty.status == Status.Submitted, "Fix not submitted");
require(bounty.hunter != address(0), "No hunter assigned");
```

---

## 🧪 Testing Framework

**File:** `test/BugBountyRegistry.test.ts`  
**Total Tests:** 25 passing ✅

### Test Categories:

1. **Deployment Tests**
   - Contract deploys successfully
   - Admin role assigned correctly
   - Curator role can be granted

2. **Bounty Creation Tests**
   - Create bounty with valid inputs
   - Reject invalid amounts
   - Reject duplicate IDs
   - Verify escrow locks funds

3. **Fix Submission Tests**
   - Submit fix for open bounty
   - Reject submissions for non-existent bounties
   - Reject submissions for non-open bounties

4. **Approval & Payment Tests**
   - Curator can approve submitted fix
   - Payment transfers correctly
   - Non-curators cannot approve
   - Cannot approve twice

5. **Refund Tests**
   - Sponsor can refund open bounty
   - Sponsor can refund cancelled bounty
   - Cannot refund submitted/paid bounty
   - Only sponsor can refund

6. **Lifecycle Tests**
   - Full flow: Open → Submitted → Paid
   - Cancel flow: Open → Cancelled → Refunded
   - Error handling at each stage

---

## 🌐 Network Configuration

### Polygon Amoy Testnet

**Why Polygon Amoy?**
- ✅ Free testnet MATIC from faucets
- ✅ Fast transactions (~2 seconds)
- ✅ Low/zero gas fees
- ✅ Ethereum-compatible (EVM)
- ✅ Production-ready infrastructure

**Network Details:**
```
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology/
Chain ID: 80002
Currency: MATIC
Block Explorer: https://amoy.polygonscan.com/
```

**Add to MetaMask:**
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter details above
5. Save

---

## 📦 Dependencies Explained

### Smart Contract Dependencies:
```json
{
  "@openzeppelin/contracts": "^5.4.0"  // Security & standards
}
```
- `AccessControl.sol` - Role-based permissions
- `ReentrancyGuard.sol` - Reentrancy protection
- `Address.sol` - Safe value transfers

### Frontend Dependencies:
```json
{
  "react": "^19.1.1",              // UI framework
  "wagmi": "^2.19.1",              // Ethereum React hooks
  "viem": "^2.38.5",               // TypeScript Ethereum library
  "@rainbow-me/rainbowkit": "^2.2.9",  // Wallet connection UI
  "@tanstack/react-query": "^5.90.5"   // Data fetching & caching
}
```

### Development Dependencies:
```json
{
  "hardhat": "^2.22.0",            // Smart contract development
  "ethers": "^6.15.0",             // Blockchain interaction
  "typechain": "^8.3.2",           // Generate TypeScript types
  "typescript": "^5.9.3"           // Type safety
}
```

---

## 🎯 Key Concepts

### Escrow System
- Funds are locked in the smart contract when a bounty is created
- Cannot be accessed until approval or refund
- Automatic release upon curator approval
- Trustless - no intermediary needed

### Role-Based Access
- **Admin** - Can assign curator roles
- **Curator** - Can approve submissions
- **Anyone** - Can create bounties or submit fixes

### Event-Driven Updates
- Smart contract emits events for all state changes
- Frontend listens to events for real-time updates
- Creates audit trail on blockchain

### Metadata URIs
- Bounty descriptions stored off-chain (IPFS, HTTP)
- Only URI reference stored on-chain (saves gas)
- Can include requirements, scope, deadlines, etc.

---

## 🚀 Deployment Process

### Step-by-Step:

1. **Environment Setup**
   - Create `.env` with private key
   - Add curator address
   - Get Amoy RPC URL

2. **Compile Contract**
   ```bash
   pnpm compile
   ```
   - Compiles Solidity to bytecode
   - Generates ABI (Application Binary Interface)
   - Creates TypeScript types

3. **Run Tests**
   ```bash
   pnpm test
   ```
   - Validates all contract logic
   - Ensures security measures work
   - Confirms expected behavior

4. **Deploy to Amoy**
   ```bash
   pnpm deploy:amoy
   ```
   - Uploads bytecode to blockchain
   - Initializes contract state
   - Grants curator role
   - Returns contract address

5. **Configure Frontend**
   - Update `web/.env` with contract address
   - Start development server
   - Connect wallet and test

---

## 💡 Best Practices

### For Development:
- Always run tests before deploying
- Use testnet first (Amoy)
- Keep private keys secure
- Version control everything except `.env`

### For Production:
- Audit smart contracts
- Use hardware wallets
- Implement multi-signature for curator role
- Add emergency pause functionality

### For Users:
- Verify contract addresses
- Check transaction details before signing
- Start with small amounts
- Review bounty metadata carefully

---

## 📊 Gas Optimization

The contract uses several gas-saving techniques:
- Storage packed in structs
- Events instead of storage where possible
- OpenZeppelin's optimized libraries
- Minimal storage reads/writes

---

## 🎓 Learning Resources

**Solidity:**
- https://docs.soliditylang.org/

**Hardhat:**
- https://hardhat.org/docs

**wagmi/viem:**
- https://wagmi.sh/
- https://viem.sh/

**RainbowKit:**
- https://www.rainbowkit.com/

**Polygon:**
- https://polygon.technology/

**OpenZeppelin:**
- https://docs.openzeppelin.com/

---

## ✅ Success Criteria

Your BugBountyX platform is working correctly when:
- ✅ Smart contract deploys without errors
- ✅ All 25 tests pass
- ✅ Frontend connects to wallet
- ✅ Can create bounties and see MATIC deducted
- ✅ Bounty status updates correctly
- ✅ Hunters can submit fixes
- ✅ Curators can approve and trigger payment
- ✅ Refunds work for sponsors
- ✅ Events are emitted and logged

---

## 🎉 Congratulations!

You now understand the complete architecture and flow of BugBountyX. This platform demonstrates:
- Smart contract development
- Web3 frontend integration  
- Role-based access control
- Escrow mechanisms
- Event-driven architecture
- Full-stack blockchain development

Happy bounty hunting! 🐛💰
