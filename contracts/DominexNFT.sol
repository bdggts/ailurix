// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DominexNFT — General NFTs for Dominex game
 * @notice 10,000 max. 5 rarity tiers. Mint with $DMX.
 */
contract DominexNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public totalMinted;
    string public baseURI;

    // Rarity: 0=Common 1=Rare 2=Epic 3=Legendary 4=Mythic
    mapping(uint256 => uint8) public rarity;
    mapping(uint8 => uint256) public mintCostByRarity; // in $DMX (6 decimals)
    mapping(uint8 => uint256) public supplyByRarity;
    mapping(uint8 => uint256) public mintedByRarity;

    address public dmxToken;

    event GeneralMinted(address indexed to, uint256 tokenId, uint8 rarity);

    constructor(address _dmxToken, string memory _baseURI) ERC721("Dominex General", "DGEN") Ownable(msg.sender) {
        dmxToken = _dmxToken;
        baseURI = _baseURI;

        // Supply per rarity
        supplyByRarity[0] = 5_000; // Common
        supplyByRarity[1] = 3_000; // Rare
        supplyByRarity[2] = 1_500; // Epic
        supplyByRarity[3] = 450;   // Legendary
        supplyByRarity[4] = 50;    // Mythic

        // Mint cost in $DMX (6 decimals)
        mintCostByRarity[0] = 100 * 10**6;    // 100 $DMX
        mintCostByRarity[1] = 500 * 10**6;    // 500 $DMX
        mintCostByRarity[2] = 2_000 * 10**6;  // 2,000 $DMX
        mintCostByRarity[3] = 10_000 * 10**6; // 10,000 $DMX
        mintCostByRarity[4] = 50_000 * 10**6; // 50,000 $DMX
    }

    function mint(uint8 _rarity) external {
        require(totalMinted < MAX_SUPPLY, "Sold out");
        require(_rarity <= 4, "Invalid rarity");
        require(mintedByRarity[_rarity] < supplyByRarity[_rarity], "Rarity sold out");

        uint256 cost = mintCostByRarity[_rarity];
        // Transfer $DMX from user and burn it
        (bool ok,) = dmxToken.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), cost));
        require(ok, "DMX transfer failed");
        (bool burned,) = dmxToken.call(abi.encodeWithSignature("burn(uint256)", cost));
        require(burned, "Burn failed");

        uint256 tokenId = ++totalMinted;
        rarity[tokenId] = _rarity;
        mintedByRarity[_rarity]++;
        _mint(msg.sender, tokenId);
        emit GeneralMinted(msg.sender, tokenId, _rarity);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Not minted");
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    function setBaseURI(string memory _uri) external onlyOwner { baseURI = _uri; }
}
