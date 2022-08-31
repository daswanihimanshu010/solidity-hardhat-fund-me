const networkConfig = {
  // whatever networks you are defining here, should also be present in hardhat.config.js, network tab
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  // 31337   ?
};

const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000; // 2000 * 8 decimal places

const developmentChains = ["hardhat", "localhost"];

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER };
