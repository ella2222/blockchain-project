/* global BigInt */

import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';

import { useWallet } from '../utils/Context';

import { getBalance, deposit, withdraw } from '../utils/EthersUtils';

const {ethers} = require('ethers');

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

export const Profile = () => {
  const [balance, setBalance] = useState(0);
  const [userAddress, setUserAddress] = useState('');
  const [amountToAdd, setAmountToAdd] = useState('');
  const navigate = useNavigate();

  const { wallet } = useWallet();

  useEffect(() => {
    getCurrentMetaMaskAddress().then(address => {
      setUserAddress(address);
    });
  }, []);

  useEffect(() => {
    if (wallet) {
      getBalance(provider, wallet).then(balance => {
        setBalance(balance);
      });
    }
  }, [wallet]);

  const handleAmountChange = (event) => {
    setAmountToAdd(event.target.value);
  };

  const handleAddFunds = () => {
    const parsedAmount = parseFloat(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    const amount = BigInt(Math.floor(parsedAmount * 100)); // Convert to BigInt, assuming smallest unit is cents

    if (!wallet) {
      alert("Please connect your wallet.");
      return;
    }

    deposit(provider, wallet, amount)
      .then(() => {
        setBalance(prevBalance => prevBalance + amount);
        alert("Funds added successfully!");
      })
      .catch(error => {
        console.error("Failed to deposit funds:", error);
        alert("Failed to add funds. Please try again.");
      });
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="profile-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Profile</h1>
      <p>Address: {userAddress}</p>
      <p>Balance: ${balance}</p>
      <div className="add-funds-container">
        <input
          type="number"
          value={amountToAdd}
          onChange={handleAmountChange}
          placeholder="Enter amount to add"
        />
        <button onClick={handleAddFunds} className="add-funds-button">Add Funds</button>
      </div>
    </div>
  );
};

export default Profile;
