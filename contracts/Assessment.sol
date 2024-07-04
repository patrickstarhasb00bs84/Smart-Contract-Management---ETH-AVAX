// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
   address payable public owner;
   uint256 public balance;
   
   event Deposit(uint256 amount);
   event Withdraw(uint256 amount);
   event Burn(uint256 amount);

   constructor(uint initBalance) payable {
       owner = payable(msg.sender);
       balance = initBalance;
   }

   function getBalance() public view returns(uint256){
       return balance;
   }

   function deposit(uint256 _amount) public payable {
       require(msg.sender == owner, "You are not the owner of this account");

       balance += _amount;

       emit Deposit(_amount);
   }

   error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

   function withdraw(uint256 _withdrawAmount) public {
       require(msg.sender == owner, "You are not the owner of this account");

       if (balance < _withdrawAmount) {
           revert InsufficientBalance({
               balance: balance,
               withdrawAmount: _withdrawAmount
           });
       }

       balance -= _withdrawAmount;

       emit Withdraw(_withdrawAmount);
   }

   function burn(uint256 _burnAmount) public {
       require(msg.sender == owner, "You are not the owner of this account");
       require(_burnAmount <= balance, "Insufficient balance");

       balance -= _burnAmount;

       emit Burn(_burnAmount);
   }
}
