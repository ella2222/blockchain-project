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
const casinoContractAddress = "0x3F83d66B08a679FbA6348C9CA8D0095794023202"

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
    const eliEllaCoinContract = getEliEllaCoinContract(provider);
    const casinoContract = getCasinoContract(provider);
    try {
        console.log("Amount: ", amount);
        const convertedAmount = BigInt(amount * 100);
        console.log("Converted amount:", convertedAmount);
        const withdrawTx = await casinoContract.withdraw(convertedAmount * BigInt(10) ** BigInt(16));
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

export const placeBet = async (provider, game, amount) => {
    const casinoContract = getCasinoContract(provider);
    try {
        const convertedAmount = BigInt(amount * 100); // Assuming token has 2 decimal places
        const placeBetTx = await casinoContract.placeBet(game, convertedAmount * BigInt(10) ** BigInt(16));
        await placeBetTx.wait();
        return placeBetTx;
    } catch (error) {
        console.error("Error placing bet:", error);
    }
};

export const drawResult = async (provider, game, winningNumbers) => {
    const casinoContract = getCasinoContract(provider);
    try {
        const drawResultTx = await casinoContract.drawResult(game, winningNumbers);
        await drawResultTx.wait();
        return drawResultTx;
    } catch (error) {
        console.error("Error drawing result:", error);
    }
};

export const claimPrize = async (provider, prizeAmount) => {
    const casinoContract = getCasinoContract(provider);
    try {
        const convertedPrizeAmount = BigInt(prizeAmount * 100); // Assuming token has 2 decimal places
        const claimPrizeTx = await casinoContract.claimPrize(convertedPrizeAmount * BigInt(10) ** BigInt(16));
        await claimPrizeTx.wait();
        return claimPrizeTx;
    } catch (error) {
        console.error("Error claiming prize:", error);
    }
};