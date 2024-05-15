import React, { useState } from 'react';
import '../styles/Dice.css';
import { useNavigate } from 'react-router-dom';

export const Dice = ({ userAddress, initialBalance }) => {
  const [userDice, setUserDice] = useState([0, 0]);
  const [computerDice, setComputerDice] = useState([0, 0]);
  const [userBalance, setUserBalance] = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [gamePlayed, setGamePlayed] = useState(false);
  const navigate = useNavigate();

  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const playGame = () => {
    if (betAmount < 1 || betAmount > userBalance) {
      setMessage('Invalid bet amount!');
      return;
    }

    const userRolls = [rollDice(), rollDice()];
    const computerRolls = [rollDice(), rollDice()];

    const userTotal = userRolls.reduce((a, b) => a + b, 0);
    const computerTotal = computerRolls.reduce((a, b) => a + b, 0);

    setUserDice(userRolls);
    setComputerDice(computerRolls);
    setGamePlayed(true);

    if (userTotal > computerTotal) {
      setUserBalance(userBalance + betAmount);
      setMessage(`You win! Your total: ${userTotal}, Computer's total: ${computerTotal}. You won ${betAmount}!`);
    } else if (userTotal < computerTotal) {
      setUserBalance(userBalance - betAmount);
      setMessage(`You lose! Your total: ${userTotal}, Computer's total: ${computerTotal}. You lost ${betAmount}!`);
    } else {
      setMessage(`It's a draw! Your total: ${userTotal}, Computer's total: ${computerTotal}.`);
    }
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
  };

  return (
    <div className="dice-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Dice Game</h1>
      <p>Roll the dice and try to win!</p>
      <p>Your balance: ${userBalance}</p>
      <div className="bet-container">
        <label>
          Bet amount: $
          <input type="number" value={betAmount} onChange={handleBetChange} disabled={gamePlayed} />
        </label>
        <button onClick={playGame} className="play-button" disabled={gamePlayed || betAmount <= 0}>
          Play
        </button>
      </div>
      {gamePlayed && (
        <div className="results">
          <div className="dice-results">
            <div className="user-dice">
              <h3>Your Dice</h3>
              <p>{userDice[0]} and {userDice[1]}</p>
            </div>
            <div className="computer-dice">
              <h3>Computer's Dice</h3>
              <p>{computerDice[0]} and {computerDice[1]}</p>
            </div>
          </div>
          <p className="message">{message}</p>
          <button onClick={replayGame} className="replay-button">Replay</button>
        </div>
      )}
    </div>
  );
};

export default Dice;
