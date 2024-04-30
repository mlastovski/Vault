const config = require("config");

require("@nomicfoundation/hardhat-toolbox");
require('solidity-coverage');

// Importing tasks
require("./tasks/deployVault");

const hardhatConfig = config.get("hardhatConfig");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: hardhatConfig.solidity.solidityVersion,
		settings: {
			optimizer: {
				enabled: hardhatConfig.solidity.optimizerEnabled,
				runs: hardhatConfig.solidity.optimizerRuns,
			},
		},
	},

	networks: {
		hardhat: {
			forking: {
				url: hardhatConfig.networks.hardhat.url,
				enabled: true,
			},
		},
	},

	mocha: {
		timeout: 100000000,
	},
};
