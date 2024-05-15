import React, { useState, useEffect } from 'react';
import '../styles/Lottery.css';

export const Lottery = ({ userAddress }) => {
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [lotteryResult, setLotteryResult] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastResults, setLastResults] = useState([]);
  const [hasActiveTicket, setHasActiveTicket] = useState(false);

  const LOTTERY_INTERVAL = 3600; 
  useEffect(() => {
    const savedTicket = localStorage.getItem('lotteryTicket');
    if (savedTicket) {
      setSelectedNumbers(JSON.parse(savedTicket));
      setHasActiveTicket(true);
    }

    const now = Math.floor(Date.now() / 1000);
    const nextDrawTime = Math.ceil(now / LOTTERY_INTERVAL) * LOTTERY_INTERVAL;
    setTimeLeft(nextDrawTime - now);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          performDraw();
          return LOTTERY_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const performDraw = () => {
    const results = Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1);
    setLastResults(results);
    setLotteryResult(results);
    if (hasActiveTicket) {
      setWinner(checkWinner(results));
    }
    setPlayers([]);
    setSelectedNumbers([]);
    localStorage.setItem('lastLotteryResult', JSON.stringify(results));
    localStorage.removeItem('lotteryTicket');
    setHasActiveTicket(false); 
    setMessage('A new round has started, you can buy a new ticket now!');
  };

  const checkWinner = (results) => {
    const matches = selectedNumbers.filter((num) => results.includes(num));
    if (matches.length === 6) {
      return `Congratulations ${userAddress}, you won the jackpot!`;
    } else if (matches.length === 5) {
      return `Congratulations ${userAddress}, you won the second prize!`;
    } else if (matches.length === 4) {
      return `Congratulations ${userAddress}, you won the third prize!`;
    } else {
      return 'No prize this time, try again!';
    }
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

    localStorage.setItem('lotteryTicket', JSON.stringify(selectedNumbers));
    setHasActiveTicket(true);
    setMessage('Ticket submitted successfully!');
  };

  useEffect(() => {
    const savedLastResults = localStorage.getItem('lastLotteryResult');
    if (savedLastResults) {
      setLastResults(JSON.parse(savedLastResults));
    }
  }, []);

  return (
    <div className="lottery-container">
      <h1>Lottery Game</h1>
      <div className="time-left">
        <h3>Time Left for Next Draw</h3>
        <p>{Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}</p>
      </div>
      <p>Buy a ticket and stand a chance to win!</p>
      {!ticket.length && !hasActiveTicket ? (
        <button onClick={buyTicket} className="buy-ticket-button">Buy Ticket</button>
      ) : !hasActiveTicket ? (
        <div className="ticket">
          <h2>Your Ticket</h2>
          <div className="ticket-container">
            <div className="numbers">
              {ticket.map((number) => (
                <button
                  key={number}
                  className={`number ${selectedNumbers.includes(number) ? 'selected' : ''}`}
                  onClick={() => selectNumber(number)}
                  disabled={selectedNumbers.length === 6}
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
      ) : (
        <div className="selected-numbers">
          <h3>Your Numbers</h3>
          <p>{selectedNumbers.join(', ')}</p>
        </div>
      )}
      {message && <p className="message">{message}</p>}
      {winner && (
        <div className="winner-announcement">
          <h2>Winner</h2>
          <p>{winner}</p>
        </div>
      )}
      {lastResults.length > 0 && (
        <div className="last-results">
          <h2>Last Draw Results</h2>
          <p>{lastResults.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default Lottery;
