// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DmxToken — $DMX Game Token for Dominex
 * @notice 1 Billion total supply. Burn on upgrades. Mint by GameController only.
 */
contract DmxToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**6; // 1B with 6 decimals
    address public gameController;

    event GameControllerUpdated(address indexed controller);

    modifier onlyController() {
        require(msg.sender == gameController || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address treasury) ERC20("Dominex Token", "DMX") Ownable(msg.sender) {
        // Mint 40% to treasury (game rewards pool)
        _mint(treasury, (MAX_SUPPLY * 40) / 100);
        // Mint 20% to owner (staking + team + liquidity + marketing)
        _mint(msg.sender, (MAX_SUPPLY * 60) / 100);
    }

    function decimals() public pure override returns (uint8) { return 6; }

    function setGameController(address _controller) external onlyOwner {
        gameController = _controller;
        emit GameControllerUpdated(_controller);
    }

    /// @notice Mint $DMX as game rewards (only GameController)
    function mintReward(address player, uint256 amount) external onlyController {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(player, amount);
    }

    /// @notice Burn $DMX on territory upgrades
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
