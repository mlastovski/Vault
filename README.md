# Vault Smart Contract

## Installation and deployment

Clone this repo:

```console
$ git clone git@github.com:mlastovski/Vault.git
```

Change directory to the project's root folder:

```console
$ cd ./Vault
```

Install dependencies using npm:

```console
$ npm i
```

#### Head to `config/default.json` and provide data.

- url - Alchemy or Infura etc. HTTPS API KEY
- weth - WETH smart contract address on mainnet

Check if everything is working correctly

```console
$ npx hardhat
```

### Testing

In order to test the contract:

```console
$ npx hardhat test
```

or

```console
$ npx hardhat coverage
```

This smart contract has 100% solidity-coverage.
![alt text](./utils/coverage.png)

### Deployment

Compile code:

```console
$ npx hardhat compile
```

Deploy to the live network:

```console
$ npx hardhat deployVault --network hardhat
```
