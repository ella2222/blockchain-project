import React, { useState, useEffect } from 'react';
import '../styles/Dice.css';
import { useNavigate } from 'react-router-dom';
import { useBalance } from '../contexts/BalanceContext'; // Adjust the path as necessary
import { placeBet, claimPrize, getBalance } from '../utils/EthersUtils'; // Adjust the path as necessary

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

export const Dice = () => {
  const [userAddress, setUserAddress] = useState('');
  const [userDice, setUserDice] = useState([0, 0]);
  const [computerDice, setComputerDice] = useState([0, 0]);
  const { balance, setBalance } = useBalance();
  const [betAmount, setBetAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [gamePlayed, setGamePlayed] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentMetaMaskAddress().then(address => {
      setUserAddress(address);
    });
  }, []);

  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const playGame = async () => {
    const bet = Number(betAmount);

    if (bet <= 0 || bet > Number(balance) / 100) {
      alert("Invalid bet amount! Bet must be at least 1 EEC and not more than your current balance.")
      return;
    }

    try {
      const signer = await provider.getSigner();
      const tx = await placeBet(signer, 'DiceGame', betAmount);
      if (!tx) {
        throw new Error('Transaction was not created. Please try again.');
      }

      const receipt = await tx.wait(); // Wait for the transaction to be mined

      if (receipt.status === 0) {
        alert('Transaction failed!');
        setMessage('Transaction failed!');
        return;
      }

      setIsRolling(true);
      setTimeout(() => {
        const userRolls = [rollDice(), rollDice()];
        const computerRolls = [rollDice(), rollDice()];

        const userTotal = userRolls.reduce((a, b) => a + b, 0);
        const computerTotal = computerRolls.reduce((a, b) => a + b, 0);

        setUserDice(userRolls);
        setComputerDice(computerRolls);
        setGamePlayed(true);
        setIsRolling(false);

        if ((userTotal > computerTotal) || (userTotal === 2 && computerTotal !== 2)) {
          const prizeAmount = bet * 2 * 100; // Adjust prize amount
          claimPrize(signer, bet * 2);
          getBalance(signer, userAddress).then(newBalance => {
            setBalance(newBalance);
            setMessage(`You win! Your total: ${userTotal}, Computer's total: ${computerTotal}. You won ${(prizeAmount / 100).toFixed(2)} EEC!`);
          });
        } else if ((userTotal < computerTotal) || (userTotal !== 2 && computerTotal === 2)) {
          setBalance(Number(balance) - (bet * 100)); // Adjust balance
          setMessage(`You lose! Your total: ${userTotal}, Computer's total: ${computerTotal}. You lost ${bet} EEC!`);
        } else {
          setMessage(`It's a draw! Your total: ${userTotal}, Computer's total: ${computerTotal}.`);
        }
      }, 1000);
    } catch (error) {
      if (error.code === 4001) { // User rejected the transaction
        alert('Transaction rejected by the user.');
      } else {
        console.error('Failed to place bet:', error);
        alert('Failed to place bet: ' + error.message);
      }
      setMessage('Failed to place bet: ' + error.message);
    }
  };

  const handleBetChange = (e) => {
    let value = e.target.value;
    value = value.replace(/^0+(?!$)/, '');
    setBetAmount(value);
  };

  const replayGame = () => {
    setUserDice([0, 0]);
    setComputerDice([0, 0]);
    setBetAmount(0);
    setMessage('');
    setGamePlayed(false);
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="dice-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Dice Game</h1>
      <p>Roll the dice and try to win!</p>
      <p>Your balance: {(Number(balance) / 100).toFixed(2)} EEC</p>
      <div className="bet-container">
        <label>
          Bet amount: EEC
          <input type="number" value={betAmount} onChange={handleBetChange} disabled={gamePlayed || isRolling} />
        </label>
        <button onClick={playGame} className="play-button" disabled={gamePlayed || isRolling || betAmount <= 0}>
          Play
        </button>
      </div>
      <div className="dice-results">
        <div className={`dice ${isRolling ? 'rolling' : ''}`}>
          <div className="user-dice">
            <h3>Your Dice</h3>
            <div className="dice-face">{userDice[0]}</div>
            <div className="dice-face">{userDice[1]}</div>
          </div>
          <div className="computer-dice">
            <h3>Computer's Dice</h3>
            <div className="dice-face">{computerDice[0]}</div>
            <div className="dice-face">{computerDice[1]}</div>
          </div>
        </div>
        {gamePlayed && (
          <p className="message">{message}</p>
        )}
      </div>
      {gamePlayed && (
        <button onClick={replayGame} className="replay-button">Replay</button>
      )}
    </div>
  );
};

export default Dice;