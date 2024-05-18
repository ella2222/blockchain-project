const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Casino", function () {
  let Casino, casino, EliEllaCoin, elieliacoin, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy EliEllaCoin
    const EliEllaCoinFactory = await ethers.getContractFactory("EliEllaCoin");
    elieliacoin = await upgrades.deployProxy(EliEllaCoinFactory, [owner.address], { initializer: 'initialize' });
    await elieliacoin.deployed();

    // Deploy Casino
    const CasinoFactory = await ethers.getContractFactory("Casino");
    casino = await upgrades.deployProxy(CasinoFactory, [elieliacoin.address, owner.address], { initializer: 'initialize' });
    await casino.deployed();
  });

  it("Should initialize with correct parameters", async function () {
    expect(await casino.token()).to.equal(elieliacoin.address);
    expect(await casino.minDepositAmount()).to.equal(ethers.parseEther("10"));
    expect(await casino.maxDepositAmount()).to.equal(ethers.parseEther("10000"));
    expect(await casino.minWithdrawAmount()).to.equal(ethers.parseEther("10"));
    expect(await casino.maxWithdrawAmount()).to.equal(ethers.parseEther("10000"));
  });

  it("Should allow deposits within limits", async function () {
    const depositAmount = ethers.parseEther("100");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await expect(casino.connect(addr1).deposit(depositAmount))
      .to.emit(casino, "Deposited")
      .withArgs(addr1.address, depositAmount.mul(99).div(100), depositAmount.div(100), await ethers.provider.getBlockNumber());
  });

  it("Should not allow deposits below minimum", async function () {
    const depositAmount = ethers.parseEther("1");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await expect(casino.connect(addr1).deposit(depositAmount)).to.be.revertedWith("Deposit amount is too low");
  });

  it("Should not allow deposits above maximum", async function () {
    const depositAmount = ethers.parseEther("20000");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await expect(casino.connect(addr1).deposit(depositAmount)).to.be.revertedWith("Deposit amount exceeds maximum limit");
  });

  it("Should allow withdrawals within limits", async function () {
    const depositAmount = ethers.parseEther("100");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await casino.connect(addr1).deposit(depositAmount);

    const withdrawAmount = ethers.parseEther("50");
    await expect(casino.connect(addr1).withdraw(withdrawAmount))
      .to.emit(casino, "Withdrawn")
      .withArgs(addr1.address, withdrawAmount.mul(95).div(100), withdrawAmount.mul(5).div(100), await ethers.provider.getBlockNumber());
  });

  it("Should not allow withdrawals below minimum", async function () {
    const depositAmount = ethers.parseEther("100");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await casino.connect(addr1).deposit(depositAmount);

    const withdrawAmount = ethers.parseEther("1");
    await expect(casino.connect(addr1).withdraw(withdrawAmount)).to.be.revertedWith("Withdraw amount is too low");
  });

  it("Should not allow withdrawals above maximum", async function () {
    const depositAmount = ethers.parseEther("10000");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await casino.connect(addr1).deposit(depositAmount);

    const withdrawAmount = ethers.parseEther("20000");
    await expect(casino.connect(addr1).withdraw(withdrawAmount)).to.be.revertedWith("Withdraw amount exceeds maximum limit");
  });

  it("Should allow placing bets within balance", async function () {
    const depositAmount = ethers.parseEther("100");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await casino.connect(addr1).deposit(depositAmount);

    const betAmount = ethers.parseEther("50");
    await expect(casino.connect(addr1).placeBet("Game1", betAmount))
      .to.emit(casino, "BetPlaced")
      .withArgs(addr1.address, "Game1", betAmount, await ethers.provider.getBlockNumber());
  });

  it("Should not allow placing bets exceeding balance", async function () {
    const depositAmount = ethers.parseEther("100");
    await elieliacoin.connect(owner).mint(addr1.address, depositAmount);
    await elieliacoin.connect(addr1).approve(casino.address, depositAmount);

    await casino.connect(addr1).deposit(depositAmount);

    const betAmount = ethers.parseEther("200");
    await expect(casino.connect(addr1).placeBet("Game1", betAmount)).to.be.revertedWith("Insufficient balance");
  });

  it("Should allow owner to update deposit and withdraw limits", async function () {
    const newMinDeposit = ethers.parseEther("20");
    const newMaxDeposit = ethers.parseEther("20000");
    const newMinWithdraw = ethers.parseEther("20");
    const newMaxWithdraw = ethers.parseEther("20000");

    await casino.updateMinDepositAmount(newMinDeposit);
    await casino.updateMaxDepositAmount(newMaxDeposit);
    await casino.updateMinWithdrawAmount(newMinWithdraw);
    await casino.updateMaxWithdrawAmount(newMaxWithdraw);

    expect(await casino.minDepositAmount()).to.equal(newMinDeposit);
    expect(await casino.maxDepositAmount()).to.equal(newMaxDeposit);
    expect(await casino.minWithdrawAmount()).to.equal(newMinWithdraw);
    expect(await casino.maxWithdrawAmount()).to.equal(newMaxWithdraw);
  });

  it("Should allow claiming prize within casino balance", async function () {
    const prizeAmount = ethers.parseEther("500");
    await elieliacoin.connect(owner).mint(casino.address, prizeAmount);

    await expect(casino.connect(addr1).claimPrize(prizeAmount))
      .to.emit(casino, "PrizeClaimed")
      .withArgs(addr1.address, prizeAmount, await ethers.provider.getBlockNumber());
  });

  it("Should not allow claiming prize exceeding casino balance", async function () {
    const prizeAmount = ethers.parseEther("500");

    await expect(casino.connect(addr1).claimPrize(prizeAmount)).to.be.revertedWith("Casino does not have enough funds to pay the prize");
  });

  it("Should allow owner to draw results", async function () {
    const winningNumbers = [1, 2, 3, 4, 5];
    await expect(casino.drawResult("Game1", winningNumbers))
      .to.emit(casino, "ResultDrawn")
      .withArgs("Game1", winningNumbers, await ethers.provider.getBlockNumber());
  });
});
