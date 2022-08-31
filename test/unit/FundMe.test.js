const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function() {
      let fundMe, mockV3Aggregator;
      let deployerAccount;
      const sendValue = ethers.utils.parseEther("1");

      // deploying our fundme contract before every test
      beforeEach(async function() {
        // if you want to get the accounts from the network defined accounts section in hardhat.config.js
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]

        // Because we have to use our deployer object outside beforeEach also, we make it "let" above
        // Then instead of const { deployer } = await getNamedAccounts(); we do this:
        deployerAccount = (await getNamedAccounts()).deployer;

        // deployments.fixture allows us to run our entire deploy folder with as many tags we want
        // all tag has been added to both deploy scripts
        await deployments.fixture(["all"]);

        // ethers.getContract gets the latest contract deployed
        fundMe = await ethers.getContract("FundMe", deployerAccount);

        // ethers.getContract() is may be same like deployments.get() used in our deploy script
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployerAccount
        );
      });

      // We are taking another describe here because we will be writting multiple tests here for
      // fundMe contract

      // writting tests with constructor()
      describe("constructor", function() {
        // This test gets the priceFeed from fundMe contract because all deploy scripts already ran
        // because of what we wrote in beforeEach() above so fundMe.priceFeed() was not empty

        it("sets the pricefeed address to get current ETH/USD price from chainlink contracts", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      // writting tests with sendUsd()
      describe("sendUsd", function() {
        it("Fails if you don't send enough ETH", async () => {
          // This line will return error, which is correct behaviour but we need to tell the code
          // that it is ok, so here the expect keyword comes to play
          // await fundMe.sendUsd()

          // This can be also known as waffle testing because we are expecting the test to fail
          await expect(fundMe.sendUsd()).to.be.reverted;
        });

        it("maps the funder address with the amount sent", async () => {
          await fundMe.sendUsd({ value: sendValue });
          // This will give us what amount we have sent as this funderAmount is of mapping type which
          // stores list of what address has sent has how much eth
          const response = await fundMe.getFunderAmount(deployerAccount);
          // We need to convert toString() because result will be a BigNumber
          assert.equal(response.toString(), sendValue.toString());
        });

        it("updates the funder array", async () => {
          await fundMe.sendUsd({ value: sendValue });
          const funder = await fundMe.getFunders(0);
          assert.equal(funder, deployerAccount);
        });
      });

      describe("withdraw", function() {
        // To withdraw, we need some money already in wallet

        beforeEach(async () => {
          await fundMe.sendUsd({ value: sendValue });
        });

        it("withdraw ETH from a single funder", async () => {
          // Arrange
          // We can also do ethers.provider.getBalance(fundMe.address);
          const startingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          // We have attached the deployer account to fundMe contract above
          // deployer account is the withdraw account here verifying as owner
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );
          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );

          // Assert
          assert(endingWalletBalance, 0);
          // We are using add() because we are working with BigNumber
          // When we withdraw, the deployer account spent some gas to transfer funds
          // We need to add that gascost to endingdeployer balance to compare with the two starting wallets

          assert(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingWalletBalance).toString()
          );
        });

        it("withdraw ETH from a single funder from cheaperWithdraw", async () => {
          // Arrange
          // We can also do ethers.provider.getBalance(fundMe.address);
          const startingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          // We have attached the deployer account to fundMe contract above
          // deployer account is the withdraw account here verifying as owner
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );
          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );

          // Assert
          assert(endingWalletBalance, 0);
          // We are using add() because we are working with BigNumber
          // When we withdraw, the deployer account spent some gas to transfer funds
          // We need to add that gascost to endingdeployer balance to compare with the two starting wallets

          assert(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingWalletBalance).toString()
          );
        });

        it("withdraw ETH from a multiple funders", async () => {
          const account = await ethers.getSigners();

          // Arrange
          // Multiple accounts funding from network tab of accounts key in hardhat.config.js
          for (let i = 1; i < 6; i++) {
            const connectedfundMeContract = await fundMe.connect(account[i]);
            connectedfundMeContract.sendUsd({ value: sendValue });
          }

          // Everything is going to be same from here for which we withdraw funds from a single funder
          // above because we are here comparing values of wallet and deployer and the multiple accounts
          // that funded the contract are now collectively called as wallet balance

          // smart contract balance
          const startingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          // smart contract owner balance
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );

          // Act
          // fundMe.withdraw() because we have to withdraw smart contract amount to deployer account
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // Assert
          const endingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );

          assert(endingWalletBalance, 0);

          assert(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingWalletBalance).toString()
          );

          // Make the reset of funders array and clear mapping

          // The funders will be empty on withdraw so we are checking fundMe.getFunder(0) is empty
          // Then we are telling compiler with expect keyword that it is ok if it is empty because it
          // is supposed to be empty
          await expect(fundMe.getFunders(0)).to.be.reverted;

          // checking if all mapping are empty or not
          for (i = 1; i < 6; i++) {
            assert.equal(await fundMe.getFunderAmount(account[i].address), 0);
          }
        });

        it("withdraw ETH from a multiple funders from cheaperWithdraw", async () => {
          const account = await ethers.getSigners();

          // Arrange
          // Multiple accounts funding from network tab of accounts key in hardhat.config.js
          for (let i = 1; i < 6; i++) {
            const connectedfundMeContract = await fundMe.connect(account[i]);
            connectedfundMeContract.sendUsd({ value: sendValue });
          }

          // Everything is going to be same from here for which we withdraw funds from a single funder
          // above because we are here comparing values of wallet and deployer and the multiple accounts
          // that funded the contract are now collectively called as wallet balance

          // smart contract balance
          const startingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          // smart contract owner balance
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );

          // Act
          // fundMe.withdraw() because we have to withdraw smart contract amount to deployer account
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // Assert
          const endingWalletBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployerAccount
          );

          assert(endingWalletBalance, 0);

          assert(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingWalletBalance).toString()
          );

          // Make the reset of funders array and clear mapping

          // The funders will be empty on withdraw so we are checking fundMe.getFunder(0) is empty
          // Then we are telling compiler with expect keyword that it is ok if it is empty because it
          // is supposed to be empty
          await expect(fundMe.getFunders(0)).to.be.reverted;

          // checking if all mapping are empty or not
          for (i = 1; i < 6; i++) {
            assert.equal(await fundMe.getFunderAmount(account[i].address), 0);
          }
        });

        it("Only owner can withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const connectedAttackerContract = await fundMe.connect(attacker);
          await expect(connectedAttackerContract.withdraw()).to.be.reverted;
        });
      });
    });
