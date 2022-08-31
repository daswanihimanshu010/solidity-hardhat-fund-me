# Sample Hardhat Project for FundMe

# Linting: Solhint

Linting is best way to check our code for warnings and errors. This helps us in writing code using best code practices.

It is process of running a problem that will analyse code for potential errors.

Visit: https://github.com/protofire/solhint/blob/master/README.md

Problems in solhint installation:

https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/885

To lint: yarn solhint contracts/\*.sol

# Hardhat deploy package

We are not going to write our deploy code in scripts as we may have to write multiple deploy scripts for various contracts in future. So for that we will create a new folder "deploy" in our directory and write deploy scripts inside of that and will use a package: https://github.com/wighawag/hardhat-deploy.

After adding the package you can see via yarn hardhat, there is a deploy command in terminal.

Then we have to orverride our hardhat-ethers package with hardhat-deploy-ethers:
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
Then you can see in hardhat.config.js the overriding:
"@nomiclabs/hardhat-ethers": "npm:hardhat-deploy-ethers".

yarn hardhat deploy command will deploy the scripts from deploy folder now, to make them run in a series we can number them in their name "01-deploy-fund-me.js".

Hardhat deploys calls the function that we specify in the exports of the script.

# Things to take care while deploying, using getNamedAccounts

hre passed as a paramter is Hardhat runtime environment. Whenever we run a hardhat deploy script, hardhat deploy automatically calls the function that is in module.exports and passes the "hre" as a object as parameter.
Same like const { ethers, run, network} = require("hardhat");
require("hardhat") is hre

We can extract exact variables from hre. const { getNamedAccounts, deployments } = hre;
Kind of same like doing: hre.deployments, hre.getNamedAccounts

getNamedAccounts is function which fetches which account / wallet / private key will deploy the contract. It looks for namedAccounts in hardhat.config.js where he looks for network chainId (5: 1) so for goerli network (5) it will use the first wallet or provate key as deployer of smart contract. The default keyword defines for hardhat, the 31337 defines for localhost.

# Mocking

When we are interacting with our contracts using chainlink contracts interfaces like we have imported in our PriceConvertor.sol. This gives us accesss to interface to access address of various chains and get latest priceFeed. But this won't work in localhost network or hardhat network. Here will use Mocking, what we want to do here is to make a fake price feed contract that we can use and contract while working locally.

# Aave V3 core

Visit: https://github.com/aave/aave-v3-core

Aave is a protocol which works with different chains and we work with aave when we are deploying contracts on multiple chains and multiple addresses.

Main trick they use: helper-hardhat-config.js, here accoding to different network they have different variables

# Note about calling helper-hardhat-config.js

const helperConfig = require("../helper-hardhat-config");
const networkConfig = helperConfig.networkConfig;

is same as

const { networkConfig } = require("../helper-hardhat-config");

# Preparing a mock test for AggregatorV3Interface, how can we run priceFeed.latestRoundData() in hardhat or localhost network

We set up a new smart contract in tests folder in contracts which can be called mock contracts, which we are setting up because ETH/USD kind of values won't exist in hardhat or localhost network, it can only be fetched from ETH main network or any rinkeby/goerli or any other blockchain.

Visit https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.6/tests/MockV3Aggregator.sol

We can directly link this with our smart contract using import.

When we are using multiple solidity versions in our smart contracts we can mention them in hardhat.config.ts

# Is there any way to run a specific deploy script

module.exports.tags = ["all", "mocks"] can be defined after module.exports function in deploy script.

And then we can run yarn hardhat deploy --tags mocks

# deployments.get() function

It gets the recently deployed smart contract information and address.

You can import it like:

const { get } = deployments;
and use it like get("MockV3Aggregator");

or we can do directly deployments.get("MockV3Aggregator"); without the import.

# When you will run

`yarn hardhat deploy`

Now It will execute first 00-deploy-fund-me.js and then 01-deploy-fund-me.js.

It will first look for the network hardhat or localhost defined in developmentChains in helper-hardhat-config.js then if it is true then it will deploy a MockV3Aggregator to run a smart contract telling us the pricefeed latest price of ETH/USD according to values that we provided in parameters.

Then it will reach to 01-deploy-fund-me.js, where it will again the network is hardhat, localhost or any other and then if it is localhost/hardhat it will look for MockV3Aggregator deployed contract address else if it is testnet like rinkeby or goerli it will extract that address from networkConfig from helper-hardhat-config.js according to chainId.

Whatever the address it will be passed in FundMe deploy function as a parameter.

Now when we run `yarn hardhat node` then it will not only setup our private accounts it will also deploy our mocks contracts to do the testing.

# Note

You can run, deploy contracts on any network like polygon, ethereum (mainnnet, rinkeby, goerli) using network config in helper-hardhat.config.js and networks in hardhart.config.js.

# Deployed contract details:

Visit Goerli Etherscan:

Contract Address: 0x1D4E55f428aec6Bb34e2f242d7E8275837A89e16
Verified at: https://goerli.etherscan.io/address/0x1D4E55f428aec6Bb34e2f242d7E8275837A89e16#code

# Solidity console.log if you don't want to javascript debug terminal on left and breakpoints

https://hardhat.org/tutorial/debugging-with-hardhat-network

# Writing Complex tests

We do not use async keyword before the functions in describe keyword.

While writing test remember: Arrange (Call the variables), Act(Do the processing), Assert(Print output/Compare boolean)

`Try to look at statements in smart contracts like FundMe.sol and try to cover each statement with test, whatever statement does we have to test that, assert and expect from chai package are going do decide the output of test. When you need to compare two values use assert and when you have define that if code is throwing error and it was supposed to throw error that means it is ok and test is running successfully then we use expect.`

---

`deployments.fixture(["all"]);`

deployments.fixture allows us to run our entire deploy folder with as many tags we want

---

How to get a deployer account: (in let keyword, can be used later also)

`const { getNamedAccounts } = require("hardhat");`

`let deployerAccount;`

`deployerAccount = (await getNamedAccounts()).deployer;`

OR (in const keyword)

`const { deployer } = await getNamedAccounts();`

---

`let fundMe; fundMe = await ethers.getContract("FundMe", deployerAccount);`

but here we are connecting the contract to owner.
ethers.getContract gets the latest contract deployed

`const connectedfundMeContract = await fundMe.connect(account[i]);`
This is used to connect a account to a contract, it is same like.

The connectedfundMeContract will not be able to use withdraw function because
it has onlyOwner modifier.

---

if you want to get the accounts from the network defined accounts section in hardhat.config.js

`const accounts = await ethers.getSigners()`
`const accountZero = accounts[0]`

---

In contructor of FundMe.test.js

`const deployedMockContract = await deployments.get("MockV3Aggregator");`
`ethUsdPriceFeedAddress = deployedMockContract.address;`

we are passing ethUsdPriceFeedAddress as parameter for MockV3Aggregator hosted asmart contract address

and we are comparing in test with

`mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployerAccount);`
`mockV3Aggregator.address`

So these both are ways to get latest contract deployed object.

---

describe("FundMe", function() {

beforeEach(async function() {
// get deployer accounts
// run deploy scripts
// get running contract objects
});

describe("sendUsd", function() {

    it("maps the funder address with the amount sent", async () => {

    });

}

});

---

To access address array value of a contract

`fundMe.funders(0)`

---

To get wallet balance of an address / wallet balance of smart contract

`const startingWalletBalance = await fundMe.provider.getBalance(fundMe.address);`
`const startingDeployerBalance = await fundMe.provider.getBalance(deployerAccount);`

---

We are using add(), mul() because we are working with BigNumber to do maths and to compare we use
toString()

# Storage Variables & Gas Optimizations

1. State / Storage Variables:

Any variable that is changeable that we want to persist acroos contract executions & transactions. We save them to a giant array called
storage.

-> Storage: Works as a giant list associated with contracts. When we are storing `uint256 public number`, we are basically saying we want this variable to persists. Each value of storage variables gets stored as a 32 hex code like `number = 25;` so 25 is represented as the 32 hex code.

[0] 0x00...19 => uint256 public number;

[1] 0x00...20 => address[] public funders; (Only funders length gets stored in Storage, the elements of the funders are saved using a special hashing function. For dynamic values like array and mapping which can change length. The elements get stored separately like shown below.)

[kecacak256(2)] 0x00..26

-> Constant / Memory / Immutable variables do not take storage spaces.

`uint256 public constant MINIMUM_USD = 50 * 1e18;`

-> Storage variables defined in functions also do not take storage spaces because their life is till the function is being executed, they do not persist. They get added in memory variable which gets deleted after function is executed.

`function doStuff() {`
`uint256 otherVar = 7;`
`uint256 newVar = favouriteNumber + 1`
`}`

Note: `Any time you read or write from storage variables you spend gas.`

-> In hardhat if we go into artifacts/build-info/anycontract.json search for opcodes. The way the gas is calculated is through these opcodes. Go to https://github.com/crytic/evm-opcodes and see what opcode cost how many gas.

-> SLOAD (800) & SSTORE(20000\*\*) are opcodes for storage variables load and save which cost a lot of gas.

-> So the best way to notice the storage variables in contract where we are gonna spend a lot of gas we can use "s\_" before variable name to denote it is a storage variable.

-> For immutable type we should use "i\_" to show this is not gonna cost gas.

-> The constant variables should be all caps and they also do not gonna cost gas.

`See cheaperWithdraw() function in FundMe.sol to see how we can optimize gas when it comes to load and save storage variables.`

2. private and internal scope functions cost less gas.

Use getters & setters in smart contracts to use these private variables in tests like see in FundMe.sol.

3. Using error codes like

`error FundMe__NotOwner();`

`if (msg.sender != i_owner) {`
`revert FundMe__NotOwner();`
`}`

instead of using message in require statement

`require(msg.sender == i_owner,"Sender is not owner!!");`

will also save gas.

---

Deployed contract address: 0x00c6E9f5Bfc30297461E96Bad111b481be56Bb43
