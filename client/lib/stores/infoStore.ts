"use client";

import { createStore } from "zustand/vanilla";

export type ClientType = "sender" | "receiver";

type InfoState = {
  clientType: ClientType;
  sender_ice: string;
  sender_sdp: string;
};

type InfoActions = {
  setClientType: (client: ClientType) => void;
};

export type InfoStore = InfoState & InfoActions;

export const initInfoStore = (): InfoState => {
  return { clientType: "sender", sender_ice: "", sender_sdp: "" };
};

export const defaultInitState: InfoState = {
  clientType: "sender",
  sender_sdp: "",
  sender_ice: "",
};

export const createInfoStore = (initState: InfoState = defaultInitState) => {
  return createStore<InfoStore>()((set) => ({
    ...initState,
    setClientType: (client: ClientType) => set(() => ({ clientType: client })),
  }));
};
