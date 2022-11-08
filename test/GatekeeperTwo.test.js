const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("GatekeeperTwo", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("GatekeeperTwo", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Again we bypass the first gate by executing the transaction through an attacker contract
        // The second gate is tricky. We should execute the attack through the contract's constructor
        // since there the smart contract's bytecode is still not deployed on the blockchain
        // Finally, we calculate the gateKey using the same operations as in the gatekeeper
        await (await ethers.getContractFactory("GatekeeperTwoAttack")).connect(player).deploy(instance.address, { gasLimit: "1000000" });
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});