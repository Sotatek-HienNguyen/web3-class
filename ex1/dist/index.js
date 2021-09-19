"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Web3 = require("web3");
const ethereumMulticall = require("ethereum-multicall");
const ABI = require("../contracts/ABI.json");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const web3 = new Web3("wss://rinkeby-light.eth.linkpool.io/ws");
    const contractAddress = "0xc778417e063141139fce010982780140aa0cd5ab";
    const contract = yield new web3.eth.Contract(ABI, contractAddress);
    const name = yield contract.methods.name().call();
    const symbol = yield contract.methods.symbol().call();
    console.log(name);
    const addressCheckBalance = "0xf46982122155B776F225cfCbDC4156f3AAE467B7";
    const balance = yield contract.methods.balanceOf(addressCheckBalance).call();
    console.log(`=====BalanceOf ${addressCheckBalance}: ${balance} ${symbol}`);
    const latestBlock = yield web3.eth.getBlockNumber();
    const blockNumber = latestBlock - 100;
    // let options = {
    // filter: {},
    // fromBlock: blockNumber,
    // toBlock: "latest",
    // };
    // console.log(`${latestBlock} ${blockNumber}`);
    //
    // contract
    // .getPastEvents("Transfer", options)
    // .then((result: any) =>
    // console.log("======Query event transfer on the last 100 block", result)
    // )
    // .catch((err: any) => console.log("Err", err.message));
    //
    // contract.events
    // .Transfer()
    // .on("data", (event: any) => {
    // console.log("=====Listen event transfer", event);
    // })
    // .on("error", console.error);
    const multicall = new ethereumMulticall.Multicall({
        web3Instance: web3,
        tryAggregate: true,
    });
    const addresses = [
        "0x7edB83209611f18386f67CDeE63BAEe695fA0aab",
        "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        "0x0bEe24D48E22A7a161D0B6B576775315890CE7C4",
        "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
        "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678",
        "0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c",
        "0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC",
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
        "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
    ];
    const contractCallContext = addresses.map((address, index) => {
        return {
            reference: address,
            contractAddress: contractAddress,
            abi: ABI,
            calls: [
                {
                    reference: index,
                    methodName: "balanceOf",
                    methodParameters: [address],
                },
            ],
        };
    });
    const wallets = yield multicall.call(contractCallContext);
    for (const item of Object.entries(wallets.results)) {
        // console.log(Object.values(item));
        let balance = Object.values(item);
        // console.log(balance[0]);
        // console.log(balance[1]);
        console.log(Object.values(balance));
        const test = Object.values(balance);
        console.log(test[1]);
        // const [ wallet, resultObj] = Object.keys(item);
        // const balanceHex = resultObj.callsReturnContext[0].returnValues[0].hex;
        // console.log(
        // `address ${wallet} have balance ${web3.utils.fromWei(balanceHex)} WETH`
        // );
    }
});
init();
//# sourceMappingURL=index.js.map