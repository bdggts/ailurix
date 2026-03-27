import { http, createConfig } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';

export const BASE_CHAIN = {
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
  blockExplorers: { default: { name: 'BaseScan', url: 'https://basescan.org' } },
};

export const BASE_TESTNET = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://sepolia.base.org'] } },
  blockExplorers: { default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' } },
};

export const wagmiConfig = createConfig({
  chains: [BASE_TESTNET, BASE_CHAIN],
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: 'Dominex' }),
  ],
  transports: {
    [BASE_TESTNET.id]: http('https://sepolia.base.org'),
    [BASE_CHAIN.id]:   http('https://mainnet.base.org'),
  },
});

export const DMX_TOKEN_ADDRESS   = '0x0000000000000000000000000000000000000000'; // fill after deploy
export const DOMINEX_NFT_ADDRESS = '0x0000000000000000000000000000000000000000';
export const GAME_CONTROLLER     = '0x0000000000000000000000000000000000000000';

export const DMX_ABI = [
  { inputs:[{name:'account',type:'address'}], name:'balanceOf', outputs:[{type:'uint256'}], stateMutability:'view', type:'function' },
  { inputs:[{name:'spender',type:'address'},{name:'amount',type:'uint256'}], name:'approve', outputs:[{type:'bool'}], stateMutability:'nonpayable', type:'function' },
  { inputs:[], name:'totalSupply', outputs:[{type:'uint256'}], stateMutability:'view', type:'function' },
  { inputs:[], name:'name', outputs:[{type:'string'}], stateMutability:'view', type:'function' },
  { inputs:[], name:'symbol', outputs:[{type:'string'}], stateMutability:'view', type:'function' },
];
