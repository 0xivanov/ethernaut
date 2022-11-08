// SPDX-License-Identifier: MIT

pragma solidity <0.7.0;

contract Kaboom {
    function attack() public {
        selfdestruct(payable(0));
    }
}
