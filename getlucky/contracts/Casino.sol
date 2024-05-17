// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EliEllaCoin.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Casino is Initializable, OwnableUpgradeable {
    EliEllaCoin public token;

    struct UserBalance {
        uint256 balance;
        uint256 depositTimestamp;
    }

    mapping(address => UserBalance) public balances;

    uint256 public minDepositAmount;
    uint256 public maxDepositAmount;
    uint256 public minWithdrawAmount;
    uint256 public maxWithdrawAmount;

    event Deposited(address indexed user, uint256 amount, uint256 fee, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 fee, uint256 timestamp);
    event MinDepositAmountUpdated(uint256 newMinDepositAmount);
    event MaxDepositAmountUpdated(uint256 newMaxDepositAmount);
    event MinWithdrawAmountUpdated(uint256 newMinWithdrawAmount);
    event MaxWithdrawAmountUpdated(uint256 newMaxWithdrawAmount);
    event BetPlaced(address indexed user, string game, uint256 amount, uint256 timestamp);
    event ResultDrawn(string game, uint256[] winningNumbers, uint256 timestamp);
    event PrizeClaimed(address indexed user, uint256 prizeAmount, uint256 timestamp);

    function initialize(address tokenAddress, address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        token = EliEllaCoin(tokenAddress);
        minDepositAmount = 10 * 10 ** 18; // 10 EEC
        maxDepositAmount = 10000 * 10 ** 18; // 10000 EEC
        minWithdrawAmount = 10 * 10 ** 18; // 10 EEC
        maxWithdrawAmount = 10000 * 10 ** 18; // 10000 EEC
    }

    function deposit(uint256 amount) public {
        require(amount >= minDepositAmount, "Deposit amount is too low");
        require(amount <= maxDepositAmount, "Deposit amount exceeds maximum limit");

        uint256 fee = calculateFee(amount);
        uint256 netAmount = amount - fee;
        
        // Transfer fee to the casino balance
        require(token.transferFrom(msg.sender, address(this), fee), "Transfer of fee failed");
        // Transfer net amount to the casino balance
        require(token.transferFrom(msg.sender, address(this), netAmount), "Transfer of net amount failed");

        balances[msg.sender].balance += netAmount;
        balances[msg.sender].depositTimestamp = block.timestamp;

        emit Deposited(msg.sender, netAmount, fee, block.timestamp);
    }

    function withdraw(uint256 amount) public {
        require(amount >= minWithdrawAmount, "Withdraw amount is too low");
        require(amount <= maxWithdrawAmount, "Withdraw amount exceeds maximum limit");
        require(balances[msg.sender].balance >= amount, "Insufficient balance");

        uint256 fee = calculateFee(amount);
        uint256 netAmount = amount - fee;
        
        balances[msg.sender].balance -= amount;

        // Transfer net amount to the user's MetaMask account
        require(token.transfer(msg.sender, netAmount), "Transfer of net amount failed");
        // Transfer fee to the casino balance
        require(token.transfer(address(this), fee), "Transfer of fee failed");

        emit Withdrawn(msg.sender, netAmount, fee, block.timestamp);
    }

    function calculateFee(uint256 amount) public pure returns (uint256) {
        if (amount < 1000 * 10 ** 18) {
            return amount * 1 / 100; // 1% fee for amounts less than 1000 EEC
        } else if (amount < 5000 * 10 ** 18) {
            return amount * 2 / 100; // 2% fee for amounts between 1000 and 5000 EEC
        } else {
            return amount * 5 / 100; // 5% fee for amounts greater than 5000 EEC
        }
    }

    function updateMinDepositAmount(uint256 newMinDepositAmount) external onlyOwner {
        minDepositAmount = newMinDepositAmount;
        emit MinDepositAmountUpdated(newMinDepositAmount);
    }

    function updateMaxDepositAmount(uint256 newMaxDepositAmount) external onlyOwner {
        maxDepositAmount = newMaxDepositAmount;
        emit MaxDepositAmountUpdated(newMaxDepositAmount);
    }

    function updateMinWithdrawAmount(uint256 newMinWithdrawAmount) external onlyOwner {
        minWithdrawAmount = newMinWithdrawAmount;
        emit MinWithdrawAmountUpdated(newMinWithdrawAmount);
    }

    function updateMaxWithdrawAmount(uint256 newMaxWithdrawAmount) external onlyOwner {
        maxWithdrawAmount = newMaxWithdrawAmount;
        emit MaxWithdrawAmountUpdated(newMaxWithdrawAmount);
    }

    function getUserBalance(address user) external view returns (uint256) {
        return balances[user].balance;
    }

    function getUserDepositTimestamp(address user) external view returns (uint256) {
        return balances[user].depositTimestamp;
    }

    function placeBet(string memory game, uint256 amount) public {
        require(balances[msg.sender].balance >= amount, "Insufficient balance");

        balances[msg.sender].balance -= amount;

        // Transfer the bet amount to the casino balance
        require(token.transfer(address(this), amount), "Transfer of bet amount failed");

        emit BetPlaced(msg.sender, game, amount, block.timestamp);
    }

    function drawResult(string memory game, uint256[] memory winningNumbers) public onlyOwner {
        emit ResultDrawn(game, winningNumbers, block.timestamp);
    }

    function claimPrize(uint256 prizeAmount) public {
        require(token.balanceOf(address(this)) >= prizeAmount, "Casino does not have enough funds to pay the prize");

        // Transfer the prize amount from the casino balance to the user's balance
        balances[msg.sender].balance += prizeAmount;

        emit PrizeClaimed(msg.sender, prizeAmount, block.timestamp);
    }
}