import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState("");

  const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        setEthWallet(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        handleAccount(accounts);
      }
    };
    initWallet();
  }, []);

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
      getATMContract();
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
  };

  const getATMContract = () => {
    if (!ethWallet) {
      console.error("Ethereum wallet is not connected");
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const ContractBalance = await atm.getBalance();
      const balance = utils.formatUnits(ContractBalance, "wei");
      setBalance(balance);
    }
  };

  const deposit = async () => {
    if (atm) {
      const depositAmountWei = utils.parseEther(depositAmount.toString());
      let tx = await atm.deposit({ value: depositAmountWei });
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      const withdrawAmountWei = utils.parseEther(withdrawAmount.toString());
      console.log("withdrawAmountWei: ", withdrawAmountWei);
      let tx = await atm.withdraw(withdrawAmountWei);
      await tx.wait();
      getBalance();
    }
  };

  const transfer = async () => {
    if (atm) {
      try {
        const transferAmountWei = utils.parseEther(transferAmount.toString());
        const tx = await atm.transfer(recipientAddress, transferAmountWei);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error during transfer: ", error);
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="main">
        <div className="user-details">
          <h4>Your Account:</h4>
          <p>{account}</p>
          <h4>Your Balance:</h4>
          {balance !== undefined ? (
            <h2>{ethers.utils.formatEther(balance)} ETH</h2>
          ) : (
            <h2>0</h2>
          )}
        </div>

        <div className="transaction-section">
          <div className="deposit">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Deposit Amount"
            />
            <button onClick={deposit}>Deposit</button>
          </div>

          <div className="withdraw">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Withdraw Amount"
            />
            <button onClick={withdraw}>Withdraw</button>
          </div>

          <div className="transfer">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Recipient Address"
            />
            <div className="transfer-amount">
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Transfer Amount"
              />
              <button id="transferbutton" onClick={transfer}>Transfer</button>
            </div>
          </div>
        </div>
        <style jsx>
          {`
            .main {
              flex-direction: column;
            }

            h4 {
              margin-bottom: -10px;
              color: #bbbbbb;
            }

            .transfer-amount {
              margin-top: 10px;
            }

            .withdraw {
              margin-bottom: 25px;
            }

            .user-details {
              margin-bottom: 40px;
              background: #1652f0;
              padding: 10px;
              padding-left: 20px;
              border-radius: 30px;
              color: white;
              font-weight: bold;
            }

            .transaction-section {
              display: flex;
              flex-direction: column;
              gap: 20px;
              margin-bottom: 40px;
              margin-left: 30px;
              text-align: center;
            }

            input {
              padding: 10px;
              margin-right: 10px;
              border: 1px solid #ccc;
              border-radius: 10px;
            }

            button {
              padding: 10px 15px;
              background-color: #1652f0;
              width: 90px;
              color: white;
              border: none;
              border-radius: 10px;
              cursor: pointer;
            }
          `}
        </style>
      </div>
    );
  };

  return initUser();
}
