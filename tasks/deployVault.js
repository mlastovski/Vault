const config = require("config");

/*
  Deployment: 
  $ npx hardhat deployVault --network hardhat

  Configuration:
  weth -> WETH smart contract address

  In order to change params - go to the config/default.json -> contractsConfig. 
*/
task("deployVault", "Deploys contract Vault.sol").setAction(async () => {
	const deploymentConfig = config.get("deploymentConfig");
    const contractName = "Vault"
	const { deploymentParams } = deploymentConfig;

	const Vault = await ethers.getContractFactory(contractName);
	const vault = await Vault.deploy(deploymentParams.weth);

	await vault.deployed();

	const contractArtifact = require("../artifacts/contracts/Vault.sol/Vault.json");
	const fs = require("fs");

	const pathToSaveABI = `./utils/deployedContractsABI/${contractName}.json`;
	fs.writeFileSync(pathToSaveABI, JSON.stringify(contractArtifact.abi));

	const contractAddress = vault.address;
	const transactionInfo = vault.deployTransaction;

	const transactionHash = transactionInfo.hash;
	const { blockNumber } = transactionInfo;
	const { gasPrice } = transactionInfo;
	const { gasLimit } = transactionInfo;
	const networkChainId = transactionInfo.chainId;

	const line = "\n--------------------------------------------\n";

	console.log(
		`
      \nContract ${contractName} is now deployed
      ${line}\nContract address: ${contractAddress}
      ${line}\nNetwork chainId: ${networkChainId}
      ${line}\nTransaction hash: ${transactionHash}
      ${line}\nBlock number: ${blockNumber}
      ${line}\nGas price: ${gasPrice}
      ${line}\nGas limit: ${gasLimit}
      ${line}
      `
	);
});
