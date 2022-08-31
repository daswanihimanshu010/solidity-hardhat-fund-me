// These are the tests that we are going to run just before we deploy this to main net or test net.
const { assert } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function() {
      let deployerAccount, fundMe;
      const sendValue = ethers.utils.parseEther("0.3");

      beforeEach(async () => {
        deployerAccount = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployerAccount);
      });

      it("Allows people to fund the contract", async () => {
        await fundMe.sendUsd({ value: sendValue });
        await fundMe.withdraw();

        const endingWalletBalance = await ethers.provider.getBalance(
          fundMe.address
        );

        assert(endingWalletBalance.toString(), "0");
      });
    });
