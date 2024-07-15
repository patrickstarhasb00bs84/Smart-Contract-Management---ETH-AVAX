# Smart Contract Management

This project is a smart contract for managing tokens on Ethereum and Avalanche networks, focusing on balance handling, ownership control, and token locking.

## Description

The `Assessment` smart contract is designed to provide a secure and transparent way to manage token balances and ownership. It includes functionality for depositing and withdrawing tokens, locking and unlocking tokens, and transferring ownership of the contract. Events are used to ensure transparency and track important actions within the contract. The contract is ideal for applications that require robust token management and clear ownership control on blockchain platforms.

## Getting Started

### Installing

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/assessment-smart-contract.git
    ```
2. **Navigate to the project directory**:
    ```bash
    cd assessment-smart-contract
    ```

### Executing program

1. **Compile the contract**:
    ```bash
    solc --optimize --bin Assessment.sol -o build/
    ```
2. **Deploy the contract using a tool like Remix or Truffle**.
3. **Interact with the contract**:
    - Use a web3 provider like MetaMask or directly interact using Gitpod console or Visual Studios Code.

### Starter Next/Hardhat Project

After cloning the github, you will want to do the following to get the code running on your computer.

1. Inside the project directory, in the terminal type: npm i
2. Open two additional terminals in your VS code
3. In the second terminal type: npx hardhat node
4. In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
5. Back in the first terminal, type npm run dev to launch the front-end.

After this, the project will be running on your localhost. 
Typically at http://localhost:3000/

# Help

For common issues:

Ensure you have the correct version of Solidity (v0.8.9 or compatible).
Make sure your web3 provider (like MetaMask) is connected to the correct network (Ethereum or Avalanche).

# Authors

Mark Revin Fragata

# License

This project is licensed under the MIT License - see the LICENSE.md file for details.
