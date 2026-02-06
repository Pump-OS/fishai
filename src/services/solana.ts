// ============================================================
// Solana Service — read-only token gating (isolated)
// ============================================================

import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";
const TOKEN_MINT = process.env.NEXT_PUBLIC_FISHAI_TOKEN_MINT || "";

let connectionInstance: Connection | null = null;

function getConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(RPC_URL, "confirmed");
  }
  return connectionInstance;
}

export async function getTokenBalance(walletAddress: string): Promise<number> {
  if (!TOKEN_MINT) return 0;

  try {
    const connection = getConnection();
    const wallet = new PublicKey(walletAddress);
    const mint = new PublicKey(TOKEN_MINT);

    // Find associated token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      { mint }
    );

    if (tokenAccounts.value.length === 0) return 0;

    const balance =
      tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (err) {
    console.error("Failed to fetch token balance:", err);
    return 0;
  }
}

export function isProHolder(balance: number): boolean {
  // Holding any amount of the token = Pro status
  return balance > 0;
}
