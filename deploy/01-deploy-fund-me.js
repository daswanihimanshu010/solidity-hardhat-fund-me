const { network } = require("hardhat");
// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

const { verify } = require("../utils/verify");

require("dotenv").config();

// Type 1
// async function deployFunc(hre) {
//   console.log("Hi");
// }

// Hardhat deploy looks for export default function to deploy
//module.exports.default = deployFunc;

// hre passed as a paramter is Hardhat runtime environment. Whenever we run a hardhat deploy script,
// hardhat deploy automatically calls the function that is in module.exports and passes the "hre"
// as a object as parameter.

// Type 2 with anonymous function with arrow
// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
//   // hre.deployments
//   // hre.getNamedAccounts()
// };

// Type 3 syntax sugar in javascript, using less lines of code

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log /*, get */ } = deployments;

  // By using getNamedAccount() we can get the accounts mentioned in the network section
  const { deployer } = await getNamedAccounts();

  // We are going to fetch the priceFeed EVM address according to the chainId

  const chainId = network.config.chainId;

  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const deployedMockContract = await deployments.get("MockV3Aggregator");
    // We can do get("MockV3Aggregator"); if we import "get" directly from deployments as shown above
    // in import comment
    ethUsdPriceFeedAddress = deployedMockContract.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // well what happens when we want to change chains?
  // We are trying to pass Price Convertor AggregatorV3Interface address as dynamic as the price conversion
  // address for every chain is different https://docs.chain.link/ > EVM Chains > Eth Data Feeds
  // we need dynamic addresses from here according to which chain we are working on
  // For this here we are going to use mocking because while going for localhost or hardhat network
  // there will be no EVM address from where we can fetch converted price

  const args = [ethUsdPriceFeedAddress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // Args are the parameters for the constructor, arguments needs to be passed to FundMe.sol
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // refers to whichever testnet you are on
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHER_SCAN_API_KEY
  ) {
    // We are sending args in this project and not null like simple storage
    // because FundMe.sol constructor has a parameterof address of pricefeed
    await verify(fundMe.address, args);
  }

  log("FundMe contract deployed!");
  log("----------------------------------------");
};

module.exports.tags = ["all", "fundme"];
