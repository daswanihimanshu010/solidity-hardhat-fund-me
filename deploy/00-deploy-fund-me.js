const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // const chainId = network.config.chainId;
  // Because network.name, we are using developmentChains is an array of names of networks
  // We can also compare by chainID if chainID = 31337
  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      // DECIMALS is calling decimals function in MockV3 Aggregator decimals func which is 8
      // INITIALANSWER is what is the pricefeed of starting at
      log: true,
    });
    log("Mocks deployed!");
    log("-----------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
