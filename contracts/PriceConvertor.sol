// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConvertor {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // To get price of eth in terms of USD we have to interact with oracle databases outside our blockchain
        // We will use a interface here to get the price of ETH in terms of USD
        // To interact with outside contracts or interfaces we need ABI and address which we can get from docs.chain.link
        // https://docs.chain.link/docs/ethereum-addresses/ and choose the network that you are on rinkeby, kovan
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x9326BFA02ADD2366b30bacB125260Af641031331
        // );

        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // Price that came in answer has 8 decimal points so we are adding 10 more decimal points to answer because we
        // have to compare it with ETH value which is in terms of wei which has 18 decimal points
        return uint256(answer * 1e10);
    }

    // function getDecimal() internal view returns (uint8) {
    //     AggregatorV3Interface decimalFeed = AggregatorV3Interface(
    //         0x9326BFA02ADD2366b30bacB125260Af641031331
    //     );
    //     return decimalFeed.decimals();
    // }

    // function getVersion() internal view returns (uint256) {
    //     AggregatorV3Interface versionFeed = AggregatorV3Interface(
    //         0x9326BFA02ADD2366b30bacB125260Af641031331
    //     );
    //     return versionFeed.version();
    // }

    function getConversionPrice(
        uint256 ethValue,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 priceOfUsdInEth = getPrice(priceFeed);
        // 2 Eth * (Value of 1 eth in usd)
        // Because both values have 18 decimal points when we multiply them it will give us 36 decimal points
        // so we are dividing it with 1**18 decimal points
        uint256 convertedValue = (ethValue * priceOfUsdInEth) / 1e18;
        return convertedValue;
    }
}
