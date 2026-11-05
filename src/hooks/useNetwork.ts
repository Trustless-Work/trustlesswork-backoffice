"use client";

import { useCallback, useState } from "react";
import { getStoredNetwork, setStoredNetwork } from "@/lib/client-storage";
import type { NetworkType } from "@/types/network.entity";

const useNetwork = () => {
  const [network, setNetwork] = useState<NetworkType>(() => getStoredNetwork());
  const [isReseting, setIsReseting] = useState(false);

  const changeNetwork = useCallback((newNetwork: NetworkType) => {
    if (newNetwork === getStoredNetwork()) {
      return;
    }

    setIsReseting(true);
    setNetwork(newNetwork);
    setStoredNetwork(newNetwork);

    setTimeout(() => {
      setIsReseting(false);
      window.location.reload();
    }, 500);
  }, []);

  return { currentNetwork: network, changeNetwork, isReseting };
};

export default useNetwork;
