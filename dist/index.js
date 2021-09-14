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
    let options = {
        filter: {},
        fromBlock: blockNumber,
        toBlock: 'latest',
    };
    console.log(`${latestBlock} ${blockNumber}`);
    contract.getPastEvents("Transfer", options)
        .then((result) => console.log("======Query event transfer on the last 100 block", result))
        .catch((err) => console.log("Err", err.message));
    contract.events.Transfer()
        .on("data", (event) => {
        console.log("=====Listen event transfer", event);
    })
        .on("error", console.error);
});
init();
//# sourceMappingURL=index.js.map