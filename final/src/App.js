import "./App.css";
import { useEffect, useRef, useState } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { formatEther, formatUnits } from "@ethersproject/units";
import Modal from "react-modal";
import Web3 from "web3";
import { injected, walletconnect } from "./connectors";

const WETH_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Withdrawal", "type": "event" }]
const DD2_ABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const MASTERCHEF_ABI = [{ "inputs": [{ "internalType": "contract DD2Token", "name": "_dd2", "type": "address" }, { "internalType": "uint256", "name": "_dd2PerBlock", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "EmergencyWithdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "inputs": [], "name": "dd2", "outputs": [{ "internalType": "contract DD2Token", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "dd2PerBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_from", "type": "uint256" }, { "internalType": "uint256", "name": "_to", "type": "uint256" }], "name": "getBlocks", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "pendingDD2", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "updatePool", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userInfo", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "weth", "outputs": [{ "internalType": "contract IWETH", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const WETH_ADDRESS = "0xc778417e063141139fce010982780140aa0cd5ab";
const DD2_ADDRESS = "0xb1745657CB84c370DD0Db200a626d06b28cc5872";
const MASTERCHEF_ADDRESS = "0x9da687e88b0A807e57f1913bCD31D56c49C872c2";
const TYPE = {
  STAKE: 0,
  WITHDRAW: 1,
};

function App() {
  const web3Instance = useRef();
  const [blockNumber, setBlockNumber] = useState();
  const [wethBalance, setWethBalance] = useState();
  const [earn, setEarn] = useState();
  const [sharePool, setSharePool] = useState();
  const [stake, setStake] = useState();
  const [stakeTotal, setStakeTotal] = useState();
  const [isOpenModal, setIsOpenModal] = useState(0);
  const [isApproval, setIsApproval] = useState(0);
  const [data, setData] = useState({
    type: TYPE.WITHDRAW,
    value: 0,
    display: 0,
  });

  const { active, chainId, library, account, activate } = useWeb3React();

  useEffect(() => {
    if (!!library) {
      let stale = false;

      library
        .getBlockNumber()
        .then((blockNumber) => {
          if (!stale) {
            setBlockNumber(blockNumber);
          }
        })
        .catch((e) => {
          console.log(`===EROR getBlockNumber: `, e);
        });

      const updateBlockNumber = (blockNumber) => {
        setBlockNumber(blockNumber);
      };
      library.on("block", updateBlockNumber);

      return () => {
        stale = true;
        library.removeListener("block", updateBlockNumber);
        setBlockNumber(undefined);
      };
    }
  }, [library]);

  useEffect(() => {
    if (!!library && account) {
      let stale = false;

      library
        .getBalance(account)
        .then(balance => {
          if (!stale) {
            console.log(`Get weth balance: `, balance);
            setWethBalance(balance);
          }
        })
        .catch(() => {
          if (!stale) {
            setWethBalance(null);
          }
        });

      getAccountInfo();

      return () => {
        stale = true;
        setWethBalance(undefined);
      };
    }
  }, [library, account]);

  const convertBalance = (amount, decimals) => {
    return parseFloat(formatUnits(amount, decimals)).toFixed(2);
  };

  const convertBalanceFromWei = (amount) => {
    return parseFloat(Web3.utils.fromWei(amount, "ether")).toFixed(2);
  };

  const getAccountInfo = async () => {
    const web3Instance = new Web3(window.web3.currentProvider);
    const wethSmartContract = new web3Instance.eth.Contract(
      WETH_ABI,
      WETH_ADDRESS
    );
    const dd2SmartContract = new web3Instance.eth.Contract(
      DD2_ABI,
      DD2_ADDRESS
    );
    const mtcSmartContract = new web3Instance.eth.Contract(
      MASTERCHEF_ABI,
      MASTERCHEF_ADDRESS
    );

    //account info
    const user = await mtcSmartContract.methods.userInfo(account).call();
    const stakedAmount = convertBalanceFromWei(user.amount);
    setStake(stakedAmount);

    const balanceTotal = await wethSmartContract.methods
      .balanceOf(MASTERCHEF_ADDRESS)
      .call();
    const stakedAmountTotal = convertBalanceFromWei(balanceTotal);
    setStakeTotal(stakedAmountTotal);

    const percentPool = Math.round((stakedAmount / stakedAmountTotal) * 100);
    setSharePool(percentPool);

    const dd2Balance = await dd2SmartContract.methods.balanceOf(account).call();
    const decimals = await dd2SmartContract.methods.decimals().call();
    setEarn(convertBalance(dd2Balance, decimals));
  };

  const handleSubmitModal = async () => {
    setIsOpenModal(false);
    if (isNaN(data.value)) {
      return;
    }
    const web3 = new Web3(window.web3.currentProvider);
    const mtcInstace = new web3.eth.Contract(MASTERCHEF_ABI, MASTERCHEF_ADDRESS);
    const amout = Web3.utils.toWei(data.value, 'ether');

    try {
      if (data.type === 0) {
        await mtcInstace.methods.deposit(amout).send({ from: account });
        getAccountInfo();
        return;
      }
      await mtcInstace.methods.withdraw(amout).send({ from: account });
      getAccountInfo();
    } catch(e) {
      console.log(`Error `, e);
    }
  }

  const handleApproval = async () => {
    const web3Instance = new Web3(window.web3.currentProvider);
    const wethSmartContract = new web3Instance.eth.Contract(
      WETH_ABI,
      WETH_ADDRESS
    );
    await wethSmartContract.methods
      .approve(MASTERCHEF_ADDRESS, (5000 * 10)^ 18)
      .call();
    setIsApproval(1);
  };

  const handleShowModal = (type) => {
    setIsOpenModal(1);
    const balance = type === 0 ? parseFloat(formatEther(wethBalance)).toPrecision(4) : 0
    let display = setData({
      type: type,
      display: balance,
      value: 0,
    });
  };

  const handleHarvest = async () => {
    const web3Instance = new Web3(window.web3.currentProvider);
    const mtcSmartContract = new web3Instance.eth.Contract(
      MASTERCHEF_ABI,
      MASTERCHEF_ADDRESS
    );

    await mtcSmartContract.methods.deposit(0).send({ from: account });
    getAccountInfo();
  };

  const handleConnect = (wallet) => {
    switch (wallet) {
      case "metamask":
        activate(injected);
        break;
      case "walletconnect":
        activate(walletconnect);
        break;
      default:
        break;
    }
  };

  const ConnectWallet = ({ handleConnected }) => {
    return (
      <div className="connect-wrapper">
        <button
          className="btn-form"
          onClick={() => handleConnected("metamask")}
        >
          <span className="span">Metamask</span>
        </button>
        <button
          className="btn-form"
          onClick={() => handleConnected("walletconnect")}
        >
          <span className="span">Wallet connect</span>
        </button>
      </div>
    );
  };

  const AccountInfo = () => {
    return (
      <div className="account-information">
        <div className="wallet-info">
          <p className="split">
            <span>Wallet address {account ?? "None..."}</span>
            <span>balance {wethBalance ? `${parseFloat(formatEther(wethBalance)).toPrecision(4)}` : `None`} WETH</span>
          </p>
        </div>
        <div className="stake-token">
          <p>Stake token</p>
          <div className="split">
            <span>Token earned {earn ?? 0} DD2</span>
            <button
              onClick={handleHarvest}
              className="btn-form btn-green"
            >
              Harvest
            </button>
          </div>
        </div>
        <div className="stake-action">
          {!isApproval ? (
            <button className="btn-form" onClick={handleApproval}>
              Approval
            </button>
          ) : (
            <div>
              <button className="btn-form" onClick={() => handleShowModal(0)}>
                Stake
              </button>
              <button className="btn-form" onClick={() => handleShowModal(1)}>
                Withdraw
              </button>
            </div>
          )}
        </div>

        <div className="pool">
          <p className="split">
            <span>Share of pool</span>
            <span>{sharePool} %</span>
          </p>
          <p className="split">
            <span>Your stake</span>
            <span>{stake} %</span>
          </p>
          <p className="split">
            <span>Your stake</span>
            <span>{stakeTotal} %</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="header">
        {active ? (
          AccountInfo()
        ) : (
          <ConnectWallet handleConnected={handleConnect}></ConnectWallet>
        )}
      </div>

      <Modal
        isOpen={isOpenModal}
        onRequestClose={() => { setIsOpenModal(0) }}
      >

        <div className="modal-container">
          <p class="header-form">{data.type ? 'WITHDRAW' : 'STAKE'}</p>

          <div className="modal-input">
            <input placeholder="input here" className="input-form" value={data.value} onChange={(e) => { setData({ ...data, value: e.target.value }) }}></input>
            <span className="label-form" onClick={() => {
              setData({ ...data, value: data.display })
            }}>MAX</span>
          </div>

          {
            data.type === 0
              ? <p style={{ padding: "5px"}}>Your balance {data.display} WETH</p>
              : <p style={{ padding: "5px"}}>Total staked {data.display} DD2</p>
          }
          <button className="btn-form" onClick={handleSubmitModal}>Submit</button>
        </div>

      </Modal>

    </div>
  );
}

export default App;
