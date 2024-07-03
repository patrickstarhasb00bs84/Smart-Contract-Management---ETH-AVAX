// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public contractBalance;

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
    event Transfer(address indexed to, uint256 amount);

    constructor() payable {
        owner = payable(msg.sender);
        contractBalance = msg.value;
    }

    function getBalance() public view returns (uint256) {
        return contractBalance;
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

        (bool success, ) = payable(msg.sender).call{value: _withdrawAmount}("");
        require(success, "Transfer failed");
        contractBalance -= _withdrawAmount;
        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function transfer(address _to, uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_to != address(0), "Invalid recipient address");
        require(_to != address(this), "Cannot transfer to the contract itself");
        require(contractBalance >= _amount, "Insufficient Contract Balance");

        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "Transfer failed");
        contractBalance -= _amount;
        emit Transfer(_to, _amount);
    }
}
