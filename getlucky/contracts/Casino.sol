// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EliEllaCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Casino is Ownable {
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
    
    constructor(address tokenAddress, address initialOwner) Ownable(initialOwner) {
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
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
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
        require(token.transfer(msg.sender, netAmount), "Transfer failed");
        
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
}