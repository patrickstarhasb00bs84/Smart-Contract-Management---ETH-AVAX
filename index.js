import { useState, useEffect } from "react";
import { ethers } from "ethers";
import styled from "styled-components";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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
      setBalance(ethers.utils.formatEther(ContractBalance));
    }
  };

  const deposit = async () => {
    if (atm && parseFloat(depositAmount) > 0) {
      try {
        const depositAmountWei = ethers.utils.parseEther(depositAmount);
        let tx = await atm.deposit({ value: depositAmountWei });
        await tx.wait();
        getBalance();
        setDepositAmount('');
      } catch (error) {
        console.error("Deposit Error:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm && parseFloat(withdrawAmount) > 0) {
      try {
        const withdrawAmountWei = ethers.utils.parseEther(withdrawAmount);
        let tx = await atm.withdraw(withdrawAmountWei);
        await tx.wait();
        getBalance();
        setWithdrawAmount('');
      } catch (error) {
        console.error("Withdrawal Error:", error);
      }
    }
  };

  const transfer = async () => {
    if (atm && ethers.utils.isAddress(recipientAddress) && parseFloat(transferAmount) > 0) {
      try {
        const transferAmountWei = ethers.utils.parseEther(transferAmount);
        const tx = await atm.transfer(recipientAddress, transferAmountWei);
        await tx.wait();
        getBalance();
        setTransferAmount('');
        setRecipientAddress('');
      } catch (error) {
        console.error("Transfer Error:", error);
      }
    }
  };

  return (
    <Container>
      {!ethWallet ? (
        <Message>Please install MetaMask to use this application.</Message>
      ) : !account ? (
        <Button onClick={connectAccount}>Connect your MetaMask wallet</Button>
      ) : (
        <WalletInfo>
          <Header>Welcome, {account}</Header>
          <Balance>Balance: {balance} ETH</Balance>
          <InputSection>
            <StyledInput type="text" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="ETH to Deposit"/>
            <Button onClick={deposit}>Deposit</Button>
          </InputSection>
          <InputSection>
            <StyledInput type="text" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="ETH to Withdraw"/>
            <Button onClick={withdraw}>Withdraw</Button>
          </InputSection>
          <InputSection>
            <StyledInput type="text" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} placeholder="Recipient Address"/>
            <StyledInput type="text" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="ETH to Transfer"/>
            <Button onClick={transfer}>Transfer</Button>
          </InputSection>
        </WalletInfo>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Message = styled.p`
  color: #444;
  font-size: 1.2rem;
`;

const WalletInfo = styled.div`
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  width: 400px;
  margin-top: 20px;
`;

const Header = styled.h1`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const Balance = styled.h2`
  color: #555;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

const StyledInput = styled.input`
  padding: 8px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 200px;
`;

const InputSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
