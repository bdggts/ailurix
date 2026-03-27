// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArenaController
 * @notice On-chain betting for DOMINEX ARENA fights.
 *         Players wager $DMX — winner takes the pot (minus 5% platform fee).
 *         Supports PvP matchmaking and tournament brackets.
 */
contract ArenaController is Ownable, ReentrancyGuard {

    IERC20 public immutable dmxToken;
    address public feeWallet;
    uint256 public feePercent = 5; // 5%

    // ── Match State ──────────────────────────────────────────────────────────
    enum MatchStatus { OPEN, IN_PROGRESS, FINISHED, CANCELLED }

    struct Match {
        address player1;
        address player2;
        uint256 betAmount;   // per player, in $DMX
        uint256 pot;         // total
        address winner;
        MatchStatus status;
        uint256 createdAt;
        uint256 expiresAt;   // player1 gets refund if no opponent joins in time
    }

    mapping(uint256 => Match) public matches;
    mapping(address => uint256) public activeMatch; // player => matchId (0 = none)
    mapping(address => uint256) public stats_wins;
    mapping(address => uint256) public stats_losses;

    uint256 public nextMatchId = 1;
    uint256 public constant MATCH_TIMEOUT = 5 minutes;
    uint256 public constant MIN_BET = 50 * 1e18;   // 50 $DMX
    uint256 public constant MAX_BET = 10000 * 1e18; // 10,000 $DMX

    // ── Tournament ────────────────────────────────────────────────────────────
    struct Tournament {
        string name;
        uint256 entryFee;
        uint256 prizePool;
        uint256 maxPlayers;
        address[] players;
        address winner;
        bool active;
    }
    mapping(uint256 => Tournament) public tournaments;
    uint256 public nextTournamentId = 1;

    // ── Events ────────────────────────────────────────────────────────────────
    event MatchCreated(uint256 indexed matchId, address indexed player1, uint256 betAmount);
    event MatchJoined(uint256 indexed matchId, address indexed player2);
    event MatchResult(uint256 indexed matchId, address indexed winner, uint256 prize);
    event MatchCancelled(uint256 indexed matchId);
    event TournamentCreated(uint256 indexed id, string name, uint256 entryFee);
    event TournamentJoined(uint256 indexed id, address indexed player);

    // ── Constructor ────────────────────────────────────────────────────────────
    constructor(address _dmxToken, address _feeWallet) Ownable(msg.sender) {
        dmxToken = IERC20(_dmxToken);
        feeWallet = _feeWallet;
    }

    // ── Create Match (Player 1) ───────────────────────────────────────────────
    function createMatch(uint256 betAmount) external nonReentrant returns (uint256 matchId) {
        require(betAmount >= MIN_BET && betAmount <= MAX_BET, "Invalid bet");
        require(activeMatch[msg.sender] == 0, "Already in a match");
        require(dmxToken.transferFrom(msg.sender, address(this), betAmount), "Transfer failed");

        matchId = nextMatchId++;
        matches[matchId] = Match({
            player1:   msg.sender,
            player2:   address(0),
            betAmount: betAmount,
            pot:       betAmount,
            winner:    address(0),
            status:    MatchStatus.OPEN,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + MATCH_TIMEOUT
        });
        activeMatch[msg.sender] = matchId;
        emit MatchCreated(matchId, msg.sender, betAmount);
    }

    // ── Join Match (Player 2) ──────────────────────────────────────────────────
    function joinMatch(uint256 matchId) external nonReentrant {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.OPEN, "Match not open");
        require(m.player1 != msg.sender, "Cannot play yourself");
        require(activeMatch[msg.sender] == 0, "Already in a match");
        require(block.timestamp <= m.expiresAt, "Match expired");
        require(dmxToken.transferFrom(msg.sender, address(this), m.betAmount), "Transfer failed");

        m.player2 = msg.sender;
        m.pot += m.betAmount;
        m.status = MatchStatus.IN_PROGRESS;
        activeMatch[msg.sender] = matchId;
        emit MatchJoined(matchId, msg.sender);
    }

    // ── Submit Result (Owner/Oracle) ───────────────────────────────────────────
    function submitResult(uint256 matchId, address winner) external onlyOwner nonReentrant {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.IN_PROGRESS, "Match not in progress");
        require(winner == m.player1 || winner == m.player2, "Invalid winner");

        m.winner = winner;
        m.status = MatchStatus.FINISHED;
        address loser = winner == m.player1 ? m.player2 : m.player1;

        // Fee
        uint256 fee    = (m.pot * feePercent) / 100;
        uint256 prize  = m.pot - fee;

        require(dmxToken.transfer(feeWallet, fee), "Fee transfer failed");
        require(dmxToken.transfer(winner, prize), "Prize transfer failed");

        activeMatch[m.player1] = 0;
        activeMatch[m.player2] = 0;
        stats_wins[winner]++;
        stats_losses[loser]++;

        emit MatchResult(matchId, winner, prize);
    }

    // ── Cancel Expired Match ───────────────────────────────────────────────────
    function cancelExpiredMatch(uint256 matchId) external nonReentrant {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.OPEN, "Not open");
        require(block.timestamp > m.expiresAt, "Not expired yet");

        m.status = MatchStatus.CANCELLED;
        activeMatch[m.player1] = 0;
        require(dmxToken.transfer(m.player1, m.betAmount), "Refund failed");
        emit MatchCancelled(matchId);
    }

    // ── Tournament ────────────────────────────────────────────────────────────
    function createTournament(string calldata name, uint256 entryFee, uint256 maxPlayers) external onlyOwner returns (uint256 id) {
        require(entryFee >= MIN_BET, "Fee too low");
        require(maxPlayers >= 4 && maxPlayers <= 64, "Invalid size");
        id = nextTournamentId++;
        Tournament storage t = tournaments[id];
        t.name = name; t.entryFee = entryFee; t.maxPlayers = maxPlayers; t.active = true;
        emit TournamentCreated(id, name, entryFee);
    }

    function joinTournament(uint256 id) external nonReentrant {
        Tournament storage t = tournaments[id];
        require(t.active, "Not active");
        require(t.players.length < t.maxPlayers, "Full");
        require(dmxToken.transferFrom(msg.sender, address(this), t.entryFee), "Transfer failed");
        t.players.push(msg.sender);
        t.prizePool += t.entryFee;
        emit TournamentJoined(id, msg.sender);
    }

    function payoutTournament(uint256 id, address winner) external onlyOwner {
        Tournament storage t = tournaments[id];
        require(t.active && winner != address(0), "Invalid");
        uint256 fee   = (t.prizePool * feePercent) / 100;
        uint256 prize = t.prizePool - fee;
        t.winner = winner; t.active = false;
        require(dmxToken.transfer(feeWallet, fee), "Fee failed");
        require(dmxToken.transfer(winner, prize), "Prize failed");
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    function setFeePercent(uint256 _fee) external onlyOwner { require(_fee <= 10, "Max 10%"); feePercent = _fee; }
    function setFeeWallet(address _wallet) external onlyOwner { require(_wallet != address(0)); feeWallet = _wallet; }

    // ── View ──────────────────────────────────────────────────────────────────
    function getPlayerStats(address player) external view returns (uint256 wins, uint256 losses) {
        return (stats_wins[player], stats_losses[player]);
    }
    function getTournamentPlayers(uint256 id) external view returns (address[] memory) {
        return tournaments[id].players;
    }
}
