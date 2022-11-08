const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Shop", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Shop", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // This one is similar to level 11 Elevator
        // The only difference is the `view` function modifier,
        // which means we should not rely on changing state in the attacker's contract,
        // but maybe in the instance's one
        const attacker = await (await ethers.getContractFactory("ShopAttack")).deploy(instance.address);
        await attacker.attack();
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});