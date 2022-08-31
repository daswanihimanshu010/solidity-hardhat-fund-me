// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "./PriceConvertor.sol";

// It is best practice to use contract name with __ and then error name
error FundMe__NotOwner();

contract FundMe {
    using PriceConvertor for uint256;

    uint256 public number;

    uint256 public constant MINIMUM_USD = 50 * 1e18; // We have to keep the uints same everywhere
    // When we are comparing the values in sendUsd function, we are comapring msg.value coming from getConversionPrice function
    // which has 18 decimal points so we have to convert our dollar price in 18 decimal points as well
    address[] private s_funders;
    mapping(address => uint256) private s_funderAmount;
    AggregatorV3Interface private s_priceFeed;
    address private immutable i_owner;

    constructor(address priceFeedAddress) {
        // When the contract is deployed, the msg.sender in that case will be the owner of the contract.
        // So we can save the value of owner in constructor.
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // function sendTest() public payable {
    //     number = 5;

    //     // Here if require statement is not met, the number will be reverted back to 0 and you have to pay gas for this
    //     // and remaining gas will be sent back

    //     // Want to send minimum amount in Ether

    //     // What is reverting, undo any action and send remaining gas back

    //     require(msg.value > 1e18, "Didn't send enough");
    //     // 1e18 is one ETH
    // }

    function sendUsd() public payable {
        // here the numberUsd is 50 $ which needs to be compared with 1 ETH
        // We need to get the price of one ether in terms of USD to compare
        // Blockchain cannot interact with external systems that is why we have to use Decentralized oracle network

        require(
            msg.value.getConversionPrice(s_priceFeed) > MINIMUM_USD,
            "Didn't send enough"
        );

        // msg.value returns ETH in terms of wei which has 18 decimal points
        // convert msg.value from layer 1 / ETH to USD
        // The msg.value depends on what blockchain we are working with, it can be ETH, Avalanche or polygon

        s_funders.push(msg.sender);
        s_funderAmount[msg.sender] = msg.value;
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funderAddress = s_funders[funderIndex];
            s_funderAmount[funderAddress] = 0;
        }

        // Resetting an array, the 0 here defines how many elements will be there in an array to start with.

        s_funders = new address[](0);

        // msg.sender = address
        // payable(msg.sender) = payable address

        // withdraw the funds to an address

        // transfer, if this send fails it will just return error and return transaction
        //payable(msg.sender).transfer(address(this).balance);

        // send, if this send passes it will return boolean
        //bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // This require states if sendSuccess is true then continue executing the lines else display the error
        //require(sendSuccess,"Transfer Failed!!");

        //call, we can use this function to call any function in ethereum without an ABI
        // In paranthesis we define which function we want to call in ethereum network
        // we can leave it blank by inputting double quotes
        //(bool txnSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");

        (bool txnSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(txnSuccess, "Transfer Failed!!");
    }

    function cheaperWithdraw() public payable onlyOwner {
        // In for loop, we are comparing our index with s_funders.length that is a storag variable so
        // it is costing us a lot of gas. We are reading a ton from storage here
        // Also address funderAddress = s_funders[funderIndex] is also reading from storage a lot

        // for (
        //     uint256 funderIndex = 0;
        //     funderIndex < s_funders.length;
        //     funderIndex++
        // ) {
        //     address funderAddress = s_funders[funderIndex];
        //     s_funderAmount[funderAddress] = 0;
        // }

        // mappings can't be in memory
        address[] memory fundersArray = s_funders;

        for (
            uint256 funderIndex = 0;
            funderIndex < fundersArray.length;
            funderIndex++
        ) {
            address funderAddress = fundersArray[funderIndex];
            s_funderAmount[funderAddress] = 0;
        }

        s_funders = new address[](0);

        (bool txnSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(txnSuccess, "Transfer Failed!!");
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        //require(msg.sender == i_owner,"Sender is not owner!!");
        // This _ means that the above line will be executed first and then all the code writtern in the function
        // will be executed to which this modifier has been applied.
        _;
    }

    // What happens if someone sends this contract ETH directly ?

    receive() external payable {
        sendUsd();
    }

    fallback() external payable {
        sendUsd();
    }

    // getters & setters

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 funderIndex) public view returns (address) {
        return s_funders[funderIndex];
    }

    function getFunderAmount(address funderAddress)
        public
        view
        returns (uint256)
    {
        return s_funderAmount[funderAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// Functions Order
// constructor
// receive
// fallback
// external
// public
// internal
// private
// view/pure (getters)
