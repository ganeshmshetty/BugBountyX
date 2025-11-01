# 🚀 BugBountyX - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ **Node.js** v20.19+ or v22.12+ ([Download](https://nodejs.org/))
- ✅ **pnpm** installed (`npm install -g pnpm`)
- ✅ **MetaMask** wallet extension ([Install](https://metamask.io/))
- ✅ **Polygon Amoy testnet MATIC** ([Get from faucet](https://faucet.polygon.technology/))
- ✅ **WalletConnect Project ID** ([Get free](https://cloud.walletconnect.com/))

## 🎯 Setup in 5 Steps

### Step 1: Install Dependencies
```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd web
pnpm install
cd ..
```

### Step 2: Get Testnet MATIC
1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy" network
3. Paste your wallet address
4. Request MATIC (it's free!)
5. Wait ~30 seconds for confirmation

### Step 3: Configure Environment Variables

**Root `.env` file:**
```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your values:
```env
PRIVATE_KEY=your_metamask_private_key_without_0x_prefix
AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
CURATOR_ADDRESS=your_wallet_address_or_curator_address
```

💡 **How to get your MetaMask private key:**
1. Open MetaMask → Click 3 dots → Account Details
2. Click "Show private key"
3. Enter your password
4. Copy the key (without the `0x` prefix)

**Frontend `web/.env` file:**
```bash
# Copy the example file
cp web/.env.example web/.env
```

Edit `web/.env`:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_from_walletconnect
VITE_REGISTRY_ADDRESS=will_be_filled_after_deployment
```

💡 **Get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com/
2. Sign up/Login
3. Create a new project
4. Copy the Project ID

### Step 4: Compile, Test & Deploy Smart Contract

```bash
# Compile the smart contract
pnpm compile

# Run tests (should see 25 tests passing)
pnpm test

# Deploy to Polygon Amoy testnet
pnpm deploy:amoy
```

**📋 IMPORTANT:** After deployment, copy the contract address from the output!
```
BugBountyRegistry deployed to: 0x1234...5678
```

### Step 5: Update Frontend & Launch

```bash
# Edit web/.env and update with your deployed contract address:
# VITE_REGISTRY_ADDRESS=0x1234...5678

# Start the frontend development server
cd web
pnpm dev
```

🎉 **Open your browser to http://localhost:5173**

## 🎮 Testing the Platform

### Test Flow 1: Create Your First Bounty
1. Click **"Connect Wallet"** in the top-right
2. Switch to **Polygon Amoy** network if prompted
3. Fill in the **"Create Bounty"** form:
   - **Bounty ID:** `1`
   - **Amount:** `0.1` (MATIC)
   - **Metadata URI:** `ipfs://test` or `https://example.com/bounty1.json`
4. Click **"Create Bounty"** and confirm the transaction
5. Wait for confirmation ✅

### Test Flow 2: Submit a Fix (as Hunter)
1. Switch to a different wallet (or use the same for testing)
2. Fill in the **"Submit Fix"** form:
   - **Bounty ID:** `1`
   - **Submission URI:** `https://github.com/user/repo/pull/1`
3. Click **"Submit Fix"** and confirm
4. Wait for confirmation ✅

### Test Flow 3: Approve & Pay (as Curator)
1. Switch to the wallet with **curator role** (the one you set in `.env`)
2. Fill in the **"Curator Panel"**:
   - **Bounty ID:** `1`
3. Click **"Approve & Pay"**
4. Confirm the transaction
5. Payment sent automatically to the hunter! 💰

### Test Flow 4: View Bounty Status
1. Fill in the **"View Bounty"** form:
   - **Bounty ID:** `1`
2. Click **"View Bounty"**
3. See all details including status, amount, sponsor, hunter, etc.

## 📚 What's Next?

- Explore the full documentation in [README.md](./README.md)
- Check the detailed setup guide in [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Read the implementation summary in [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- Browse the smart contract code in [contracts/BugBountyRegistry.sol](./contracts/BugBountyRegistry.sol)

## ❓ Troubleshooting

**"Bounty does not exist" or "Internal JSON-RPC error" when submitting fix:**
- ✅ **Solution:** You must create the bounty FIRST before submitting a fix
- Make sure you're using the same Bounty ID that you created
- The improved form now shows real-time validation

**"Bounty is not open" error:**
- ✅ **Solution:** The bounty has already been submitted, approved, or cancelled
- Use a different bounty ID or create a new bounty
- Check the bounty status in the UI before submitting

**"Insufficient funds" error:**
- Get more testnet MATIC from https://faucet.polygon.technology/

**"Wrong network" error:**
- Switch to Polygon Amoy in MetaMask (ChainID: 80002)

**"Only curator can approve" error:**
- Make sure you're using the wallet address set as `CURATOR_ADDRESS` in `.env`

**Contract not responding:**
- Verify `VITE_REGISTRY_ADDRESS` in `web/.env` matches your deployed contract

## 🔄 Common Workflow Mistakes
**❌ WRONG: Trying to submit fix first**
```
1. Submit Fix (Bounty ID 1) → ❌ Error: Bounty does not exist
```

**✅ CORRECT: Create bounty first, then submit**
```
1. Create Bounty (ID 1, Amount 0.1 MATIC) → ✅ Success
2. Submit Fix (Bounty ID 1) → ✅ Success
3. Approve Fix (Bounty ID 1) → ✅ Payment sent!
```

## 🎯 Key Resources

- **Polygon Amoy Faucet:** https://faucet.polygon.technology/
- **Polygon Amoy Explorer:** https://amoy.polygonscan.com/
- **WalletConnect Cloud:** https://cloud.walletconnect.com/
- **Polygon RPC:** https://rpc-amoy.polygon.technology/