const Web3 = require("web3");
const ABI = require("../contracts/ABI.json");

const init = async () => {
  const web3 = new Web3("wss://rinkeby-light.eth.linkpool.io/ws");
  const contractAddress = "0xc778417e063141139fce010982780140aa0cd5ab";
  const contract = await new web3.eth.Contract(ABI, contractAddress);

  const name = await contract.methods.name().call();
  const symbol = await contract.methods.symbol().call();
  console.log(name);

  const addressCheckBalance = "0xf46982122155B776F225cfCbDC4156f3AAE467B7";
  const balance = await contract.methods.balanceOf(addressCheckBalance).call();

  console.log(`=====BalanceOf ${addressCheckBalance}: ${balance} ${symbol}`);

  const latestBlock = await web3.eth.getBlockNumber();
  const blockNumber = latestBlock - 2;

  let options = {
    filter: {},
    fromBlock: blockNumber,
    toBlock: latestBlock,
  };
  console.log(`${latestBlock} ${blockNumber}`);

  contract.getPastEvents("Transfer", options)
    .then((result: any) =>
      console.log("======Query event transfer on the last 100 block", result)
    )
    .catch((err: any) => console.log("Err", err.message));

  contract.events.Transfer()
    .on("data", (event: any) => {
      console.log("=====Listen event transfer", event);
    })
    .on("error", console.error);
};
init();
