// BalanceContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBalance } from '../utils/EthersUtils';
import { useWallet } from '../utils/Context';
const { ethers } = require('ethers');

const BalanceContext = createContext();

export const useBalance = () => {
  return useContext(BalanceContext);
};

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [userAddress, setUserAddress] = useState('');
  const { wallet } = useWallet();
  const provider = new ethers.BrowserProvider(window.ethereum);

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet && userAddress) {
        try {
          const signer = await provider.getSigner();
          const balance = await getBalance(signer, userAddress);
          setBalance(Number(balance));
          // console.log("Balance: ", balance)
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      }
    };

    if (wallet) {
      provider.send("eth_requestAccounts", []).then(async () => {
        const account = await provider.getSigner();
        setUserAddress(account.getAddress());
      });
    }

    fetchBalance();
  }, [wallet, userAddress]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
