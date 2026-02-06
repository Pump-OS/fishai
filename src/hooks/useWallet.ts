"use client";

import { useState, useCallback } from "react";

interface WalletState {
  connected: boolean;
  address: string | null;
  connecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    connecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      // Check if Phantom is installed
      const phantom = (window as unknown as { solana?: { isPhantom: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; disconnect: () => Promise<void> } }).solana;

      if (!phantom?.isPhantom) {
        setState((prev) => ({
          ...prev,
          connecting: false,
          error: "Phantom wallet not found. Install it from phantom.app",
        }));
        return;
      }

      const response = await phantom.connect();
      const address = response.publicKey.toString();

      setState({
        connected: true,
        address,
        connecting: false,
        error: null,
      });

      return address;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        connecting: false,
        error: err instanceof Error ? err.message : "Failed to connect",
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const phantom = (window as unknown as { solana?: { disconnect: () => Promise<void> } }).solana;
      await phantom?.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    setState({ connected: false, address: null, connecting: false, error: null });
  }, []);

  return { ...state, connect, disconnect };
}
