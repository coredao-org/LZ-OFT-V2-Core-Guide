// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

// Import Hardhat plugins
import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
// eslint-disable-next-line import/no-unresolved
import './tasks/sendOFT'

// Import necessary types and constants
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

// Configure accounts based on available authentication method
const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

// Define Hardhat configuration
const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    evmVersion: 'paris',
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        // Base Sepolia Testnet Configuration using Infura
        'base-sepolia': {
            eid: EndpointId.BASESEP_V2_TESTNET, // Ensure this EndpointId exists in @layerzerolabs/lz-definitions
            url: process.env.RPC_URL_BASE, // Infura endpoint with API key
            accounts,
        },

        // CoreDAO Testnet Configuration
        'coredao-testnet': {
            eid: EndpointId.COREDAO_V2_TESTNET,
            url: process.env.RPC_URL_COREDAO_V2_TESTNET || 'https://rpc.test.btcs.network',
            accounts,
        },

        // Add other network configurations here if needed
    },
    namedAccounts: {
        deployer: {
            default: 0, // Wallet address at index 0 from the mnemonic or the first private key
        },
    },
}

export default config
