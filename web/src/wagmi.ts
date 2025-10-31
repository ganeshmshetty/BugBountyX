import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'wagmi/chains';

// Polygon Amoy testnet configuration
export const config = getDefaultConfig({
  appName: 'BugBountyX',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [polygonAmoy],
  ssr: false,
});
