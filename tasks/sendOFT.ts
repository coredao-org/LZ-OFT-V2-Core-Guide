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