import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import { useWallet } from '../utils/Context';
import { useBalance } from '../contexts/BalanceContext'; // Adjust the path as necessary

export const Home = ({ userAddress }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogged, setIsLogged] = useState(true);
  const { balance, setBalance } = useBalance();
  const navigate = useNavigate();

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const {wallet, initializeWallet} = useWallet();

  const handleLogout = (e) => {
    e.preventDefault();
    setIsLogged(false);
    initializeWallet(false);
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  }

  const [timeLeft, setTimeLeft] = useState(0);
  const [lastResults, setLastResults] = useState([]);

  useEffect(() => {
    const savedLastResults = localStorage.getItem('lastLotteryResult');
    if (savedLastResults) {
      try {
        setLastResults(JSON.parse(savedLastResults));
      } catch (error) {
        console.error('Failed to parse lottery results from localStorage:', error);
      }
    }
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo-container-home">
          <img src="logo_bc.png" alt="Logo" className="logo-home" />
          <h1 className="home-title">Get Lucky</h1>
        </div>
        <div className="user-profile">
          <button onClick={toggleProfileMenu} className="profile-button">
            <img src="profile2.png" alt="Profile" className="profile-icon" />
          </button>
        </div>
      </header>
      <div className="ticker-container">
        <div className="ticker-wrap">
          <div className="ticker-move">
            <div className="ticker-item">🎉 Last winning numbers: {lastResults.join(', ')}</div>
            <div className="ticker-item">🎟️ Buy your ticket now and win big!</div>
            <div className="ticker-item">🍀 Try your luck at the lottery!</div>
            <div className="ticker-item">🎡 Spin the wheel and win big!</div>
            <div className="ticker-item">🎲 Roll the dices to see what the future holds!</div>
            <div className="ticker-item">💰 Your current balance: {(Number(balance) / 100).toFixed(2)} EEC</div>
          </div>
        </div>
      </div>
      <div className={`profile-menu ${showProfileMenu ? 'open' : ''}`}>
        <button onClick={toggleProfileMenu} className="close-button">&times;</button>
        <p>{userAddress}</p>
        <button onClick={handleProfile}>Profile settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="games-container">
        <div className="game-card" onClick={() => navigate('/lottery')}>
          <img src="lottery.png" alt="Lottery" className="game-thumbnail" />
          <h2 className="game-title">Lottery</h2>
        </div>
        <div className="game-card" onClick={() => navigate('/roulette')}>
          <img src="roulette.png" alt="Roulette" className="game-thumbnail" />
          <h2 className="game-title">Roulette</h2>
        </div>
        <div className="game-card" onClick={() => navigate('/dice')}>
          <img src="dice.png" alt="Dice" className="game-thumbnail" />
          <h2 className="game-title">Dice</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;