// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title BugBountyRegistry
 * @dev A Web3 Bug Bounty platform with curator-approved payouts
 * Deployed on Polygon Amoy testnet
 */
contract BugBountyRegistry is AccessControl, ReentrancyGuard {
    using Address for address payable;

    // Role for curators who can approve submissions
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");

    enum Status {
        Open,
        Submitted,
        Approved,
        Paid,
        Cancelled,
        Refunded
    }

    struct Bounty {
        address sponsor;
        uint256 amount;
        address payable hunter;
        string metadataURI;
        string submissionURI;
        Status status;
    }

    // Mapping from bounty ID to Bounty
    mapping(uint256 => Bounty) public bounties;

    // Events
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed sponsor,
        uint256 amount,
        string metadataURI
    );
    
    event FixSubmitted(
        uint256 indexed bountyId,
        address indexed hunter,
        string submissionURI
    );
    
    event FixApproved(
        uint256 indexed bountyId,
        address indexed curator
    );
    
    event BountyPaid(
        uint256 indexed bountyId,
        address indexed hunter,
        uint256 amount
    );
    
    event Refunded(
        uint256 indexed bountyId,
        address indexed sponsor,
        uint256 amount
    );

    /**
     * @dev Constructor grants admin role to deployer
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new bounty with escrowed funds
     * @param bountyId Unique identifier for the bounty
     * @param metadataURI URI pointing to bounty details (e.g., IPFS)
     */
    function createBounty(
        uint256 bountyId,
        string calldata metadataURI
    ) external payable {
        require(msg.value > 0, "Bounty amount must be greater than 0");
        require(bounties[bountyId].sponsor == address(0), "Bounty ID already exists");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        bounties[bountyId] = Bounty({
            sponsor: msg.sender,
            amount: msg.value,
            hunter: payable(address(0)),
            metadataURI: metadataURI,
            submissionURI: "",
            status: Status.Open
        });

        emit BountyCreated(bountyId, msg.sender, msg.value, metadataURI);
    }

    /**
     * @dev Submit a fix for a bounty
     * @param bountyId The bounty to submit a fix for
     * @param hunter Address of the hunter who will receive payment
     * @param submissionURI URI pointing to the fix (e.g., GitHub PR)
     */
    function submitFix(
        uint256 bountyId,
        address payable hunter,
        string calldata submissionURI
    ) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.sponsor != address(0), "Bounty does not exist");
        require(bounty.status == Status.Open, "Bounty is not open");
        require(hunter != address(0), "Invalid hunter address");
        require(bytes(submissionURI).length > 0, "Submission URI required");

        bounty.hunter = hunter;
        bounty.submissionURI = submissionURI;
        bounty.status = Status.Submitted;

        emit FixSubmitted(bountyId, hunter, submissionURI);
    }

    /**
     * @dev Approve a fix and release payment to hunter
     * @param bountyId The bounty to approve
     */
    function approveFix(uint256 bountyId) 
        external 
        onlyRole(CURATOR_ROLE) 
        nonReentrant 
    {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.sponsor != address(0), "Bounty does not exist");
        require(bounty.status == Status.Submitted, "Fix not submitted");
        require(bounty.hunter != address(0), "No hunter assigned");
        require(bounty.amount > 0, "No funds to release");

        uint256 amount = bounty.amount;
        address payable hunter = bounty.hunter;

        // Update state before transfer
        bounty.status = Status.Paid;

        // Transfer funds to hunter
        hunter.sendValue(amount);

        emit FixApproved(bountyId, msg.sender);
        emit BountyPaid(bountyId, hunter, amount);
    }

    /**
     * @dev Refund bounty to sponsor
     * @param bountyId The bounty to refund
     */
    function refund(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.sponsor != address(0), "Bounty does not exist");
        require(bounty.sponsor == msg.sender, "Only sponsor can refund");
        require(
            bounty.status == Status.Open || bounty.status == Status.Cancelled,
            "Cannot refund in current status"
        );
        require(bounty.amount > 0, "No funds to refund");

        uint256 amount = bounty.amount;
        address payable sponsor = payable(bounty.sponsor);

        // Update state before transfer
        bounty.status = Status.Refunded;

        // Transfer funds back to sponsor
        sponsor.sendValue(amount);

        emit Refunded(bountyId, sponsor, amount);
    }

    /**
     * @dev Cancel a bounty (only sponsor, before submission)
     * @param bountyId The bounty to cancel
     */
    function cancelBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.sponsor != address(0), "Bounty does not exist");
        require(bounty.sponsor == msg.sender, "Only sponsor can cancel");
        require(bounty.status == Status.Open, "Can only cancel open bounties");

        bounty.status = Status.Cancelled;
    }

    /**
     * @dev Get bounty details
     * @param bountyId The bounty ID to query
     */
    function getBounty(uint256 bountyId) 
        external 
        view 
        returns (
            address sponsor,
            uint256 amount,
            address hunter,
            string memory metadataURI,
            string memory submissionURI,
            Status status
        ) 
    {
        Bounty memory bounty = bounties[bountyId];
        return (
            bounty.sponsor,
            bounty.amount,
            bounty.hunter,
            bounty.metadataURI,
            bounty.submissionURI,
            bounty.status
        );
    }
}
