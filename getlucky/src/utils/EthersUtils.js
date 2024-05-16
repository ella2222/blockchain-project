import eliEllaCoinABI from '../abis/EliEllaCoinABI.json';
import casinoABI from '../abis/CasinoABI.json';

import Web3 from 'web3';

const {ethers} = require('ethers');

const provider = new ethers.BrowserProvider(window.ethereum);

const web3 = new Web3(window.ethereum);

export const connectWallet = async (accountChangedHandler) => {
    if (window.ethereum) {
        provider.send("eth_requestAccounts", []).then(async () => {
            provider.getSigner().then(async (account) => {
                console.log("Account:", account);
                accountChangedHandler(account);
            });
        }).catch(async () => { 
            console.log("err");
        });
    } else {
        console.log("err");
    }
};

const eliEllaCoinContractAddress = "0xA0F12bdB6EE4e9022274046b63caCACB99966F34"
const casinoContractAddress = "0xBAB1592980FF0c97803d8546250a3F94e3841BfC"

const getEliEllaCoinContract = (provider) => {
    return new ethers.Contract(eliEllaCoinContractAddress, eliEllaCoinABI, provider);
}

const getCasinoContract = (provider) => {
    return new ethers.Contract(casinoContractAddress, casinoABI, provider);
}

export const deposit = async (provider, amount) => {
    const eliEllaCoinContract = getEliEllaCoinContract(provider);
    const casinoContract = getCasinoContract(provider);
    try{
        console.log("Amount: ", amount);
        const convertedAmount = BigInt(amount * 100);
        console.log("Converted amount:", convertedAmount);
        const approveTx = await eliEllaCoinContract.approve(casinoContractAddress, convertedAmount * BigInt(10) ** BigInt(16));
        await approveTx.wait();
        const depositTx = await casinoContract.deposit(convertedAmount * BigInt(10) ** BigInt(16));
        await depositTx.wait();
        return depositTx;
    } catch (error) {
        console.error("Error depositing:", error);
    }
}

export const withdraw = async (provider, amount) => {
    const casinoContract = getCasinoContract(provider);
    try {
        const withdrawTx = await casinoContract.withdraw(amount);
        await withdrawTx.wait();
        return withdrawTx;
    } catch (error) {
        console.error("Error withdrawing:", error);
    }
}

export const getBalance = async (provider, address) => {
    const casinoContract = getCasinoContract(provider);
    const balance = await casinoContract.getUserBalance(address);
    return balance / BigInt(10) ** BigInt(16);
}