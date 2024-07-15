import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [ownerError, setOwnerError] = useState(false);
  const [ownershipStatus, setOwnershipStatus] = useState(false);
  const [lockAmount, setLockAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      getWallet();
    } else {
      console.log("Please install MetaMask!");
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (ethWallet && account) {
      getATMContract();
    }
  }, [ethWallet, account]);

  const getWallet = async () => {
    if (ethWallet) {
      try {
        const accounts = await ethWallet.request({ method: "eth_accounts" });
        handleAccount(accounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balanceBigNumber = await atm.getBalance();
        setBalance(ethers.utils.formatEther(balanceBigNumber));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const checkOwnership = async () => {
    if (atm && account) {
      try {
        const isOwner = await atm.isOwner(account);
        setOwnershipStatus(isOwner);
      } catch (error) {
        console.error("Error checking ownership:", error);
      }
    }
  };

  const transferOwnership = async () => {
    if (atm && newOwner) {
      try {
        const tx = await atm.transferOwnership(newOwner);
        await tx.wait();
        alert(`Ownership transferred to ${newOwner}`);
        setNewOwner("");
      } catch (error) {
        setOwnerError(true);
        setTimeout(() => {
          setOwnerError(false);
        }, 5000);
      }
    }
  };

  const lockTokens = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseUnits(lockAmount, 18); 
        const tx = await atm.lockTokens(amountInWei);
        await tx.wait();
        alert(`Locked ${lockAmount} tokens`);
        getBalance(); 
      } catch (error) {
        console.error("Error locking tokens:", error);
      }
    }
  };

  const unlockTokens = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseUnits(lockAmount, 18); 
        const tx = await atm.unlockTokens(amountInWei);
        await tx.wait();
        alert(`Unlocked ${lockAmount} tokens`);
        getBalance(); 
      } catch (error) {
        console.error("Error unlocking tokens:", error);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseEther(depositAmount);
        const tx = await atm.deposit(amountInWei, { value: amountInWei });
        await tx.wait();
        alert(`Deposited ${depositAmount} ETH`);
        getBalance();
        setDepositAmount("");
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseEther(withdrawAmount);
        const tx = await atm.withdraw(amountInWei);
        await tx.wait();
        alert(`Withdrew ${withdrawAmount} ETH`);
        getBalance(); 
        setWithdrawAmount("");
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      console.log("Please connect to MetaMask.");
    } else {
      setAccount(accounts[0]);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this Locker.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount} className="btn-connect">Please connect your wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    checkOwnership();

    return (
      <div>
        <p>Your Locker Account Address: {account}</p>
        <p>Your Balance: {balance}</p>
        <button
          onClick={() => {
            transferOwnership();
          }}
          className="btn-action"
        >
          Change Owner
        </button>
        <input
          type="text"
          placeholder="New owner address"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          className="input-text"
        />
        {ownerError && <p className="error">Error: Unable to change the Owner</p>}
        {ownershipStatus ? (
          <p>You are the owner of the contract.</p>
        ) : (
          <p>You are not the owner of the contract.</p>
        )}
        <button onClick={checkOwnership} className="btn-action">Check Ownership</button>

        <div className="section">
          <h3>Deposit</h3>
          <input
            type="text"
            placeholder="Amount to deposit"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={deposit} className="btn-action">Deposit</button>
        </div>

        <div className="section">
          <h3>Withdraw</h3>
          <input
            type="text"
            placeholder="Amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={withdraw} className="btn-action">Withdraw</button>
        </div>

        <div className="section">
          <h3>Lock Tokens</h3>
          <input
            type="text"
            placeholder="Amount to lock"
            value={lockAmount}
            onChange={(e) => setLockAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={lockTokens} className="btn-action">Lock Tokens</button>
        </div>

        <div className="section">
          <h3>Unlock Tokens</h3>
          <input
            type="text"
            placeholder="Amount to unlock"
            value={lockAmount}
            onChange={(e) => setLockAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={unlockTokens} className="btn-action">Unlock Tokens</button>
        </div>
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Module 2 Locker Dapps!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          font-family: Arial, sans-serif;
        }
        .error {
          color: red;
        }
        .btn-connect, .btn-action {
          background-color: #6200ea;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        }
        .btn-connect:hover, .btn-action:hover {
          background-color: #3700b3;
        }
        .input-text {
          padding: 10px;
          margin-top: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          width: calc(100% - 22px);
          max-width: 300px;
        }
        .section {
          margin: 20px 0;
        }
        header h1 {
          color: #333;
        }
      `}</style>
    </main>
  );
}
