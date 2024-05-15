import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import { useWallet } from '../utils/Context';

export const Home = ({ userAddress }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogged, setIsLogged] = useState(true);
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
      <div className={`profile-menu ${showProfileMenu ? 'open' : ''}`}>
        <button onClick={toggleProfileMenu} className="close-button">&times;</button>
        <p>{userAddress}</p>
        <button onClick={() => alert('Profile settings')}>Profile settings</button>
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
