"use client";

import { createContext, ReactNode, useContext, useRef } from "react";
import { createInfoStore, type InfoStore, initInfoStore } from "./infoStore";
import { useStore } from "zustand";

export type InfoStoreApi = ReturnType<typeof createInfoStore>;

export const InfoStoreContext = createContext<InfoStoreApi | undefined>(
  undefined,
);

export interface InfoStoreProviderProps {
  children: ReactNode;
}

export const InfoStoreProvider = ({
  children,
}: InfoStoreProviderProps) => {
  const storeRef = useRef<InfoStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createInfoStore(initInfoStore());
  }

  return (
    <InfoStoreContext.Provider value={storeRef.current}>
      {children}
    </InfoStoreContext.Provider>
  );
};

export const useInfoStore = <T,>(
  selector: (store: InfoStore) => T,
): T => {
  const infoStoreContext = useContext(InfoStoreContext);
  if (!infoStoreContext) {
    throw new Error(`useInfoStore must be used with InfoStoreProvider`);
  }

  return useStore(infoStoreContext, selector);
};
