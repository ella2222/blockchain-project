/* global BigInt */

import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../utils/Context';
import { getBalance, deposit, withdraw } from '../utils/EthersUtils';
import { useBalance } from '../contexts/BalanceContext'; // Adjust the path as necessary

const { ethers } = require('ethers');

const provider = new ethers.BrowserProvider(window.ethereum);

async function getCurrentMetaMaskAddress() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0]; // The first account is usually the user's primary MetaMask account.
    } catch (error) {
      console.error("Error fetching MetaMask account:", error);
      return null;
    }
  } else {
    alert("Please install MetaMask to use this feature.");
    return null;
  }
}

const calculateFee = (amount) => {
  if (amount < 1000) {
    return amount * 0.01; // 1% fee for amounts less than 1000 EEC
  } else if (amount < 5000) {
    return amount * 0.02; // 2% fee for amounts between 1000 and 5000 EEC
  } else {
    return amount * 0.05; // 5% fee for amounts greater than 5000 EEC
  }
};

const Deposit = ({ amountToAdd, handleAmountChange, handleAddFunds, depositAmount, taxAmount }) => (
  <div>
    <div className="min-max-deposit">
        <p style={{color:"black"}}>Minimum deposit: 10 EEC</p>
        <p style={{color:"black"}}>Maximum deposit: 10000 EEC</p>
    </div>
    <div className="add-funds-container">
      <input
        type="number"
        value={amountToAdd}
        onChange={handleAmountChange}
        placeholder="Enter amount to add"
      />
      <button onClick={handleAddFunds} className="add-funds-button">Add Funds</button>
      <div className="deposit-amount-and-fees">
        <p>Deposit Amount: {(Number(depositAmount)).toFixed(2)} EEC</p>
        <p>Fee: {(Number(taxAmount)).toFixed(2)} EEC</p>
      </div>
      <div className="fee-info">
        <p>Note: A fee will be applied when depositing funds.</p>
        <p>1% for amounts less than 1000 EEC, 2% for amounts between 1000 and 5000 EEC, 5% for amounts greater than 5000 EEC.</p>
      </div>
    </div>
  </div>
);

const Withdraw = ({ amountToWithdraw, handleWithdrawAmountChange, handleWithdrawFunds, withdrawAmount, withdrawTaxAmount }) => (
  <div>
    <div className="min-max-deposit">
        <p style={{color:"black"}}>Minimum withdraw: 10 EEC</p>
        <p style={{color:"black"}}>Maximum withdraw: 10000 EEC</p>
    </div>
    <div className="add-funds-container">
      <input
        type="number"
        value={amountToWithdraw}
        onChange={handleWithdrawAmountChange}
        placeholder="Enter amount to withdraw"
      />
      <button onClick={handleWithdrawFunds} className="add-funds-button">Withdraw Funds</button>
      <div className="deposit-amount-and-fees">
        <p>Withdraw Amount: {(Number(withdrawAmount)).toFixed(2)} EEC</p>
        <p>Fee: {(Number(withdrawTaxAmount)).toFixed(2)} EEC</p>
      </div>
      <div className="fee-info">
        <p>Note: A fee will be applied when withdrawing funds.</p>
        <p>1% for amounts less than 1000 EEC, 2% for amounts between 1000 and 5000 EEC, 5% for amounts greater than 5000 EEC.</p>
      </div>
    </div>
  </div>
);

export const Profile = () => {
  const [userAddress, setUserAddress] = useState('');
  const [amountToAdd, setAmountToAdd] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawTaxAmount, setWithdrawTaxAmount] = useState(0);
  const [selectedPage, setSelectedPage] = useState('deposit');
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const { balance, setBalance } = useBalance();

  useEffect(() => {
    getCurrentMetaMaskAddress().then(address => {
      setUserAddress(address);
    });
  }, []);

  const handleAmountChange = (event) => {
    let value = event.target.value;
  
    // Remove leading zeros
    value = value.replace(/^0+(?!$)/, '');
  
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      const fee = calculateFee(amount);
      setTaxAmount(fee);
      setDepositAmount(amount - fee);
    } else {
      setTaxAmount(0);
      setDepositAmount(0);
    }
    setAmountToAdd(value);
  };
  
  const handleWithdrawAmountChange = (event) => {
    let value = event.target.value;
  
    // Remove leading zeros
    value = value.replace(/^0+(?!$)/, '');
  
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      const fee = calculateFee(amount);
      setWithdrawTaxAmount(fee);
      setWithdrawAmount(amount - fee);
    } else {
      setWithdrawTaxAmount(0);
      setWithdrawAmount(0);
    }
    setAmountToWithdraw(value);
  };
  

  const handleAddFunds = async () => {
    const parsedAmount = parseFloat(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    if (parsedAmount > 10000) {
      alert("Maximum deposit amount is 10000 EEC.");
      return;
    }

    if (parsedAmount < 10) {
      alert("Minimum deposit amount is 10 EEC.");
      return;
    }

    const fee = calculateFee(parsedAmount);
    const totalAmount = parsedAmount - fee;

    if (!wallet) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const txResponse = await deposit(signer, parsedAmount);
      const txReceipt = await txResponse.wait(); // Wait for the transaction to be mined

      if (txReceipt.status === 1) { // Check if the transaction was successful
        const updatedBalance = await getBalance(signer, userAddress);
        setBalance(updatedBalance);
        alert(`Funds added successfully! A fee of ${fee.toFixed(2)} EEC was applied.`);
      } else {
        alert("Transaction failed.");
      }
    } catch (error) {
      console.error("Failed to deposit funds:", error);
      alert("Failed to add funds. Please try again.");
    }
  };

  const handleWithdrawFunds = async () => {
    const parsedAmount = parseFloat(amountToWithdraw);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    if (parsedAmount > 10000) {
      alert("Maximum withdraw amount is 10000 EEC.");
      return;
    }

    if (parsedAmount < 10) {
      alert("Minimum withdraw amount is 10 EEC.");
      return;
    }

    const fee = calculateFee(parsedAmount);
    const totalAmount = parsedAmount - fee;

    if (!wallet) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const txResponse = await withdraw(signer, parsedAmount);
      const txReceipt = await txResponse.wait(); // Wait for the transaction to be mined

      if (txReceipt.status === 1) { // Check if the transaction was successful
        const updatedBalance = await getBalance(signer, userAddress);
        setBalance(updatedBalance);
        alert(`Funds withdrawn successfully! A fee of ${fee.toFixed(2)} EEC was applied.`);
      } else {
        alert("Transaction failed.");
      }
    } catch (error) {
      console.error("Failed to withdraw funds:", error);
      alert("Failed to withdraw funds. Please try again.");
    }
  };

  const goBack = () => {
    navigate('/home');
  };

  const renderContent = () => {
    if (selectedPage === 'deposit') {
      return <Deposit
        amountToAdd={amountToAdd}
        handleAmountChange={handleAmountChange}
        handleAddFunds={handleAddFunds}
        depositAmount={depositAmount}
        taxAmount={taxAmount}
      />;
    } else if (selectedPage === 'withdraw') {
      return <Withdraw
        amountToWithdraw={amountToWithdraw}
        handleWithdrawAmountChange={handleWithdrawAmountChange}
        handleWithdrawFunds={handleWithdrawFunds}
        withdrawAmount={withdrawAmount}
        withdrawTaxAmount={withdrawTaxAmount}
      />;
    }
  };

  return (
    <div className="profile-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Profile</h1>
      <div className="profile-info">
        <p>Address: {userAddress}</p>
        <p>Balance: {(Number(balance) / 100).toFixed(2)} EEC</p>
      </div>
      <div className="selector">
        <button onClick={() => setSelectedPage('deposit')} className={`selector-button ${selectedPage === 'deposit' ? 'active' : ''}`}>Deposit</button>
        <button onClick={() => setSelectedPage('withdraw')} className={`selector-button ${selectedPage === 'withdraw' ? 'active' : ''}`}>Withdraw</button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Profile;