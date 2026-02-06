"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function WalletButton() {
  const { connected, address, connecting, error, connect, disconnect } =
    useWallet();
  const { user, profile } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Save wallet address to profile
  useEffect(() => {
    if (connected && address && user && profile?.wallet_address !== address) {
      const saveAddress = async () => {
        setSaving(true);
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ wallet_address: address })
          .eq("id", user.id);
        setSaving(false);
      };
      saveAddress();
    }
  }, [connected, address, user, profile?.wallet_address]);

  // Check token balance (simplified — real implementation would call Solana RPC)
  useEffect(() => {
    if (connected && address) {
      // For MVP, we'll just show the address
      // Token balance check would go here via /api/wallet/balance endpoint
      setTokenBalance(null);
    }
  }, [connected, address]);

  if (!user) return null;

  return (
    <div className="rust-card p-5">
      <h3 className="text-sm font-bold text-npc-accent mb-4">
        🔗 Solana Wallet
      </h3>

      {connected && address ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-npc-text/40">Connected</p>
              <p className="text-sm text-npc-text font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {profile?.is_pro && <Badge variant="pro">PRO</Badge>}
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>

          {tokenBalance !== null && tokenBalance > 0 && (
            <div className="bg-npc-bg rounded-lg p-3">
              <p className="text-xs text-npc-text/40">$FISHAI Balance</p>
              <p className="text-lg font-bold text-npc-accent">
                {tokenBalance.toLocaleString()}
              </p>
            </div>
          )}

          {saving && (
            <p className="text-xs text-npc-text/40 flex items-center gap-1">
              <LoadingSpinner size="sm" /> Saving to profile...
            </p>
          )}

          <button
            onClick={disconnect}
            className="text-xs text-npc-text/40 hover:text-red-400 transition-colors"
          >
            Disconnect wallet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-npc-text/50">
            Connect your Phantom wallet to unlock Pro features.
          </p>
          <button
            onClick={connect}
            disabled={connecting}
            className="btn-rust w-full flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <LoadingSpinner size="sm" />
                Connecting...
              </>
            ) : (
              <>
                👻 Connect Phantom
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <p className="text-xs text-npc-text/30">
            Read-only. We never request transaction permissions.
          </p>
        </div>
      )}
    </div>
  );
}
