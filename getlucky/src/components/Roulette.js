import React, { useState, useEffect } from "react";
import "../styles/Roulette.css";
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

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const colors = [
  "green", "red", "black", "red", "black", "red", "black", "red", "black",
  "red", "black", "red", "black", "red", "black", "red", "black", "red",
  "black", "red", "black", "red", "black", "red", "black", "red", "black",
  "red", "black", "red", "black", "red", "black", "red", "black", "red", "black"
];

export const Roulette = ({}) => {
  const [userAddress, setUserAddress] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [winningNumber, setWinningNumber] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const { balance, setBalance } = useBalance();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentMetaMaskAddress().then(address => {
      setUserAddress(address);
    });
  }, []);

  const handleNumberClick = (number) => {
    if (!isSpinning && !hasPlayed) {
      setSelectedNumbers([number]);
    }
  };

  const handleCategoryClick = (numbers) => {
    if (!isSpinning && !hasPlayed) {
      setSelectedNumbers(numbers);
    }
  };

  const spinWheel = async () => {
    if (selectedNumbers.length === 0) {
      alert("Please select a number or category before spinning.");
      return;
    }
    const bet = Number(betAmount);

    console.log("Balance: ", Number(balance) / 100)
    console.log("Bet: ", bet)

    if (bet < 1 || bet > Number(balance) / 100) {
      alert("Invalid bet amount! Bet must be at least 1 EEC and not more than your current balance.")
      return;
    }

    if (!isSpinning) {
      try {
        const signer = await provider.getSigner();
        const tx = await placeBet(signer, 'RouletteGame', betAmount);
        if (!tx) {
          throw new Error('Transaction was not created. Please try again.');
        }

        const receipt = await tx.wait(); // Wait for the transaction to be mined

        if (receipt.status === 0) {
          alert('Transaction failed!');
          setMessage('Transaction failed!');
          return;
        }

        setIsSpinning(true);
        const randomIndex = Math.floor(Math.random() * numbers.length);
        const chosenNumber = numbers[randomIndex];
        setTimeout(async () => {
          setWinningNumber(chosenNumber);
          setIsSpinning(false);
          setHasPlayed(true);

          let multiplier = 0;
          if (selectedNumbers.includes(chosenNumber)) {
            if (selectedNumbers.length === 1) {
              if (chosenNumber === 0) {
                multiplier = 50; // Special case for 0
              } else {
                multiplier = 10; // Single number
              }
            } else if (selectedNumbers.length === 12) {
              multiplier = 3; // Full line or 1-12, 13-24, 25-36
            } else if (selectedNumbers.length === 18) {
              multiplier = 2; // Even, Odd, Red, Black, 1-18, 19-36
            } else if (selectedNumbers.length <= 12) {
              multiplier = 3; // 1-12, 13-24, 25-36
            }
          }

          if (multiplier > 0) {
            const winnings = bet * multiplier * 100; // Ajustăm balanța în funcție de unități
            try {
              await claimPrize(signer, bet * multiplier);
              const updatedBalance = await getBalance(signer, userAddress);
              setBalance(updatedBalance);
              setMessage(`Congratulations! You won ${(winnings / 100).toFixed(2)} EEC!`);
            } catch (error) {
              console.error('Error claiming prize:', error);
              setMessage('Failed to claim prize.');
            }
          } else {
            setBalance(Number(balance) - (bet * 100)); // Ajustăm balanța în funcție de unități
            setMessage('Sorry, try again!');
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
    }
  };

  const playAgain = () => {
    setWinningNumber(null);
    setSelectedNumbers([]);
    setHasPlayed(false);
    setMessage('');
    setBetAmount(0);
  };

  const handleBetChange = (e) => {
    let value = e.target.value;
    value = value.replace(/^0+(?!$)/, '');
    setBetAmount(value);
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="roulette-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1 className="roulette-title">Roulette Game</h1>
      <p>Select a number on the table and spin the wheel!</p>
      <p>Your balance: {(Number(balance) / 100).toFixed(2)} EEC</p>
      <div className="bet-container">
        <label>
          Bet amount: EEC
          <input type="number" value={betAmount} onChange={handleBetChange} disabled={isSpinning || hasPlayed} />
        </label>
      </div>
      <div className="betting-table">
        <div className="row">
          <div className="numbers-table green" onClick={() => handleNumberClick(0)} style={{ backgroundColor: selectedNumbers.includes(0) ? "gold" : "green" }}>0</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(3)} style={{ backgroundColor: selectedNumbers.includes(3) ? "gold" : "red" }}>3</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(6)} style={{ backgroundColor: selectedNumbers.includes(6) ? "gold" : "black" }}>6</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(9)} style={{ backgroundColor: selectedNumbers.includes(9) ? "gold" : "red" }}>9</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(12)} style={{ backgroundColor: selectedNumbers.includes(12) ? "gold" : "red" }}>12</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(15)} style={{ backgroundColor: selectedNumbers.includes(15) ? "gold" : "black" }}>15</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(18)} style={{ backgroundColor: selectedNumbers.includes(18) ? "gold" : "red" }}>18</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(21)} style={{ backgroundColor: selectedNumbers.includes(21) ? "gold" : "red" }}>21</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(24)} style={{ backgroundColor: selectedNumbers.includes(24) ? "gold" : "black" }}>24</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(27)} style={{ backgroundColor: selectedNumbers.includes(27) ? "gold" : "red" }}>27</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(30)} style={{ backgroundColor: selectedNumbers.includes(30) ? "gold" : "red" }}>30</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(33)} style={{ backgroundColor: selectedNumbers.includes(33) ? "gold" : "black" }}>33</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(36)} style={{ backgroundColor: selectedNumbers.includes(36) ? "gold" : "red" }}>36</div>
          <div className="betting-category" onClick={() => handleCategoryClick([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36])}>Line 1</div>
        </div>
        <div className="row">
          <div className="numbers-table black" onClick={() => handleNumberClick(2)} style={{ backgroundColor: selectedNumbers.includes(2) ? "gold" : "black" }}>2</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(5)} style={{ backgroundColor: selectedNumbers.includes(5) ? "gold" : "red" }}>5</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(8)} style={{ backgroundColor: selectedNumbers.includes(8) ? "gold" : "black" }}>8</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(11)} style={{ backgroundColor: selectedNumbers.includes(11) ? "gold" : "black" }}>11</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(14)} style={{ backgroundColor: selectedNumbers.includes(14) ? "gold" : "red" }}>14</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(17)} style={{ backgroundColor: selectedNumbers.includes(17) ? "gold" : "black" }}>17</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(20)} style={{ backgroundColor: selectedNumbers.includes(20) ? "gold" : "black" }}>20</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(23)} style={{ backgroundColor: selectedNumbers.includes(23) ? "gold" : "red" }}>23</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(26)} style={{ backgroundColor: selectedNumbers.includes(26) ? "gold" : "black" }}>26</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(29)} style={{ backgroundColor: selectedNumbers.includes(29) ? "gold" : "black" }}>29</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(32)} style={{ backgroundColor: selectedNumbers.includes(32) ? "gold" : "red" }}>32</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(35)} style={{ backgroundColor: selectedNumbers.includes(35) ? "gold" : "black" }}>35</div>
          <div className="betting-category" onClick={() => handleCategoryClick([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35])} >Line 2</div>
        </div>
        <div className="row">
          <div className="numbers-table red" onClick={() => handleNumberClick(1)} style={{ backgroundColor: selectedNumbers.includes(1) ? "gold" : "red" }}>1</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(4)} style={{ backgroundColor: selectedNumbers.includes(4) ? "gold" : "black" }}>4</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(7)} style={{ backgroundColor: selectedNumbers.includes(7) ? "gold" : "red" }}>7</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(10)} style={{ backgroundColor: selectedNumbers.includes(10) ? "gold" : "black" }}>10</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(13)} style={{ backgroundColor: selectedNumbers.includes(13) ? "gold" : "black" }}>13</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(16)} style={{ backgroundColor: selectedNumbers.includes(16) ? "gold" : "red" }}>16</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(19)} style={{ backgroundColor: selectedNumbers.includes(19) ? "gold" : "red" }}>19</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(22)} style={{ backgroundColor: selectedNumbers.includes(22) ? "gold" : "black" }}>22</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(25)} style={{ backgroundColor: selectedNumbers.includes(25) ? "gold" : "red" }}>25</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(28)} style={{ backgroundColor: selectedNumbers.includes(28) ? "gold" : "black" }}>28</div>
          <div className="numbers-table black" onClick={() => handleNumberClick(31)} style={{ backgroundColor: selectedNumbers.includes(31) ? "gold" : "black" }}>31</div>
          <div className="numbers-table red" onClick={() => handleNumberClick(34)} style={{ backgroundColor: selectedNumbers.includes(34) ? "gold" : "red" }}>34</div>
          <div className="betting-category" onClick={() => handleCategoryClick([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34])} >Line 3</div>
        </div>
        <div className="row categories">
          <div className="betting-category" onClick={() => handleCategoryClick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])}>1-12</div>
          <div className="betting-category" onClick={() => handleCategoryClick([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])}>13-24</div>
          <div className="betting-category" onClick={() => handleCategoryClick([25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36])}>25-36</div>
          <div className="betting-category" onClick={() => handleCategoryClick([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])}>Red</div>
          <div className="betting-category" onClick={() => handleCategoryClick([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35])}>Black</div>
          <div className="betting-category" onClick={() => handleCategoryClick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])}>1-18</div>
          <div className="betting-category" onClick={() => handleCategoryClick([19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36])}>19-36</div>
          <div className="betting-category" onClick={() => handleCategoryClick([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36])}>Even</div>
          <div className="betting-category" onClick={() => handleCategoryClick([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35])}>Odd</div>
        </div>
      </div>

      <div className="spin-button-container">
        <button className="spin-button" onClick={spinWheel} disabled={isSpinning}>Spin the Wheel</button>
        {winningNumber !== null && (
          <div className="result-display">
            Winning Number: {winningNumber}
            <p className="message">{message}</p>
            <button className="play-again-button" onClick={playAgain}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roulette;