import React, { useState, useEffect } from 'react';
import '../styles/Lottery.css';
import { useNavigate } from 'react-router-dom';
import { useBalance } from '../contexts/BalanceContext'; // Adjust the path as necessary
import { placeBet, drawResult, claimPrize, getBalance } from '../utils/EthersUtils'; // Adjust the path as necessary

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

export const Lottery = ({}) => {
  const [userAddress, setUserAddress] = useState('');
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [lotteryResult, setLotteryResult] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [hasActiveTicket, setHasActiveTicket] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { balance, setBalance } = useBalance();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentMetaMaskAddress().then(address => {
      setUserAddress(address);
    });
  }, []);

  useEffect(() => {
    try {
      const savedTicket = localStorage.getItem('lotteryTicket');
      const savedResults = localStorage.getItem('lastLotteryResult');
      if (savedTicket) {
        setSelectedNumbers(JSON.parse(savedTicket));
        setHasActiveTicket(true);
      }
      if (savedResults) {
        setLotteryResult(JSON.parse(savedResults));
        setShowResults(true);
      }
    } catch (error) {
      console.error('Failed to parse saved data:', error);
    }
  }, []);

  useEffect(() => {
    const savedLastResults = localStorage.getItem('lastLotteryResult');
    try {
      if (savedLastResults) {
        setLastResults(JSON.parse(savedLastResults));
      }
    } catch (error) {
      console.error('Failed to parse last lottery results:', error);
    }
  }, []);

  useEffect(() => {
    if (showResults && lotteryResult.length > 0) {
      checkWinner(lotteryResult, userAddress);
    }
  }, [lotteryResult, showResults]);

  const buyTicket = async () => {
    if (hasActiveTicket) {
      setMessage('You have already bought a ticket!');
      return;
    }

    if (betAmount < 1 || betAmount > balance) {
      setMessage('Invalid bet amount!');
      return;
    }

    try {
      const signer = await provider.getSigner(); // Get the signer
      await placeBet(signer, 'LotteryGame', betAmount); // Pass the signer instead of userAddress
      const newBalance = balance - betAmount;
      setBalance(newBalance);
      setTicket(Array.from({ length: 49 }, (_, i) => i + 1)); // Set the ticket only if placeBet succeeds
      setMessage('Ticket bought successfully!');
    } catch (error) {
      setMessage('Failed to place bet: ' + error.message);
      setTicket([]); // Ensure ticket is empty if the bet fails
    }
  };

  const performDraw = () => {
    const randomNumbers = [];
    while (randomNumbers.length < 6) {
      const randNum = Math.floor(Math.random() * 49) + 1;
      if (!randomNumbers.includes(randNum)) {
        randomNumbers.push(randNum);
      }
    }
    const results = randomNumbers;
    setLotteryResult(results);
    localStorage.setItem('lastLotteryResult', JSON.stringify(results));
    return results;
  };

  const checkWinner = async (results, userAddress) => {
    const matches = selectedNumbers.filter((num) => results.includes(num));
    let multiplier = 0;
    let message = 'Try your luck!';
    if (matches.length > 0) {
      message = `No prize this time, try again!`;
    }

    switch (matches.length) {
      case 6:
        multiplier = 10;
        message = `Congratulations ${userAddress}, you won the jackpot! 10 x ${betAmount} = ${10 * betAmount}`;
        break;
      case 5:
        multiplier = 3;
        message = `Congratulations ${userAddress}, you won the second prize! 3 x ${betAmount} = ${3 * betAmount}`;
        break;
      case 4:
        multiplier = 2;
        message = `Congratulations ${userAddress}, you won the third prize! 2 x ${betAmount} = ${2 * betAmount}`;
        break;
      case 3:
        multiplier = 1;
        message = `Congratulations ${userAddress}, you won the bid back! 1 x ${betAmount} = ${betAmount}`;
        break;
      default:
        multiplier = 0;
    }

    const newBalance = balance + betAmount * multiplier;
    setMessage(message);
    if (multiplier > 0) {
      try {
        const signer = await provider.getSigner();
        await claimPrize(signer, betAmount * multiplier);
        const updatedBalance = await getBalance(signer, userAddress);
        setBalance(updatedBalance);
        setMessage('Congratulations! Prize claimed successfully.');
      } catch (error) {
        console.error('Error claiming prize:', error);
        setMessage('Failed to claim prize.');
      }
    } else {
      setBalance(newBalance);
    }
  };

  const selectNumber = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const submitTicket = () => {
    if (selectedNumbers.length !== 6) {
      setMessage('You must select exactly 6 numbers!');
      return;
    }

    // Save the ticket and perform the draw
    localStorage.setItem('lotteryTicket', JSON.stringify(selectedNumbers));
    setHasActiveTicket(true);

    const results = performDraw();
    setLotteryResult(results);
    // Show the results
    setShowResults(true);
  };

  const handleBetChange = (e) => {
    let value = e.target.value;
    value = value.replace(/^0+(?!$)/, '');
    setBetAmount(value);
  };

  const playAgain = () => {
    setWinner(null);
    setMessage('');
    setTicket([]);
    setSelectedNumbers([]);
    setLotteryResult([]);
    setShowResults(false);
    setHasActiveTicket(false);
    setBetAmount('');
    localStorage.removeItem('lotteryTicket');
  };

  const resetGame = () => {
    localStorage.removeItem('lotteryTicket');
    // localStorage.removeItem('lastLotteryResult');
    setWinner(null);
    setMessage('');
    setTicket([]);
    setSelectedNumbers([]);
    setLotteryResult([]);
    setLastResults([]);
    setHasActiveTicket(false);
    setBetAmount('');
    setShowResults(false);
  };

  const goBack = () => {
    resetGame();
    navigate('/home');
  };

  return (
    <div className="lottery-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Lottery Game</h1>
      <p>Buy a ticket and stand a chance to win!</p>
      <p>Your balance: {(Number(balance) / 100).toFixed(2)} EEC</p>
      <div className="bet-container">
        <label>
          Bet amount: EEC
          <input type="number" value={betAmount} onChange={handleBetChange} disabled={hasActiveTicket || showResults} placeholder="Enter amount to bet" />
        </label>
        {!hasActiveTicket && !showResults && (
          <button onClick={buyTicket} className="buy-ticket-button">Buy Ticket</button>
        )}
      </div>
      {!hasActiveTicket && ticket.length > 0 && (
        <div className="ticket">
          <h2>Your Ticket</h2>
          <div className="ticket-container">
            <div className="numbers">
              {ticket.map((number) => (
                <button
                  key={number}
                  className={`number ${selectedNumbers.includes(number) ? 'selected' : ''}`}
                  onClick={() => selectNumber(number)}
                  disabled={selectedNumbers.length === 6 && !selectedNumbers.includes(number)}
                >
                  {number}
                </button>
              ))}
            </div>
            <button onClick={submitTicket} className="submit-ticket-button" disabled={selectedNumbers.length !== 6}>
              Submit Ticket
            </button>
          </div>
        </div>
      )}
      {showResults && (
        <div className="results">
          <div className="selected-numbers">
            <h3>Your Numbers</h3>
            <p>{selectedNumbers.join(', ')}</p>
          </div>
          <div className="lottery-result">
            <h3>Lottery Results</h3>
            <p>{lotteryResult.join(', ')}</p>
          </div>
          <p className="message">{message}</p>
          <button onClick={playAgain} className="play-again-button">Play Again</button>
        </div>
      )}
      <button onClick={resetGame} className="reset-button">Reset Game</button>
    </div>
  );
};

export default Lottery;
