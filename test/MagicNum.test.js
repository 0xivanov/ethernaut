const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("MagicNum", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("MagicNum", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        // That one was pretty fun
        const limit = 0x0a;

        // First we see that the magic number is 42 (from the commented lines)
        const magicNumber = 0x2a;

        // Then we should learn how to write a smart contract using only opcodes
        // https://medium.com/@blockchain101/solidity-bytecode-and-opcode-basics-672e9b1a88c2 <- from the author of this challenge

        // For the challenge I used help from here
        // https://medium.com/coinmonks/ethernaut-lvl-19-magicnumber-walkthrough-how-to-deploy-contracts-using-raw-assembly-opcodes-c50edb0f71a2

        const initialization = [];
        const runtime = [];

        // 1. Lets first write the runtime bytecode

        // We should do 2 things:
        //  - store the magic number in memory
        //  - return the magic number from memory

        runtime.push(...[0x60, magicNumber]);            // PUSH1 0x2a   | push 42 on stack -> the magic number
        runtime.push(...[0x60, 0x00]);                   // PUSH1 0x00   | push 0 on stack -> the value location in memory
        runtime.push(...[0x52]);                         // MSTORE       | store the magic number at the mentioned location into memory

        runtime.push(...[0x60, 0x20]);                   // PUSH1 0x20   | push 32 on stack -> the size of the magic number in bytes (256 bits = 32 bytes)
        runtime.push(...[0x60, 0x00]);                   // PUSH1 0x00   | push 0 on stack -> the value location in memory
        runtime.push(...[0xf3]);                         // RETURN       | return the magic number that is stored at the mentioned location in memory

        // Make sure our runtime bytecode size does not exceed the task limit of 10 bytes/opcodes
        expect(runtime).length.to.be.lessThanOrEqual(limit);

        // Now write the initialization bytecode

        // Again we should do 2 things:
        //  - copy the runtime bytecode into memory using CODECOPY (0x39)
        //  - return the in-memory runtime bytecode to the EVM

        initialization.push(...[0x60, runtime.length]);  // PUSH1 0x0a   | push 10 on stack -> the runtime bytecode size limit 
        initialization.push(...[0x60, 0xff]);            // PUSH1 0xff   | push 255 on stack -> 0xff will be replaced with the position of the runtime bytecode in the whole bytecode
        initialization.push(...[0x60, 0x00]);            // PUSH1 0x00   | push 0 on stack -> the destination position of the code where we will copy it to
        initialization.push(...[0x39]);                  // CODECOPY     | copy the runtime bytecode using the top 3 parameter that we've just pushed on stack

        initialization.push(...[0x60, runtime.length]);  // PUSH1 0x0a   | push 10 on stack -> the runtime bytecode size limit 
        initialization.push(...[0x60, 0x00]);            // PUSH1 0x00   | push 255 on stack -> the destination position of the code where we have copied it to
        initialization.push(...[0xf3]);                  // RETURN       | return the runtime bytecode copy to the EVM

        // Change the 0xff to the actual position of the runtime bytecode
        initialization[3] = initialization.length;

        // Аssemble the whole smart contract bytecode
        const bytecode = [...initialization, ...runtime];

        // 2. Now we have to send the transaction with the smart contracts bytecode
        const txn = await player.sendTransaction({
            data: bytecode
        });

        const solverAddress = (await txn.wait()).contractAddress;

        // 3. Lastly, call `setSolver` passing the newly created contract's address
        await instance.setSolver(solverAddress);

    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});