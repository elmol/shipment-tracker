require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

const RSKTESTNET_RPC_URL = process.env.RSKTESTNET_RPC_URL || "https://public-node.testnet.rsk.co"
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL || "https://eth-kovan.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "your private key"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    kovan: {
      url: KOVAN_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    rsktestnet: {
      url: RSKTESTNET_RPC_URL,
      chainId: 31,
      accounts: [PRIVATE_KEY],
    }
  }
};
