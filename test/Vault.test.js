const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault -> Unit test", () => {
  let vault;
  let mock20;

  let alice;
  let bob;

  const WETH = new ethers.Contract(
    // WETH address on ETH mainnet
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
    ],
    ethers.provider
  );

  const depositAmount = ethers.utils.parseEther("1");

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(WETH.address);

    const Mock20 = await ethers.getContractFactory("Mock20");
    mock20 = await Mock20.deploy();
  });

  describe("depositToken()", () => {
    it("Should successfully deposit ERC-20 token", async () => {
      await mock20.mint(alice.address, depositAmount);
      await mock20.approve(vault.address, depositAmount);

      await expect(
        vault.depositToken(mock20.address, depositAmount))
        .to.changeTokenBalance(
          mock20, vault, depositAmount
        );
    });

    it("Should fail to deposit (Amount = 0)", async () => {
      await mock20.mint(alice.address, depositAmount);
      await mock20.approve(vault.address, depositAmount);

      await expect(vault.depositToken(mock20.address, 0))
        .to.be.revertedWith("Vault: amount should be greater than zero");
    });
  });

  describe("depositETH()", () => {
    it("Should successfully deposit ETH", async () => {
      await expect(vault.depositETH({ value: depositAmount })).to.changeEtherBalance(vault, depositAmount);
    });
  });

  describe("withdrawToken()", () => {
    it("Should successfully withdraw ERC-20 token", async () => {
      expect(await mock20.balanceOf(alice.address)).to.be.equal("0");

      await mock20.mint(alice.address, depositAmount);
      await mock20.approve(vault.address, depositAmount);
      await vault.depositToken(mock20.address, depositAmount);
      await vault.connect(alice).withdrawToken(mock20.address);

      expect(await mock20.balanceOf(alice.address)).to.be.equal(depositAmount);
    });
  });

  describe("withdrawETH()", () => {
    it("Should successfully withdraw ETH", async () => {
      await vault.depositETH({ value: depositAmount });

      await expect(vault.withdrawETH()).to.changeEtherBalance(alice, depositAmount);
    });
  });

  describe("wrapETH()", () => {
    it("Should successfully wrap ETH", async () => {
      await vault.depositETH({ value: depositAmount });
      const wrapTx = await vault.wrapETH();
      await wrapTx.wait();

      expect(vault).to.changeTokenBalance(WETH, vault, depositAmount);
    });

    it("Should fail to wrap ETH (Amount = 0)", async () => {
      await mock20.mint(alice.address, depositAmount);
      await mock20.approve(vault.address, depositAmount);

      await expect(vault.wrapETH())
        .to.be.revertedWith("Vault: no ETH to wrap");
    });
  });

  describe("unwrapETH()", () => {
    it("Should successfully unwrap ETH", async () => {
      await vault.depositETH({ value: depositAmount });
      const wrapTx = await vault.wrapETH();
      await wrapTx.wait();
      const unwrapTx = await vault.unwrapETH(depositAmount);
      await unwrapTx.wait();

      expect(vault).to.changeEtherBalance(vault, depositAmount);
    });

    it("Should fail to unwrap ETH (Amount = 0)", async () => {
      await vault.depositETH({ value: depositAmount });
      const wrapTx = await vault.wrapETH();
      await wrapTx.wait();

      await expect(vault.unwrapETH(0))
        .to.be.revertedWith("Vault: amount should be > 0 and <= your balance");
    });
  });

  describe("getETHBalance()", () => {
    it("Should successfully get ETH balance for a given wallet", async () => {
      expect(await vault.getETHBalance(alice.address)).to.be.equal("0");
    });
  });

  describe("getTokenBalance()", () => {
    it("Should successfully get token balance for a given wallet", async () => {
      expect(await vault.getTokenBalance(mock20.address, alice.address)).to.be.equal("0");
    });
  });

  describe("getWETHAddress()", () => {
    it("Should successfully get WETH address", async () => {
      expect(await vault.getWETHAddress()).to.be.equal(WETH.address);
    });
  });
});