const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const sendValue = ethers.utils.parseEther("0.5");
  const { deployer } = await getNamedAccounts();

  const fundMe = await ethers.getContract("FundMe", deployer);

  console.log("Withdrawing from contract...");
  const transactionResponse = await fundMe.withdraw();
  const transactionReceipt = await transactionResponse.wait(1);
  console.log("Got it back...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
