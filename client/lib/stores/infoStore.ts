"use client";

import { createStore } from "zustand/vanilla";

type ClientType = "sender" | "receiver";

type InfoState = {
  clientType: ClientType;
  ice: string;
  sdp: string;
};

type InfoActions = {
  setClientType: (client: ClientType) => void;
};

export type InfoStore = InfoState & InfoActions;

export const defaultInitState: InfoState = {
  clientType: "sender",
  sdp: "",
  ice: "",
};

export const createInfoStore = (initState: InfoState = defaultInitState) => {
  return createStore<InfoStore>()((set) => ({
    ...initState,
    setClientType: (client: ClientType) => set(() => ({ clientType: client })),
  }));
};
