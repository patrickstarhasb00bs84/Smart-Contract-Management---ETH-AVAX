import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showAccount, setShowAccount] = useState(true);
  const [transactionAmount, setTransactionAmount] = useState(1);
  const [recipientAddress, setRecipientAddress] = useState('');
  
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;
  const ethLogo = "https://www.pngall.com/wp-content/uploads/10/Ethereum-Logo-PNG-HD-Image.png"
  
  const handleRecipientChange = (e) => {
    setRecipientAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    if (e.target.value <0) {
      setTransactionAmount(0);
      return;
    }
    else if (e.target.value > balance) {
      setTransactionAmount(balance);
      return;
    }
    setTransactionAmount(parseFloat(e.target.value)); // Parse the input value as a float
  };

  // Validate the transaction amount against the available balance
  const isValidTransactionAmount = () => {
    return balance !== undefined && transactionAmount > 0 && transactionAmount <= balance;
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account[0]); // we only care about the first account
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      const selectedAccount = accounts[0];
      console.log("Account connected: ", selectedAccount);
      setAccount(selectedAccount);
    } else {
      console.log("No account found");
    }
  };
  

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const toggleAccount = () => {
    setShowAccount(!showAccount);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    try {
      if (atm && isValidTransactionAmount()) {
        let tx = await atm.deposit(transactionAmount);
        await tx.wait();
        getBalance();
      } else {
          console.log('Invalid transaction amount or insufficient balance');
        }
     } catch (error) {
      if (error.code === 'ACTION_REJECTED') {
        console.log('User rejected the deposit transaction.');
      } else {
        console.error('Unhandled error:', error);
      }
    }
  };
  
  const withdraw = async () => {
    try {
      if (atm && isValidTransactionAmount()) {
        let tx = await atm.withdraw(transactionAmount);
        await tx.wait();
        getBalance();
      } else {
          console.log('Invalid transaction amount or insufficient balance');
      }
    } catch (error) {
      if (error.code === 'ACTION_REJECTED') {
        console.log('User rejected the withdraw transaction.');
      } else {
        console.error('Unhandled error:', error);
      }
    }
  };
  
  const burn = async () => {
    try {
      if (atm && isValidTransactionAmount()) {
        let tx = await atm.burn(transactionAmount);
        await tx.wait();
        getBalance();
      } else {
          console.log('Invalid transaction amount or insufficient balance');
      }
    } catch (error) {
      if (error.code === 'ACTION_REJECTED') {
        console.log('User rejected the burn transaction.');
      } else {
        console.error('Unhandled error:', error);
      }
    }
  }; 


  const inputStyle = {
    padding: '8px',
    margin: '10px',
    borderRadius: '5px',
    border: '1px solid #FFD700',
    backgroundColor: '#0000',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    maxWidth: '30px',
    padding: '5px',
  };

  const inputStyle2 = {
    padding: '8px',
    margin: '10px',
    borderRadius: '5px',
    border: '1px solid #FFD700',
    backgroundColor: '#0000',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    maxWidth: '50x',
    width: '90px',
    padding: '5px',
  };


  // Styling with animations and background color
  const containerStyle = {
    textAlign: "center",
    backgroundColor: "#10084F",
    padding: "20px 10px 40px 10px",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    margin: "20px auto",
    maxWidth: "500px",
    animation: "fadeIn 1s ease-in-out",
    font: "16px sans-serif",
    transition: "background-color 0.3s ease-in-out",
    color: "#ffffff",
    borderRadius: "20px",
    background: "linear-gradient(to right, #10090F, #1B116A)",
  };
  
  const spanStyle = {
    color: '#736b94',
    fontSize: '22px',
    fontWeight: 'bold',
  };

  const buttonStyle = {
    backgroundColor: "transparent",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    margin: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease-in-out, transform 0.1s ease-in-out",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    animation: "buttonFadeIn 0.5s ease-in-out",
    backgroundImage: "linear-gradient(to right, #FFD700, #B8860B)", // Gold to Dark Gold gradient
    borderRadius: "20px",
    borderColor: "#FFD700",
    fontWeight: "bold",
    fontSize: "14px",
    

    // Hover effect to darken the gradient
    "&:hover": {
    backgroundImage: "linear-gradient(to right, #FFA500, #8B4513)", // Darken the gradient on hover
  },
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to make transactions.</p>
    }

    if (!account) {
      return <button style={buttonStyle} onClick={connectAccount}>Connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }
    //When the wallet is connected, show the balance and buttons
    return (
      <div>
        <p style={{fontSize : "20px"}}>Your Balance: <span style= {spanStyle}>{balance}</span> <img src={ethLogo} alt="Ethereum Logo" style={{ width: '13px', height: '19px' }} /></p>
        <div>
        <input
          type="number"
          value={transactionAmount}
          onChange={handleAmountChange}
          placeholder="Enter amount" // Placeholder text
          style={inputStyle}
        />
        </div>
        <div></div>
        <button style={buttonStyle} onClick={deposit}>Deposit {transactionAmount} ETH</button>
        <button style={buttonStyle} onClick={withdraw}>Withdraw {transactionAmount} ETH</button>
        <button style={buttonStyle} onClick={burn}>Burn {transactionAmount} ETH</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main style={containerStyle} className="container">
      <header>
        <h1 style={{ color: "#ffffff" }}>Welcome to ETH Manager!</h1>
      </header>
      <div>
        {account && (
          <>
            {showAccount ? (
              <p style={{fontSize : "20px"}}>Your Account: <span style={{color : "#cacaca"}}>{account}</span></p>
            ) : (
              <p style={{fontSize : "20px"}}>Your Account: ************</p>
            )}
            <button onClick={toggleAccount}>
              {showAccount ? "🙉" : "🙈"}
            </button>
          </>
        )}
        {initUser()}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
  
        @keyframes buttonFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
  
        button {
          background-color: transparent;
          color: gold;
          border: none;
          padding: 10px;
          margin: 5px;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
          animation: buttonFadeIn 0.5s ease-in-out;
          border-radius: 20px;
        }
  
        button:hover {
          background-color: #ffcd3c; /* Darken the color on hover */
          transform: translateY(-2px);
        }
  
        button:active {
          transform: translateY(1px);
        }
      `}</style>
    </main>
  );
}