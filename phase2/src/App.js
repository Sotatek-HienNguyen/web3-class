import { useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";
import ABI from "./ABI.json";

const web3 = new Web3("wss://rinkeby-light.eth.linkpool.io/ws");
const contractAddress = "0xc778417e063141139fce010982780140aa0cd5ab";
const contractInstance = new web3.eth.Contract(ABI, contractAddress);

function App() {
  const [accountAddress, setAccountAddress] = useState("");
  const [ethBalance, setEthBalance] = useState(0);
  const [wethBalance, setWethBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [status, SetStatus] = useState({
    withdraw: 0,
    deposit: 0,
  });


  
  const connectWallet = async () => {
    try {
      const walletInfo = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const [address] = walletInfo;
      if (walletInfo.length) setAccountAddress(address);

      const ethBalanceOfAccountHex = await web3.eth.getBalance(address);
      const ethBalanceOfAccount = Web3.utils.fromWei(
        ethBalanceOfAccountHex.toString(),
        "ether"
      );
      setEthBalance(ethBalanceOfAccount);

      const wethBalanceOfAccountHex = await contractInstance.methods
        .balanceOf(address)
        .call();
      const wethBalanceOfAccount = Web3.utils.fromWei(
        wethBalanceOfAccountHex.toString(),
        "ether"
      );
      setWethBalance(wethBalanceOfAccount);
    } catch (error) {
      console.log("connect fail");
    }
  };

  const withdraw = async () => {
    if (!accountAddress) console.log("You must connect to wallet");

    console.log(accountAddress);
    const amountWithdraw = web3.utils.toWei(withdrawAmount.toString(), "ether");
    const contract = await new web3.eth.Contract(ABI, contractAddress);
    contract.methods
      .withdraw(amountWithdraw)
      .send({
        from: accountAddress,
      })
      .on("receipt", (receipt) => {
        SetStatus({
          withdraw: 1
        });
      });
  };

  const deposit = () => {
    const amount = web3.utils.toWei(depositAmount, 'ether');
    myContract.methods
      .deposit()
      .send({
        from: address,
        value: amount
      })
      .on("receipt", function (receipt) {
        SetStatus({
          deposit: 1
        });
      });
  }
  return (
    <div className="App">
      <button onClick={connectWallet}>Connect web3 to metamask</button>
      <p>
        address: {accountAddress ? accountAddress : "please connect to wallet"}
      </p>
      <p>balances: {wethBalance ? wethBalance : "..."} Weth</p>
      <p> {ethBalance ? ethBalance : "..."} Eth</p>

      <input defaultValue={0} onChange={(e) => setWithdrawAmount(e.target.value)} />
      <button onClick={() => withdraw()}>Withdraw</button>
      <p>{status.withdraw ? "Withdraw completed" : ""}</p>


      <input defaultValue={0} onChange={(e) => setDepositAmount(e.target.value)} />
      <button onClick={() => deposit()}>Deposit</button>
      <p>{status.deposit ? "deposit completed" : ""}</p>
    </div>
  );
}

export default App;
