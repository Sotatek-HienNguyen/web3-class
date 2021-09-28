import logo from "./logo.svg";
import "./App.css";
import { useRef, useState } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { formatEther, formatUnits } from "@ethersproject/units";

const WETH_ABI = "./ABI/weth.json";
const DD2_ABI = "./ABI/dd2.json";
const MASTERCHEF_ABI = "./ABI/masterchef.json";
const WETH_ADDRESS = "0xc778417e063141139fce010982780140aa0cd5ab";
const DD2_ADDRESS = "0xb1745657CB84c370DD0Db200a626d06b28cc5872";
const MASTERCHEF_ADDRESS = "0x9da687e88b0A807e57f1913bCD31D56c49C872c2";

function App() {
  const web3Instance = useRef();
  const [blockNumber, setBlockNumber] = useState(null);
  const [ethBlance, setEthBalance] = useState(null);
  const [earn, setEarn] = useState();
  const [sharePool, setSharePool] = useState();
  const [stake, setStake] = useState();
  const [stakeTotal, setStakeTotal] = useState();
  const [isOpenModal, setIsOpenModal] = useState(0);
  const [isApproval, setIsApproval] = useState(0);
  const [modalData, setModalData] = useState({
    title: "withdraw",
    value: null,
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
        .then((balance) => {
          if (!stale) {
            setEthBalance(balance);
          }
        })
        .catch((e) => {
          console.log(`===EROR getBalance: `, e);
        });

      getAccountInfo();

      return () => {
        stale = true;
        setEthBalance(undefined);
      };
    }
  }, [library, account]);

  const convertBalance = (amount, decimals) => {
    return parseFloat(formatUnits(amount, decimals)).toFixed(2);
  };

  const convertBalanceFromWei = (amount) => {
    return parseFloat(web3.utils.fromWei(amount, "ether")).toFixed(2);
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

  const handleSubmitModal = async () => {
    setIsOpenModal(0);

    if (isNaN(dataModal.value)) {
      return;
    }

    const mtcSmartContract = new web3Instance.eth.Contract(
      MASTERCHEF_ABI,
      MASTERCHEF_ADDRESS
    );
    const amount = convertBalanceFromWei(dataModal.value);

    if(dataModal.title == 'stake') {

    }

    if(dataModal.title == 'withdraw') {
      
    }
  };

  return <div className="App"></div>;
}

export default App;
