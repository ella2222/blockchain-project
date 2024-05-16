import eliEllaCoinABI from '../abis/EliEllaCoinABI.json';
import casinoABI from '../abis/CasinoABI.json';

//import Web3 from 'web3';

const {ethers} = require('ethers');

const provider = new ethers.BrowserProvider(window.ethereum);

//const web3 = new Web3(window.ethereum);

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

const eliEllaCoinContractAddress = "0xF5Fc3c509aA61f7D804b85Dc8f3dd33524de2347"
const casinoContractAddress = "0x278E43b9554277d59caB4e296C18F992Ebc78E68"

const getEliEllaCoinContract = (provider) => {
    return new ethers.Contract(eliEllaCoinContractAddress, eliEllaCoinABI, provider);
}

const getCasinoContract = (provider) => {
    return new ethers.Contract(casinoContractAddress, casinoABI, provider);
}

export const deposit = async (provider, amount) => {
    const eliEllaCoinContract = getEliEllaCoinContract(provider);
    const casinoContract = getCasinoContract(provider);
    try {
        const approveTx = await eliEllaCoinContract.approve(casinoContractAddress, amount);
        await approveTx.wait();
        const depositTx = await casinoContract.deposit(amount);
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
        const withdrawTx = await casinoContract.withdraw(amount);
        await withdrawTx.wait();
        return withdrawTx;
    } catch (error) {
        console.error("Error withdrawing:", error);
    }
}

export const getBalance = async (provider, address) => {
    const eliEllaCoinContract = getEliEllaCoinContract(provider);
    const casinoContract = getCasinoContract(provider);
    const balance = await casinoContract.getUserBalance(address);
    return balance;
}


