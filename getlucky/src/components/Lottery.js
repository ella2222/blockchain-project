import React, { useState, useEffect } from 'react';
import '../styles/Lottery.css';
import { useNavigate } from 'react-router-dom';

export const Lottery = ({ userAddress, initialBalance }) => {
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [lotteryResult, setLotteryResult] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [hasActiveTicket, setHasActiveTicket] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [userBalance, setUserBalance] = useState(initialBalance);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const savedLastResults = localStorage.getItem('lastLotteryResult');
    if (savedLastResults) {
      setLastResults(JSON.parse(savedLastResults));
    }
  }, []);

  useEffect(() => {
    if (showResults && lotteryResult.length > 0) {
      const isWinner = checkWinner(lotteryResult);
      setWinner(isWinner);
      setMessage(isWinner.message);
      setUserBalance(isWinner.newBalance);
    }
  }, [lotteryResult]);

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

  const checkWinner = (results) => {
    const matches = selectedNumbers.filter((num) => results.includes(num));
    let multiplier = 0;
    let message = 'No prize this time, try again!';

    switch (matches.length) {
      case 6:
        multiplier = 10;
        message = `Congratulations ${userAddress}, you won the jackpot!`;
        break;
      case 5:
        multiplier = 3;
        message = `Congratulations ${userAddress}, you won the second prize!`;
        break;
      case 4:
        multiplier = 2;
        message = `Congratulations ${userAddress}, you won the third prize!`;
        break;
      default:
        multiplier = -1;
    }

    const newBalance = userBalance + betAmount * multiplier;
    return { message, newBalance };
  };

  const buyTicket = () => {
    if (hasActiveTicket) {
      setMessage('You have already bought a ticket!');
      return;
    }

    setTicket(Array.from({ length: 49 }, (_, i) => i + 1));
    setMessage('Ticket bought successfully!');
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

    if (betAmount < 1|| betAmount > userBalance) {
      setMessage('Invalid bet amount!');
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
    setBetAmount(Number(e.target.value));
  };

  const playAgain = () => {
    setWinner(null);
    setMessage('');
    setTicket([]);
    setSelectedNumbers([]);
    setLotteryResult([]);
    setShowResults(false);
    setHasActiveTicket(false);
    setBetAmount(0);
    localStorage.removeItem('lotteryTicket');
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="lottery-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Lottery Game</h1>
      <p>Buy a ticket and stand a chance to win!</p>
      <p>Your balance: ${userBalance}</p>
      <div className="bet-container">
        <label>
          Bet amount: $
          <input type="number" value={betAmount} onChange={handleBetChange} disabled={hasActiveTicket || showResults} />
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
    </div>
  );
};

export default Lottery;
