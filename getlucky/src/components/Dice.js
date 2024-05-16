import React, { useState } from 'react';
import '../styles/Dice.css';
import { useNavigate } from 'react-router-dom';
import { useBalance } from '../contexts/BalanceContext'; // Adjust the path as necessary

export const Dice = ({ userAddress, initialBalance }) => {
  const [userDice, setUserDice] = useState([0, 0]);
  const [computerDice, setComputerDice] = useState([0, 0]);
  const { balance, setBalance } = useBalance();
  const [betAmount, setBetAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [gamePlayed, setGamePlayed] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const navigate = useNavigate();

  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const playGame = () => {
    if (betAmount <= 0 || betAmount > balance) {
      setMessage('Invalid bet amount!');
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

      if (userTotal > computerTotal) {
        setBalance(balance + betAmount);
        setMessage(`You win! Your total: ${userTotal}, Computer's total: ${computerTotal}. You won ${betAmount}!`);
      } else if (userTotal < computerTotal) {
        setBalance(balance - betAmount);
        setMessage(`You lose! Your total: ${userTotal}, Computer's total: ${computerTotal}. You lost ${betAmount}!`);
      } else {
        setMessage(`It's a draw! Your total: ${userTotal}, Computer's total: ${computerTotal}.`);
      }
    }, 1000);
  };

  const handleBetChange = (e) => {
    setBetAmount(Number(e.target.value));
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
  }

  return (
    <div className="dice-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Dice Game</h1>
      <p>Roll the dice and try to win!</p>
      <p>Your balance: {(Number(balance) / 100).toFixed(2)} EEC</p>
      <div className="bet-container">
        <label>
          Bet amount: $
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
