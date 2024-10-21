import { EndpointId } from '@layerzerolabs/lz-definitions'
const base_sepoliaContract = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'MyOFT',
}
const coredao_testnetContract = {
    eid: EndpointId.COREDAO_V2_TESTNET,
    contractName: 'MyOFT',
}
export default {
    contracts: [{ contract: base_sepoliaContract }, { contract: coredao_testnetContract }],
    connections: [
        {
            from: base_sepoliaContract,
            to: coredao_testnetContract,
            config: {
                sendLibrary: '0xC1868e054425D378095A003EcbA3823a5D0135C9',
                receiveLibraryConfig: { receiveLibrary: '0x12523de19dc41c91F7d2093E0CFbB76b17012C8d', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x8A3D588D9f6AC041476b094f97FF94ec30169d3D' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xe1a12515F9AB2764b887bF60B923Ca494EBbB2d6'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xe1a12515F9AB2764b887bF60B923Ca494EBbB2d6'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: coredao_testnetContract,
            to: base_sepoliaContract,
            config: {
                sendLibrary: '0xc8361Fac616435eB86B9F6e2faaff38F38B0d68C',
                receiveLibraryConfig: { receiveLibrary: '0xD1bbdB62826eDdE4934Ff3A4920eB053ac9D5569', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x3Bdb89Df44e50748fAed8cf851eB25bf95f37d19' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xAe9BBF877BF1BD41EdD5dfc3473D263171cF3B9e'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0xAe9BBF877BF1BD41EdD5dfc3473D263171cF3B9e'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
    ],
}
