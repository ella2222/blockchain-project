/* global BigInt */

import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../utils/Context';
import { getBalance, deposit } from '../utils/EthersUtils';
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

export const Profile = () => {
  const [userAddress, setUserAddress] = useState('');
  const [amountToAdd, setAmountToAdd] = useState('');
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const { balance, setBalance } = useBalance();

  useEffect(() => {
    getCurrentMetaMaskAddress().then(address => {
      setUserAddress(address);
    });
  }, []);

  const handleAmountChange = (event) => {
    setAmountToAdd(event.target.value);
  };

  const handleAddFunds = async () => {
    const parsedAmount = parseFloat(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    const fee = calculateFee(parsedAmount);
    const totalAmount = parsedAmount + fee;

    if (!wallet) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      await deposit(signer, totalAmount);
      const updatedBalance = await getBalance(signer, userAddress);
      setBalance(updatedBalance);
      alert(`Funds added successfully! A fee of ${fee.toFixed(2)} EEC was applied.`);
    } catch (error) {
      console.error("Failed to deposit funds:", error);
      alert("Failed to add funds. Please try again.");
    }
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="profile-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Profile</h1>
      <div className="profile-info">
        <p>Address: {userAddress}</p>
        <p>Balance: {(Number(balance) / 100).toFixed(2)} EEC</p>
      </div>
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
        <div className="fee-info">
          <p>Note: A fee will be applied when depositing funds.</p>
          <p>1% for amounts less than 1000 EEC, 2% for amounts between 1000 and 5000 EEC, 5% for amounts greater than 5000 EEC.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;