// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public contractBalance;

    event Deposit(address from, uint256 amount);
    event Withdraw(address to, uint256 amount);
    event Transfer(address to, uint256 amount);

    constructor(uint initBalance) payable {
        owner = (msg.sender);
        contractBalance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount should be greater than 0");
        contractBalance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_withdrawAmount > 0, "Withdrawal amount should be greater than 0");
        require(contractBalance >= _withdrawAmount, "Insufficient Contract Balance");

        payable(msg.sender).transfer(_withdrawAmount);
        contractBalance -= _withdrawAmount;
        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function transfer(address _to, uint256 _amount) public payable {
        require(_to != address(0), "Invalid recipient address");
        require(_to != address(this), "Cannot transfer to the contract");
        require(msg.sender == owner, "You are not the owner of this account");
        require(contractBalance >= _amount, "Insufficient Contract Balance");

        payable(_to).transfer(_amount);
        contractBalance -= _amount;

        emit Transfer(_to, _amount);
    }
}
