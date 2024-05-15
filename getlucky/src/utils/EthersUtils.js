const {ethers} = require('ethers');

const provider = new ethers.BrowserProvider(window.ethereum);

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

