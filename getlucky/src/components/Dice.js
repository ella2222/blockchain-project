import React from 'react';
import { useState } from 'react';

export const Dice = () => {
    const [diceValue, setDiceValue] = useState(1);
    const [bet, setBet] = useState(0);
    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [message, setMessage] = useState('');


    return (
        <div>
            <h1>Dice Game</h1>
        </div>
    );
};


