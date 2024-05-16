// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EliEllaCoin is ERC20, ERC20Pausable, Ownable {
    event TokensMinted(address indexed to, uint256 amount);
    event TokensPaused();
    event TokensUnpaused();

    constructor(address initialOwner)
        ERC20("EliEllaCoin", "EEC")
        Ownable(initialOwner)
    {
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    function pause() public onlyOwner {
        _pause();
        emit TokensPaused();
    }

    function unpause() public onlyOwner {
        _unpause();
        emit TokensUnpaused();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}