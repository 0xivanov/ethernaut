const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Denial", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Denial", player.address, ethers.utils.parseEther("0.001"));
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Another tricky level that took me quite a while

        // The external call to the `partner` address seems as a vulnerable part here,
        // but how could it revert if the contract doesn't check for the return value of the txn.

        // Hmmm...

        // Although we can't revert the txn, we can implement an attacker contract (which will be the `partner`)
        // which spends all gas and makes it impossible to continue the execution of the txn

        // That's it!

        await (await ethers.getContractFactory("DenialAttack")).deploy(instance.address);

        // Very interesting DoS attack!
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});