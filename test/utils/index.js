const { ethers } = require("hardhat");

async function setupLevel(level, player, value) {
    const factory = await (await ethers.getContractFactory(level.concat("Factory"))).deploy();
    const instanceAddr = await factory.callStatic.createInstance(player, { value });
    await factory.createInstance(player, { value });
    const instance = (await ethers.getContractFactory(level)).attach(instanceAddr);

    return {
        factory,
        instance
    };
}

function abiEncodeWithSignature(signature, ...params) { // similar to abi.encodeWithSignature in Solidity
    const functionName = signature.split("(")[0].replace("function", "").trim();
    return (new ethers.utils.Interface([signature])).encodeFunctionData(functionName, params);
}

module.exports = {
    setupLevel,
    abiEncodeWithSignature
};