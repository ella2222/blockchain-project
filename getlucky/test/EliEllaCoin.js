const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("EliEllaCoin", function () {
  let EliEllaCoin, elieliacoin, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const EliEllaCoinFactory = await ethers.getContractFactory("EliEllaCoin");
    elieliacoin = await upgrades.deployProxy(EliEllaCoinFactory, [owner.address], { initializer: 'initialize' });
    await elieliacoin.deployed();
  });

  it("Should initialize with the correct name and symbol", async function () {
    expect(await elieliacoin.name()).to.equal("EliEllaCoin");
    expect(await elieliacoin.symbol()).to.equal("EEC");
  });

  it("Should mint initial supply to owner", async function () {
    const ownerBalance = await elieliacoin.balanceOf(owner.address);
    expect(await elieliacoin.totalSupply()).to.equal(ownerBalance);
  });

  it("Should mint tokens by owner", async function () {
    await elieliacoin.mint(addr1.address, 1000);
    expect(await elieliacoin.balanceOf(addr1.address)).to.equal(1000);
  });

  it("Should pause and unpause the contract", async function () {
    await elieliacoin.pause();
    expect(await elieliacoin.paused()).to.be.true;
    await elieliacoin.unpause();
    expect(await elieliacoin.paused()).to.be.false;
  });

  it("Should not allow transfers when paused", async function () {
    await elieliacoin.pause();
    await expect(elieliacoin.transfer(addr1.address, 100)).to.be.revertedWith("Pausable: paused");
  });

  it("Should allow transfers when unpaused", async function () {
    await elieliacoin.transfer(addr1.address, 100);
    expect(await elieliacoin.balanceOf(addr1.address)).to.equal(100);
  });

  it("Should only allow owner to pause/unpause", async function () {
    await expect(elieliacoin.connect(addr1).pause()).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(elieliacoin.connect(addr1).unpause()).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should only allow owner to mint", async function () {
    await expect(elieliacoin.connect(addr1).mint(addr1.address, 1000)).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
