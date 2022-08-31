const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const sendValue = ethers.utils.parseEther("0.5");
  const { deployer } = await getNamedAccounts();

  const fundMe = await ethers.getContract("FundMe", deployer);

  console.log("Funding contract...");
  const transactionResponse = await fundMe.sendUsd({ value: sendValue });
  const transactionReceipt = await transactionResponse.wait(1);
  console.log("Funded...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
