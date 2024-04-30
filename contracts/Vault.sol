// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IWETH} from "./interfaces/IWETH.sol";

contract Vault {
	using SafeERC20 for IERC20;

	address immutable weth;

	mapping(address => uint256) private ethBalances;
	mapping(address => mapping(address => uint256)) private tokenBalances;

	constructor(address _weth) {
		weth = _weth;
	}

	receive() external payable {}

	function depositToken(address token, uint256 amount) external {
		require(amount > 0, "Vault: amount should be greater than zero");

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][token] += amount;
	}

	function depositETH() external payable {
		ethBalances[msg.sender] += msg.value;
	}

	function withdrawToken(address token) external {
		uint256 amount = tokenBalances[msg.sender][token];

		IERC20(token).transfer(msg.sender, amount);
		tokenBalances[msg.sender][token] -= amount;
	}

	function withdrawETH() external {
		payable(msg.sender).transfer(ethBalances[msg.sender]);
		ethBalances[msg.sender] = 0;
	}

	function wrapETH() external {
		uint256 amount = ethBalances[msg.sender];
		require(amount > 0, "Vault: no ETH to wrap");

		ethBalances[msg.sender] -= amount;

		IWETH(weth).deposit{value:amount}();
		
		tokenBalances[msg.sender][weth] += amount;
	}

	function unwrapETH(uint256 amount) external {
		require(
			amount > 0 && amount <= tokenBalances[msg.sender][weth], 
			"Vault: amount should be > 0 and <= your balance"
		);

		tokenBalances[msg.sender][weth] -= amount;

		IWETH(weth).withdraw(amount);

		ethBalances[msg.sender] += amount;
	}

	function getETHBalance(address from) external view returns (uint256) {
		return ethBalances[from];
	}

	function getTokenBalance(
		address from, 
		address token
	) 
		public 
		view 
		returns (uint256) 
	{
		return tokenBalances[from][token];
	}

	function getWETHAddress() public view returns (address) {
		return weth;
	}
}
