const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Elevator", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Elevator", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        const attacker = await (await ethers.getContractFactory("ElevatorAttack")).deploy();
        await attacker.attack(instance.address);
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});