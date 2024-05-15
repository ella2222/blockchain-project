import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useWallet } from '../utils/Context';
import { connectWallet } from '../utils/EthersUtils';

export const Login = ({onLogin}) => {
    const [isLogged, setIsLogged] = useState(false);

    const {wallet, initializeWallet} = useWallet();

    const navigate = useNavigate();

    const accountChangedHandler = (newAccount) => {
        initializeWallet(newAccount);
    };

    const [error, setError] = useState('');

    const connectWalletHandler = async () => {
        try {
            console.log("Attempting to connect wallet...");
            await connectWallet(accountChangedHandler);
            console.log("Wallet connected successfully.");
        } catch (error) {
            console.error("Failed to connect to MetaMask:", error);
            setError("Failed to connect to MetaMask: " + error.message);
        }
    };

    useEffect(() => {
        if(wallet){
            setIsLogged(true);
            navigate('/home');
        }
    }, [wallet, navigate]);

    return (
        <div className="login-container">
        <div className="login-box">
            <div className="logo-container">
            <img src="/logo_bc.png" alt="Logo" className="logo" />
            </div>
            <h1 className="login-title">Get Lucky</h1>
            <p className="motto">Experience the thrill of winning!</p>
            <button onClick={connectWalletHandler} className="login-button">
            Connect with MetaMask
            </button>
        </div>
      <footer className="footer">
        <p>Created by Ella & Elias</p>
        <p>Contact: ella-ana.chiriac@s.unibuc.ro</p>
        <p>Contact: elias-valeriu.stoica@s.unibuc.ro</p>
      </footer>
    </div>
    );
};

export default Login;
