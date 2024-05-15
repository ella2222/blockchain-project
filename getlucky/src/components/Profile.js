import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';

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

export const Profile = ({ initialBalance }) => {
  const [balance, setBalance] = useState(initialBalance);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentMetaMaskAddress().then(address => {
      setUserAddress(address);
    });
  }, []);

  const handleAddFunds = () => {
    const amount = parseFloat(amountToAdd);
    if (!isNaN(amount) && amount > 0) {
      const newBalance = balance + amount;
      if (newBalance >= 0) {
        setBalance(newBalance);
        setAmountToAdd('');
      } else {
        alert("Insufficient funds. Cannot have a negative balance.");
      }
    } else {
      alert("Please enter a valid amount.");
    }
  };

  const goBack = () => {
    navigate('/home');
  };

  const handleAmountChange = (e) => {
    setAmountToAdd(e.target.value);
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
