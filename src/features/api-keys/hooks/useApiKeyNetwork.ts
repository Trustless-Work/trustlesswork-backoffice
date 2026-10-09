"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredNetwork } from "@/lib/client-storage";
import type { NetworkType } from "@/types/network.entity";

export function useApiKeyNetwork() {
  const pickedNetwork = useRef(false);
  const [network, setNetworkState] = useState<NetworkType>("testnet");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!pickedNetwork.current) {
      setNetworkState(getStoredNetwork());
    }
    setReady(true);
  }, []);

  const setNetwork = (next: NetworkType) => {
    pickedNetwork.current = true;
    setNetworkState(next);
  };

  return { network, setNetwork, ready };
}
