import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying BugBountyRegistry to Polygon Amoy...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Deploy contract
  const BugBountyRegistry = await ethers.getContractFactory("BugBountyRegistry");
  const registry = await BugBountyRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("BugBountyRegistry deployed to:", registryAddress);

  // Get curator address from environment or use deployer as default
  const curatorAddress = process.env.CURATOR_ADDRESS || deployer.address;
  
  // Grant curator role
  const CURATOR_ROLE = await registry.CURATOR_ROLE();
  console.log("Granting CURATOR_ROLE to:", curatorAddress);
  
  const grantTx = await registry.grantRole(CURATOR_ROLE, curatorAddress);
  await grantTx.wait();
  console.log("CURATOR_ROLE granted successfully!");

  // Verify roles
  const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
  const isAdmin = await registry.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const isCurator = await registry.hasRole(CURATOR_ROLE, curatorAddress);
  
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", registryAddress);
  console.log("Deployer (Admin):", deployer.address, "- Has Admin Role:", isAdmin);
  console.log("Curator:", curatorAddress, "- Has Curator Role:", isCurator);
  console.log("\n=== Next Steps ===");
  console.log("1. Update web/.env with:");
  console.log(`   VITE_REGISTRY_ADDRESS=${registryAddress}`);
  console.log("2. Get testnet MATIC from: https://faucet.polygon.technology/");
  console.log("3. Start the frontend: cd web && pnpm dev");
  
  // Save deployment info to a file
  const fs = require("fs");
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(), // Convert BigInt to string
    contractAddress: registryAddress,
    deployer: deployer.address,
    curator: curatorAddress,
    deployedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
