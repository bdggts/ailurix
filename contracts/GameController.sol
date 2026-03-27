// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameController — Core Dominex game logic
 * @notice Handles territory ownership, army, raids, daily rewards
 */
contract GameController is Ownable {
    struct Territory {
        address owner;
        uint8   level;        // 1-10
        uint256 lastMined;    // last block.timestamp when mined
        uint256 armySize;
        uint256 wallStrength; // 0-100
    }

    struct Player {
        uint256 totalMined;
        uint256 totalRaids;
        uint256 successfulRaids;
        uint256 lastDailyReward;
        uint256 clanId;
    }

    mapping(uint256 => Territory)  public territories;  // tokenId => territory
    mapping(address => Player)     public players;
    mapping(address => uint256[])  public ownedTerritories;

    uint256 public constant MINE_RATE_BASE    = 10 * 10**6; // 10 $DMX / hour base
    uint256 public constant RAID_REWARD_PCT   = 20;          // steal 20% of stored
    uint256 public constant DAILY_REWARD      = 5 * 10**6;   // 5 $DMX daily login

    address public dmxToken;
    uint256 public totalTerritories;

    event TerritoryMined(address indexed player, uint256 tokenId, uint256 amount);
    event RaidExecuted(address indexed attacker, address indexed defender, uint256 tokenId, bool success, uint256 loot);
    event DailyRewardClaimed(address indexed player, uint256 amount);

    constructor(address _dmxToken) Ownable(msg.sender) {
        dmxToken = _dmxToken;
    }

    /// @notice Claim idle $DMX from your territory
    function mine(uint256 tokenId) external {
        Territory storage t = territories[tokenId];
        require(t.owner == msg.sender, "Not your territory");
        uint256 elapsed = block.timestamp - t.lastMined;
        uint256 earned  = (MINE_RATE_BASE * t.level * elapsed) / 3600;
        t.lastMined = block.timestamp;
        players[msg.sender].totalMined += earned;
        // Mint $DMX reward to player
        (bool ok,) = dmxToken.call(abi.encodeWithSignature("mintReward(address,uint256)", msg.sender, earned));
        require(ok, "Mint failed");
        emit TerritoryMined(msg.sender, tokenId, earned);
    }

    /// @notice Attack another player's territory
    function raid(uint256 targetTokenId) external {
        Territory storage target = territories[targetTokenId];
        require(target.owner != address(0), "Empty territory");
        require(target.owner != msg.sender, "Cannot raid yourself");

        Territory storage attacker = territories[ownedTerritories[msg.sender][0]];
        bool success = attacker.armySize > (target.armySize + target.wallStrength / 10);

        players[msg.sender].totalRaids++;

        if (success) {
            players[msg.sender].successfulRaids++;
            uint256 loot = (MINE_RATE_BASE * target.level * RAID_REWARD_PCT) / 100;
            if (attacker.armySize > 0) attacker.armySize -= attacker.armySize / 4; // lose 25% army
            if (target.armySize > 0) target.armySize -= target.armySize / 2;        // defender loses 50%
            (bool ok,) = dmxToken.call(abi.encodeWithSignature("mintReward(address,uint256)", msg.sender, loot));
            require(ok, "Loot mint failed");
            emit RaidExecuted(msg.sender, target.owner, targetTokenId, true, loot);
        } else {
            if (attacker.armySize > 0) attacker.armySize -= attacker.armySize / 2; // failed = lose 50%
            emit RaidExecuted(msg.sender, target.owner, targetTokenId, false, 0);
        }
    }

    /// @notice Claim daily login reward
    function claimDailyReward() external {
        Player storage p = players[msg.sender];
        require(block.timestamp >= p.lastDailyReward + 24 hours, "Already claimed today");
        p.lastDailyReward = block.timestamp;
        (bool ok,) = dmxToken.call(abi.encodeWithSignature("mintReward(address,uint256)", msg.sender, DAILY_REWARD));
        require(ok, "Daily reward mint failed");
        emit DailyRewardClaimed(msg.sender, DAILY_REWARD);
    }

    /// @notice Register a minted territory NFT
    function registerTerritory(uint256 tokenId, address owner) external onlyOwner {
        territories[tokenId] = Territory({ owner: owner, level: 1, lastMined: block.timestamp, armySize: 10, wallStrength: 10 });
        ownedTerritories[owner].push(tokenId);
        totalTerritories++;
    }
}
