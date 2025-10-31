import { expect } from "chai";
import { ethers } from "hardhat";
import { BugBountyRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BugBountyRegistry", function () {
  let registry: BugBountyRegistry;
  let owner: SignerWithAddress;
  let curator: SignerWithAddress;
  let sponsor: SignerWithAddress;
  let hunter: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const bountyId = 1;
  const bountyAmount = ethers.parseEther("1.0");
  const metadataURI = "ipfs://QmTest123";
  const submissionURI = "https://github.com/user/repo/pull/1";

  beforeEach(async function () {
    // Get signers
    [owner, curator, sponsor, hunter, otherAccount] = await ethers.getSigners();

    // Deploy contract
    const BugBountyRegistry = await ethers.getContractFactory("BugBountyRegistry");
    registry = await BugBountyRegistry.deploy();
    await registry.waitForDeployment();

    // Grant curator role
    const CURATOR_ROLE = await registry.CURATOR_ROLE();
    await registry.grantRole(CURATOR_ROLE, curator.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
      expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant curator role", async function () {
      const CURATOR_ROLE = await registry.CURATOR_ROLE();
      expect(await registry.hasRole(CURATOR_ROLE, curator.address)).to.be.true;
    });
  });

  describe("Create Bounty", function () {
    it("Should create a bounty with correct details", async function () {
      await expect(
        registry.connect(sponsor).createBounty(bountyId, metadataURI, {
          value: bountyAmount,
        })
      )
        .to.emit(registry, "BountyCreated")
        .withArgs(bountyId, sponsor.address, bountyAmount, metadataURI);

      const bounty = await registry.getBounty(bountyId);
      expect(bounty.sponsor).to.equal(sponsor.address);
      expect(bounty.amount).to.equal(bountyAmount);
      expect(bounty.metadataURI).to.equal(metadataURI);
      expect(bounty.status).to.equal(0); // Status.Open
    });

    it("Should fail if bounty amount is zero", async function () {
      await expect(
        registry.connect(sponsor).createBounty(bountyId, metadataURI, {
          value: 0,
        })
      ).to.be.revertedWith("Bounty amount must be greater than 0");
    });

    it("Should fail if metadata URI is empty", async function () {
      await expect(
        registry.connect(sponsor).createBounty(bountyId, "", {
          value: bountyAmount,
        })
      ).to.be.revertedWith("Metadata URI required");
    });

    it("Should fail if bounty ID already exists", async function () {
      await registry.connect(sponsor).createBounty(bountyId, metadataURI, {
        value: bountyAmount,
      });

      await expect(
        registry.connect(sponsor).createBounty(bountyId, metadataURI, {
          value: bountyAmount,
        })
      ).to.be.revertedWith("Bounty ID already exists");
    });
  });

  describe("Submit Fix", function () {
    beforeEach(async function () {
      await registry.connect(sponsor).createBounty(bountyId, metadataURI, {
        value: bountyAmount,
      });
    });

    it("Should submit a fix successfully", async function () {
      await expect(
        registry.connect(hunter).submitFix(bountyId, hunter.address, submissionURI)
      )
        .to.emit(registry, "FixSubmitted")
        .withArgs(bountyId, hunter.address, submissionURI);

      const bounty = await registry.getBounty(bountyId);
      expect(bounty.hunter).to.equal(hunter.address);
      expect(bounty.submissionURI).to.equal(submissionURI);
      expect(bounty.status).to.equal(1); // Status.Submitted
    });

    it("Should fail if bounty does not exist", async function () {
      await expect(
        registry.connect(hunter).submitFix(999, hunter.address, submissionURI)
      ).to.be.revertedWith("Bounty does not exist");
    });

    it("Should fail if bounty is not open", async function () {
      await registry.connect(hunter).submitFix(bountyId, hunter.address, submissionURI);

      await expect(
        registry.connect(otherAccount).submitFix(bountyId, otherAccount.address, submissionURI)
      ).to.be.revertedWith("Bounty is not open");
    });

    it("Should fail if hunter address is invalid", async function () {
      await expect(
        registry.connect(hunter).submitFix(bountyId, ethers.ZeroAddress, submissionURI)
      ).to.be.revertedWith("Invalid hunter address");
    });

    it("Should fail if submission URI is empty", async function () {
      await expect(
        registry.connect(hunter).submitFix(bountyId, hunter.address, "")
      ).to.be.revertedWith("Submission URI required");
    });
  });

  describe("Approve Fix", function () {
    beforeEach(async function () {
      await registry.connect(sponsor).createBounty(bountyId, metadataURI, {
        value: bountyAmount,
      });
      await registry.connect(hunter).submitFix(bountyId, hunter.address, submissionURI);
    });

    it("Should approve fix and pay hunter", async function () {
      const hunterBalanceBefore = await ethers.provider.getBalance(hunter.address);

      await expect(registry.connect(curator).approveFix(bountyId))
        .to.emit(registry, "FixApproved")
        .withArgs(bountyId, curator.address)
        .and.to.emit(registry, "BountyPaid")
        .withArgs(bountyId, hunter.address, bountyAmount);

      const hunterBalanceAfter = await ethers.provider.getBalance(hunter.address);
      expect(hunterBalanceAfter - hunterBalanceBefore).to.equal(bountyAmount);

      const bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(3); // Status.Paid
    });

    it("Should fail if caller is not curator", async function () {
      await expect(
        registry.connect(otherAccount).approveFix(bountyId)
      ).to.be.reverted; // AccessControl revert
    });

    it("Should fail if bounty does not exist", async function () {
      await expect(
        registry.connect(curator).approveFix(999)
      ).to.be.revertedWith("Bounty does not exist");
    });

    it("Should fail if fix not submitted", async function () {
      const newBountyId = 2;
      await registry.connect(sponsor).createBounty(newBountyId, metadataURI, {
        value: bountyAmount,
      });

      await expect(
        registry.connect(curator).approveFix(newBountyId)
      ).to.be.revertedWith("Fix not submitted");
    });
  });

  describe("Refund", function () {
    beforeEach(async function () {
      await registry.connect(sponsor).createBounty(bountyId, metadataURI, {
        value: bountyAmount,
      });
    });

    it("Should refund sponsor for open bounty", async function () {
      const sponsorBalanceBefore = await ethers.provider.getBalance(sponsor.address);

      const tx = await registry.connect(sponsor).refund(bountyId);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const sponsorBalanceAfter = await ethers.provider.getBalance(sponsor.address);
      
      expect(sponsorBalanceAfter - sponsorBalanceBefore + gasUsed).to.equal(bountyAmount);

      const bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(5); // Status.Refunded
    });

    it("Should refund sponsor for cancelled bounty", async function () {
      await registry.connect(sponsor).cancelBounty(bountyId);
      
      const sponsorBalanceBefore = await ethers.provider.getBalance(sponsor.address);

      const tx = await registry.connect(sponsor).refund(bountyId);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const sponsorBalanceAfter = await ethers.provider.getBalance(sponsor.address);
      
      expect(sponsorBalanceAfter - sponsorBalanceBefore + gasUsed).to.equal(bountyAmount);

      const bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(5); // Status.Refunded
    });

    it("Should fail if caller is not sponsor", async function () {
      await expect(
        registry.connect(otherAccount).refund(bountyId)
      ).to.be.revertedWith("Only sponsor can refund");
    });

    it("Should fail if bounty does not exist", async function () {
      await expect(
        registry.connect(sponsor).refund(999)
      ).to.be.revertedWith("Bounty does not exist");
    });

    it("Should fail if bounty is submitted", async function () {
      await registry.connect(hunter).submitFix(bountyId, hunter.address, submissionURI);

      await expect(
        registry.connect(sponsor).refund(bountyId)
      ).to.be.revertedWith("Cannot refund in current status");
    });
  });

  describe("Cancel Bounty", function () {
    beforeEach(async function () {
      await registry.connect(sponsor).createBounty(bountyId, metadataURI, {
        value: bountyAmount,
      });
    });

    it("Should cancel an open bounty", async function () {
      await registry.connect(sponsor).cancelBounty(bountyId);

      const bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(4); // Status.Cancelled
    });

    it("Should fail if caller is not sponsor", async function () {
      await expect(
        registry.connect(otherAccount).cancelBounty(bountyId)
      ).to.be.revertedWith("Only sponsor can cancel");
    });

    it("Should fail if bounty is not open", async function () {
      await registry.connect(hunter).submitFix(bountyId, hunter.address, submissionURI);

      await expect(
        registry.connect(sponsor).cancelBounty(bountyId)
      ).to.be.revertedWith("Can only cancel open bounties");
    });
  });

  describe("Full Lifecycle", function () {
    it("Should complete full bounty lifecycle: Open → Submitted → Approved → Paid", async function () {
      // Create bounty
      await registry.connect(sponsor).createBounty(bountyId, metadataURI, {
        value: bountyAmount,
      });
      let bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(0); // Open

      // Submit fix
      await registry.connect(hunter).submitFix(bountyId, hunter.address, submissionURI);
      bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(1); // Submitted

      // Approve and pay
      const hunterBalanceBefore = await ethers.provider.getBalance(hunter.address);
      await registry.connect(curator).approveFix(bountyId);
      const hunterBalanceAfter = await ethers.provider.getBalance(hunter.address);
      
      bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(3); // Paid
      expect(hunterBalanceAfter - hunterBalanceBefore).to.equal(bountyAmount);
    });

    it("Should complete refund lifecycle: Open → Cancelled → Refunded", async function () {
      // Create bounty
      await registry.connect(sponsor).createBounty(bountyId, metadataURI, {
        value: bountyAmount,
      });

      // Cancel bounty
      await registry.connect(sponsor).cancelBounty(bountyId);
      let bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(4); // Cancelled

      // Refund
      await registry.connect(sponsor).refund(bountyId);
      bounty = await registry.getBounty(bountyId);
      expect(bounty.status).to.equal(5); // Refunded
    });
  });
});
