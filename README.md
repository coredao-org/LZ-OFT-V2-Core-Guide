# Complete Guide: Cross-Chain Token Transfers Using LayerZero's OFT V2 (Core Testnet to Base Sepolia Testnet)

![Core LayerZero OFT](https://github.com/user-attachments/assets/ac7382c0-6825-4fb8-91c2-5e022a2eca66)

## Introduction

This guide walks you through deploying and configuring an **OFT** (Omnichain Fungible Token) to facilitate cross-chain transfers of an ERC-20 token between **Core Testnet**, and **Base Sepolia Testnet** using **LayerZero's OFT V2 messaging protocol**. You'll learn how to set up your development environment with **Hardhat**, configure LayerZero endpoints, and execute cross-chain token transfers.

By the end of this guide, you will be able to:
- Set up and configure Hardhat for cross-chain deployments.
- Deploy an OFT contract for cross-chain token transfers.
- Configure LayerZero endpoints and set up cross-chain peers.
- Execute cross-chain transfers between Base Sepolia and Core Testnet.

This guide is suitable for both beginners and experienced developers. We will clearly mark success criteria to ensure you're on track.

## Prerequisites

Before starting, make sure you have the following:

- VSCode: Installed for editing and running your code.
- Node.js: Download and install Node.js (which includes npm) from [Node.js official website](https://nodejs.org/).
- Infura Account: [Sign up here](https://infura.io/) for access to Base Sepolia Testnet.
- Metamask Wallet: Install [Metamask](https://metamask.io/) to manage your tokens.
- Test Funds:
  - Base Sepolia Testnet ETH: Required for deploying contracts and covering gas fees. You can get test funds from [Base Sepolia Faucet](https://thirdweb.com/base-sepolia-testnet).
  - Core Testnet Funds: Required for deploying contracts on Core Testnet. You can get these from the [Core Faucet](https://scan.test.btcs.network/faucet).

Ensure you have test tokens on both **Core Testnet** and **Base Sepolia Testnet** to complete the guide.

## Guide Start

1. Cd to the root of the working directory, I will be creating a directory on my Desktop for example purposes.

Run

```zsh
npx create-lz-oapp@latest
```

An ERC20 extended with core bridging logic from OApp, creating an [Omnichain Fungible Token (OFT)](https://docs.layerzero.network/v2/developers/evm/oft/quickstart):

An ERC20 extended with core bridging logic from OApp, creating an Omnichain Fungible Token (OFT):

✔ Where do you want to start your project? … ./my-lz-oapp ← rename your project here

✔ Which example would you like to use as a starting point? › **OFT**

✔ What package manager would you like to use in your project? › **pnpm**

This will initialize a repo with example contracts, cross-chain unit tests for sample contracts, custom LayerZero configuration files, deployment scripts, and more.

Here, it gives you the option of selecting how you’d like to store/name your project. I am putting **./core-layerzero-example**

Press **Enter** on your keyboard to proceed.

<img width="1512" alt="coreOft1" src="https://github.com/user-attachments/assets/456be22c-bed4-48d7-b100-52c7c2dff8f5">

1.1 Select **OFT**

Press **Enter** on your keyboard to proceed.

<img width="1512" alt="coreOft1 1" src="https://github.com/user-attachments/assets/2fbe5585-d116-4807-aebe-c0d5bb50cc33">

1.2 select **pnpm (recommended)**

1.3 Layerzero will then use pnpm to install recommended dependencies, press **enter/return** to proceed.

<img width="1512" alt="CoreOft1 3" src="https://github.com/user-attachments/assets/af0c0adb-083d-426d-ac4f-dd2b3f220d36">

1.4 I am now going to change into the directory using cd , and open Visual Studio Code from the current working directory using cd **core-layerzero-example/** and clicking enter

Inside the new working directory, open Visual Studio code using `code .`

<img width="1512" alt="coreOft1 5" src="https://github.com/user-attachments/assets/b2eb6293-608d-4d85-a5b2-f5a1419a4c4f">

2. Inside Visual Studio Code, we can now see the whole repo. Click on the **hardhat.config.ts** file, and navigate to the networks section within the file.

Notice our currently set networks: **Sepolia Testnet (sepolia-testnet)**, **Avalanche Testnet (avalanche-testnet)**, and **Amoy Testnet (amoy-testnet)
**

For `eid:`, you can see the EndpointId is being retrieved from the corresponding name that is passed, that LayerZero has support for, found [here](https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts).

For this guide, we will just be doing a token transfer between two networks, **Core Testnet**, and **Base Sepolia Testnet**. Reason being, tokens are free, and easily accessible on both networks to pay for gas fees, when deploying and transferring tokens.

For the ‘url’, you’re able to place one in the .env file, and call upon it here. We will be placing the hard coded value for our networks that LayerZero will automatically fall back on if there are no .env configurations.

2.1 We will be adding external networks, CoreDAO Testnet (core-testnet), and Base Sepolia Testnet (base-sepolia)

Follow the standard Hardhat process for adding external networks to your hardhat.config.ts, with the only additional requirement being that a LayerZero Endpoint has been deployed to the chain:

```typescript
// hardhat.config.ts
 networks: {
        // Base Sepolia Testnet Configuration using Infura
        'base-sepolia': {
            eid: EndpointId.BASESEP_V2_TESTNET, // Ensure this EndpointId exists in @layerzerolabs/lz-definitions
            url: 'process.env.RPC_URL_BASE', // Infura endpoint with API key
            accounts,
        },

        //CoreDAO Testnet Configuration
        'coredao-testnet': {
            eid: EndpointId.COREDAO_V2_TESTNET,
            url: process.env.RPC_URL_COREDAO_V2_TESTNET || 'https://rpc.test.btcs.network',
            accounts,
        },

     // Add other network configurations here if needed
    },
```

<img width="1512" alt="coreOft2" src="https://github.com/user-attachments/assets/e83136b2-555c-4984-89fe-e8bdc7bf2acb">

2.2 Also, ensure that your evmVersion is set to ‘**paris**’

Your full `hardhat.config.ts` file should look something like this:

```typescript

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
// import './tasks/sendOFT'

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
```
**Save your file**.

2.3 You now need to configure your `.env` file. Included in this example repo, is a `.env.example` file. Rename this to `.env` and include the following:

<img width="1512" alt="coreOft2 3" src="https://github.com/user-attachments/assets/f993d35a-542b-401d-beef-da4ed54fb560">

Get your **private key** from your **Metamask / EVM compatible wallet**. In this guide, we are using [Infura](https://app.infura.io/) to connect to Base Sepolia Testnet, to easily deploy.

2.4 Once you’ve signed up with Infura, configure the free API Key they give you, with Base Sepolia Testnet:

<img width="1512" alt="coreOft2 4" src="https://github.com/user-attachments/assets/1f072714-6168-43d3-be10-c6b6061b0c7c">

After saving your endpoint as **Base Sepolia**, click ‘**Save Changes**’. Navigate to ‘**Active Endpoints**’.

<img width="1512" alt="coreOft2 4 1" src="https://github.com/user-attachments/assets/f48b8dcc-06fc-44d4-90cb-463fca4bd097">

Copy the **Base** Active Endpoint URL.

After grabbing this, paste this after the **BASE_SEPOLIA_URL**= and save your `.env` file.

Your `.env` file should now be populated with your **Private Key** and **Infura API Key**.

Refer to these steps for adding **Base Sepolia** to your metamask: https://docs.base.org/docs/using-base/

2.5 Open a terminal inside of the root of your project, and write ‘**pnpm install**’

<img width="1512" alt="coreOft2 5" src="https://github.com/user-attachments/assets/37a6253a-5cdb-45d3-9fe8-7b64d74382c0">

If you see '**Already up to date**', all necessary dependencies are good to go.

3 We will now modify our OFT contract to your requirements for your use case.

Navigate to contracts, and select `MyOFT.sol`.

This contract is the default setup for an **OFT token**. It doesn't include any initial minting, which means that, by default, no tokens exist until an external function call or separate minting process creates them.

Below, is an updated version of this contract, with the added minting function, so that we have **100,000 tokens** to transfer between chains, upon deployment. 

<img width="1512" alt="coreOft3" src="https://github.com/user-attachments/assets/0c84d918-9420-4024-99fa-7394b2d6cc3b">

Your whole contract should be similar to the following if you want to retain the same basic functionality:

```solidity

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract MyOFT is OFT {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        // Mint tokens to the deployer's address (msg.sender)
        _mint(msg.sender, 100_000 * 10 ** 18);
    }
}
```

3.1 run 

```zsh
pnpm compile:hardhat
```

If successful, you should see something similar to: **Compiled 40 Solidity files successfully (evm target: paris)**.

<img width="1512" alt="coreOft3 1" src="https://github.com/user-attachments/assets/c95a4c08-c2f8-46ca-918c-2c2d7a168697">

3.2 Moving on, prior to deployment, let's ensure that we have enough gas for both chains.

First, for **Core Testnet Tokens**, navigate to: https://scan.test.btcs.network/faucet

After entering your Core testnet address, and completing the captcha, **1 tCORE** will be deposited into your Core Testnet wallet.

<img width="1509" alt="coreOft3 2" src="https://github.com/user-attachments/assets/6062343e-3a01-4d58-8acc-de4cef986a2d">

3.3 Let's do the same for **Base Sepolia**. Navigate to this faucet link:
https://thirdweb.com/base-sepolia-testnet

First click **Add to wallet**, to ensure that Base Sepolia is recognized in your Metamask.

Next, click Claim tokens, I already claimed mine, so the UI will be a bit different, but this should send ~$30 worth of Base Sepolia to your address, which will be sufficient for our use.

Switch your network to **Base Sepolia**, and ensure your tokens have been received.

<img width="1512" alt="coreOft3 3" src="https://github.com/user-attachments/assets/83962cd0-65a2-4be6-bff1-c4a1742f9781">

4 Back in Visual Studio code, open the terminal from the root of the repo. We now want to deploy our LayerZero contracts. However, **we must still initialize our `layerzero.config.ts` file for core testnet and base sepolia**.

To simplify things, we will first delete the default `layerzero.config.ts` file in our root directory.

4.1 Next, in your terminal, run:

```zsh
npx hardhat lz:oapp:config:init --contract-name MyOFT --oapp-config my_oft_config.ts
```

<img width="1512" alt="coreOft4 1" src="https://github.com/user-attachments/assets/e1eb4a62-c8bc-49ce-b27e-6a04d0723ac2">

4.2 If the command is ran successfully, you should see the LayerZero CLI UI appear with the networks defined from your hardhat.config.ts file. (base-sepolia, coredao-testnet) 

>Use the up/down arrow keys, and select both networks by clicking spacebar on each – both options should have the dot highlighted.

Click '**return/enter**' on your keyboard to proceed.

<img width="1512" alt="coreOft4 2" src="https://github.com/user-attachments/assets/832d4e4b-b577-4b2d-b1c7-29cbf419206e">

4.3 Confirm your `config.ts` file has been created. You may have named yours differently, but it should look something like this:

<img width="1512" alt="coreOft4 3" src="https://github.com/user-attachments/assets/c6f5361b-978f-4fea-8ee5-0d5405cf17f2">

4.3.1 You may need to fix the formatting, as you can see on line 10 in the image above, it’s not wrapping. Right click on the code, ctrl + A to select all contents in file, select **Format Document**. This should fix any issues.

>To return the default configuration for all possible network pathways from your hardhat.config.ts in your terminal, run:
>
>```npx hardhat lz:oapp:config:get:default```

<img width="1512" alt="coreOft4 3 1" src="https://github.com/user-attachments/assets/12a64c9f-ea89-4757-ac45-cd1412daa3c6">

5 To deploy your LayerZero contracts, in your terminal, you can now run:

`npx hardhat lz:deploy`

>Deployment Process: Running `npx hardhat lz:deploy` is used to execute the deployment script, ensuring that the MyOFT contract is deployed to the desired network.
>See [Deploying Contracts](https://docs.layerzero.network/v2/developers/evm/create-lz-oapp/deploying) to learn more.

5.1 Hardhat will now compile your project again, and you will be presented to the **LayerZero CLI UI** again, using the network names defined in your `hardhat.config.ts` and the contract defined in your `layerzero.config.ts`.

Once again, select both **base-sepolia**, and **coredao-testnet** and click '**enter/return**' on your keyboard to confirm.

<img width="1512" alt="coreOft5 1" src="https://github.com/user-attachments/assets/4969a819-74c0-486e-a7c7-af441ddbaff5">

<img width="1512" alt="coreOft5 1 1" src="https://github.com/user-attachments/assets/48bdb82d-3238-481a-bd17-aa286f2d5091">

Press '**Enter**' here on your keyboard again.

The UI will confirm that you want to deploy to **base-sepolia**, **coredao-testnet** press Y to confirm.
5.2 If successful, you will see your 2 deployed contracts for each network, displayed in the terminal, similar to what we have here:

Deployed contract: MyOFT, network: **coredao-testnet**, address: `0x08690B5069146005f57f62548d176708490e1e00`

Deployed contract: MyOFT, network: **base-sepolia**, address: `0xe07BFA9B56F162efDE07B3b2F7DF1D584BE04C16`
 
<img width="1512" alt="coreOft5 2" src="https://github.com/user-attachments/assets/3a521e96-0525-4183-bec8-c05cdeb7b283">

If you paste this each contract address into either https://scan.test.btcs.network/(**Core Testnet Explorer**), or https://sepolia.basescan.org/ (**Base Sepolia Testnet Explorer**)

You can see your newly deployed contracts on their respective chains.

6 We must now configure **Cross-Chain Pathways**.

Before transferring tokens between chains, it's essential to configure your LayerZero contracts for each unique pathway. Note that LayerZero contracts have distinct configurations for each direction (e.g., from Core Testnet to Base Sepolia has different properties than from Base Sepolia to Core Testnet).

For a detailed overview of all possible configuration commands, refer to the LayerZero [Configuring Contracts](https://docs.layerzero.network/v2/developers/evm/create-lz-oapp/configuring-pathways) documentation.

To configure your LayerZero contracts, modify the pathway configurations in your layerzero.config.ts file. Once you have updated the pathway configurations, you can wire them together using the following command:

`npx hardhat lz:oapp:wire --oapp-config <FILE_NAME>.config.ts`
>Example – (`npx hardhat lz:oapp:wire --oapp-config my_oft_config.ts`)

For each pathway on your config file, this task will call:

fromContract.OApp.setPeer
fromContract.OApp.setEnforcedOptions
fromContract.EndpointV2.setSendLibrary
fromContract.EndpointV2.setReceiveLibrary
fromContract.EndpointV2.setReceiveLibraryTimeout
fromContract.EndpointV2.setConfig(OApp, sendLibrary, sendConfig)
fromContract.EndpointV2.setConfig(OApp, receiveLibrary, receiveConfig)

for each contract instance, applying the custom configurations added.

Example Configuration for Core Testnet to Base Sepolia Testnet

Below is an example of configuring a pathway between Core Testnet and Base Sepolia Testnet:


```typescript
// connections[] in layerzero.config.ts
// configContracts is a constants file with contract addresses
{
    from: coreContract,
    to: baseSepoliaContract,
    // the config below is SET on Core Testnet
    config: {
        sendConfig: {
            ulnConfig: {
                confirmations: BigInt(5), // block confirmations to wait for finality
                optionalDVNThreshold: 0,
                requiredDVNs: [ // DVNs to pay to verify
                    configContracts.coreContracts.lzDvn,
                    configContracts.coreContracts.nethermindDvn,
                ],
                optionalDVNs: [],
            },
        },
    },
},
{
    from: baseSepoliaContract,
    to: coreContract,
    // the config below is SET on Base Sepolia Testnet
    config: {
        receiveConfig: {
            ulnConfig: {
                confirmations: BigInt(5), // enforces DVNs waited for finality
                optionalDVNThreshold: 0,
                requiredDVNs: [ // enforces specific DVNs have verified
                    configContracts.baseSepoliaContracts.lzDvn,
                    configContracts.baseSepoliaContracts.nethermindDvn,
                ],
                optionalDVNs: [],
            },
        },
    },
},
```
Remember to apply configurations for both directions if the pathway is bi-directional, meaning you need to add sendConfig for Core Testnet to Base Sepolia and receiveConfig for Base Sepolia to Core Testnet.

6.1 Open your terminal in Visual Studio code, from the root of the repo.

Run `npx hardhat lz:oapp:wire --oapp-config my_oft_config.ts` (or whatever you named your config.ts file)

6.1.1 You will see OApp doing some checks, and ask to proceed to preview transactions, click ‘**Y**’ to proceed.

<img width="1512" alt="coreOft6 1 1" src="https://github.com/user-attachments/assets/2b6aeeb2-75a8-4938-9c4e-9522ba9c4f7d">

6.1.2 Click ‘**Y**’ on your keyboard again to submit the required transactions

<img width="1512" alt="coreOft6 1 3" src="https://github.com/user-attachments/assets/3c625751-e674-4e14-a6f4-fec07460c991">

6.1.3 If successful, your terminal should be saying ‘**Your OApp is now configured**’.

6.2 We will now send our tokens between our contracts. We will need to create a hardhat task.

Within your root directory, create a subfolder called `**tasks**`.

Inside of it, create a file called `sendOFT.ts`.

<img width="1512" alt="coreOFT6 2" src="https://github.com/user-attachments/assets/a2a282d6-9a4f-43e4-8780-aa1573456adf">

You should now have an empty `sendOFT.ts` file.

6.3 Copy the following **Hardhat task**, and paste the contents in `sendOFT.ts`.

```typescript
import { ethers } from 'ethers'
import { task } from 'hardhat/config'

import { createGetHreByEid, createProviderFactory, getEidForNetworkName } from '@layerzerolabs/devtools-evm-hardhat'
import { Options } from '@layerzerolabs/lz-v2-utilities'

// Send tokens from a contract on one network to another
task('lz:oft:send', 'Send tokens cross-chain using LayerZero technology')
    .addParam('contractA', 'Contract address on network A')
    .addParam('recipientB', 'Recipient address on network B')
    .addParam('networkA', 'Name of the network A')
    .addParam('networkB', 'Name of the network B')
    .addParam('amount', 'Amount to transfer in token decimals')
    .addParam('privateKey', 'Private key of the sender')
    .setAction(async (taskArgs, hre) => {
        const eidA = getEidForNetworkName(taskArgs.networkA)
        const eidB = getEidForNetworkName(taskArgs.networkB)
        const contractA = taskArgs.contractA
        const recipientB = taskArgs.recipientB

        const environmentFactory = createGetHreByEid()
        const providerFactory = createProviderFactory(environmentFactory)
        const provider = await providerFactory(eidA)
        const wallet = new ethers.Wallet(taskArgs.privateKey, provider)

        const oftContractFactory = await hre.ethers.getContractFactory('MyOFT', wallet)
        const oft = oftContractFactory.attach(contractA)

        const decimals = await oft.decimals()
        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, decimals)
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
        const recipientAddressBytes32 = hre.ethers.utils.hexZeroPad(recipientB, 32)

        // Estimate the fee
        try {
            console.log("Attempting to call quoteSend with parameters:", {
                dstEid: eidB,
                to: recipientAddressBytes32,
                amountLD: amount,
                minAmountLD: amount.mul(98).div(100),
                extraOptions: options,
                composeMsg: '0x',
                oftCmd: '0x',
            });
            const nativeFee = (await oft.quoteSend(
                [eidB, recipientAddressBytes32, amount, amount.mul(98).div(100), options, '0x', '0x'],
                false
            ))[0]
            console.log('Estimated native fee:', nativeFee.toString())

            // Overkill native fee to ensure sufficient gas
            const overkillNativeFee = nativeFee.mul(2)

            // Fetch the current gas price and nonce
            const gasPrice = await provider.getGasPrice()
            const nonce = await provider.getTransactionCount(wallet.address)

            // Prepare send parameters
            const sendParam = [eidB, recipientAddressBytes32, amount, amount.mul(98).div(100), options, '0x', '0x']
            const feeParam = [overkillNativeFee, 0]

            // Sending the tokens with increased gas price
            console.log(`Sending ${taskArgs.amount} token(s) from network ${taskArgs.networkA} to network ${taskArgs.networkB}`)
            const tx = await oft.send(sendParam, feeParam, wallet.address, {
                value: overkillNativeFee,
                gasPrice: gasPrice.mul(2),
                nonce,
                gasLimit: hre.ethers.utils.hexlify(7000000),
            })
            console.log('Transaction hash:', tx.hash)
            await tx.wait()
            console.log(
                `Tokens sent successfully to the recipient on the destination chain. View on LayerZero Scan: https://layerzeroscan.com/tx/${tx.hash}`
            )
        } catch (error) {
            console.error('Error during quoteSend or send operation:', error)
            if (error?.data) {
                console.error("Reverted with data:", error.data)
            }
        }
    })
```
<img width="1512" alt="coreOft6 3" src="https://github.com/user-attachments/assets/11f47e60-0430-420b-8bd9-7bc8f3b4ace8">

6.4 Go back to your `hardhat.config.ts` file, and uncomment: `import './tasks/sendOFT`

Open your terminal in the root of your working directory, and run the following command:

```zsh
npx hardhat lz:oft:send --contract-a 0x… --recipient-b 0x… --network-a coredao-testnet --network-b base-sepolia --amount 100 --private-key <PRIVATE_KEY>
```

The inputs on this script correspond with the **.addParam**’s within the Hardhat task. Hardhat will flag you if you enter certain information incorrectly, so ensure there is no accidental dashes, or missing whitespace etc.

If successful, you will see the terminal return that you are sending **100 tokens**, with a transaction hash, and a link to LayerZeroScan – Testnet (https://testnet.layerzeroscan.com/tx/0x4d82f6bb174fb6600eb36b3d7bc641c1e7757229de1ef4a24dc7e59dae7350fc)

6.5 On LayerZero Scan, this page shows:

The fee paid for the transaction (0.0114178 tCORE).
The sender's address and the destination of the tokens.
Confirmation that the transaction was successful (status: Delivered).
You can click on the globes to check the token amounts in each contract on both the source and destination chains.
It's a quick way to verify the success and details of your cross-chain transfer.

<img width="1512" alt="coreOft6 5" src="https://github.com/user-attachments/assets/c4fdf7f4-1f76-42e7-8128-0b6cb95a50d7">

6.5.1 You can see on the [Core Testnet explorer](https://scan.test.btcs.network/token/0x08690b5069146005f57f62548d176708490e1e00), the total supply of **MOFT (99,800)** indicating my **2** uses of the send task to transfer **100 tokens** each time, from **Core Testnet**, to **Base Sepolia**.

<img width="1512" alt="coreOft6 5 1" src="https://github.com/user-attachments/assets/51d9935f-8053-48fb-aedf-a5983e641819">

6.5.2 When we check the MOFT token on the [Base Sepolia Explorer](https://sepolia.basescan.org/token/0xe07bfa9b56f162efde07b3b2f7df1d584be04c16), we can indeed verify that we are now at **100,200 Max Total Supply** confirming that we have successfully burned, and minted 200 MOFT tokens, “transferring” between Core Testnet, and Base Sepolia.

<img width="1512" alt="coreOft6 5 2" src="https://github.com/user-attachments/assets/8b1f39cf-97e5-4636-aa35-bc28dce65d97">

## Conclusion

By integrating LayerZero’s OFT on **Core Testnet** and **Mainnet**, we are opening new pathways for cross-chain interactions between Core and major networks. Currently, connections between **Core Mainnet** and the mainnets of **Ethereum, Optimism, Base, and Arbitrum** are fully operational. Likewise, **Core Testnet** is linked to the testnets of these networks, including **Sepolia**. This creates a connection between Core and other ecosystems, allowing for efficient token transfers and interactions across different chains.

If you encounter any issues with endpoints or would like support for additional network pathways connecting to Core, we encourage you to submit a request. The LayerZero team must be manually informed to enable or troubleshoot new or existing connections.

The LayerZero contracts provided can be easily modified to accommodate a variety of token use cases, from fungible tokens to governance models or more complex token systems. Additionally, the Hardhat tasks demonstrated in this guide can be customized for different workflows, such as automating token transfers, managing token supplies, or adding unique functionality across networks.

By unlocking these cross-chain capabilities, developers on Core now have the ability to build advanced decentralized applications that are fully interoperable with multiple blockchain ecosystems. This enables increased liquidity, extended reach for applications, and the ability to leverage assets across both testnets and mainnets, opening new opportunities for innovation and growth within the Core ecosystem.

