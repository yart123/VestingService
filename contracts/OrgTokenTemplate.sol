// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrgTokenTemplate is ERC20, Ownable, ERC20Burnable {

    uint8 private tokenDecimals;

    constructor(string memory name, string memory ticker, uint8 _decimals) ERC20(name, ticker) {
        tokenDecimals = _decimals;
    }

    function decimals() public override view returns (uint8) {
        return tokenDecimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
