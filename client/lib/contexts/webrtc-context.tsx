"use client";

import { createContext, ReactNode, useContext, useReducer, useRef, useEffect } from "react";

type WebRTCState = {
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  isConnected: boolean;
  localDescription: RTCSessionDescription | null;
  remoteDescription: RTCSessionDescription | null;
  isInitialized: boolean;
};

type WebRTCAction =
  | { type: "SET_PEER_CONNECTION"; payload: RTCPeerConnection | null }
  | { type: "SET_DATA_CHANNEL"; payload: RTCDataChannel | null }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_LOCAL_DESCRIPTION"; payload: RTCSessionDescription | null }
  | { type: "SET_REMOTE_DESCRIPTION"; payload: RTCSessionDescription | null }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "RESET" };

const initialState: WebRTCState = {
  peerConnection: null,
  dataChannel: null,
  isConnected: false,
  localDescription: null,
  remoteDescription: null,
  isInitialized: false,
};

function reducer(state: WebRTCState, action: WebRTCAction): WebRTCState {
  switch (action.type) {
    case "SET_PEER_CONNECTION":
      return { ...state, peerConnection: action.payload };
    case "SET_DATA_CHANNEL":
      return { ...state, dataChannel: action.payload };
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };
    case "SET_LOCAL_DESCRIPTION":
      return { ...state, localDescription: action.payload };
    case "SET_REMOTE_DESCRIPTION":
      return { ...state, remoteDescription: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

type WebRTCActions = {
  initializePeerConnection: () => void;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  handleOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit | null>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  setDataChannel: (channel: RTCDataChannel | null) => void;
  cleanup: () => void;
};

type WebRTCContextType = WebRTCState & WebRTCActions;

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return context;
};

export const WebRTCProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isCleaningUp = useRef(false);
  const cleanupRequested = useRef(false);

  const initializePeerConnection = () => {
    if (state.isInitialized) return;
    
    cleanup();

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnection.onconnectionstatechange = () => {
      if (!isCleaningUp.current) {
        dispatch({ type: "SET_CONNECTED", payload: peerConnection.connectionState === "connected" });
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && !isCleaningUp.current) {
        dispatch({ type: "SET_LOCAL_DESCRIPTION", payload: peerConnection.localDescription });
      }
    };

    dispatch({ type: "SET_PEER_CONNECTION", payload: peerConnection });
    dispatch({ type: "SET_INITIALIZED", payload: true });
  };

  const createOffer = async () => {
    if (!state.peerConnection) return null;

    try {
      const offer = await state.peerConnection.createOffer();
      await state.peerConnection.setLocalDescription(offer);
      dispatch({ type: "SET_LOCAL_DESCRIPTION", payload: state.peerConnection.localDescription });
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      return null;
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!state.peerConnection) return null;

    try {
      await state.peerConnection.setRemoteDescription(offer);
      dispatch({ type: "SET_REMOTE_DESCRIPTION", payload: state.peerConnection.remoteDescription });
      const answer = await state.peerConnection.createAnswer();
      await state.peerConnection.setLocalDescription(answer);
      dispatch({ type: "SET_LOCAL_DESCRIPTION", payload: state.peerConnection.localDescription });
      return answer;
    } catch (error) {
      console.error("Error handling offer:", error);
      return null;
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!state.peerConnection) return;

    try {
      await state.peerConnection.setRemoteDescription(answer);
      dispatch({ type: "SET_REMOTE_DESCRIPTION", payload: state.peerConnection.remoteDescription });
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!state.peerConnection) return;

    try {
      await state.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  const setDataChannel = (channel: RTCDataChannel | null) => {
    dispatch({ type: "SET_DATA_CHANNEL", payload: channel });
  };

  const cleanup = () => {
    if (isCleaningUp.current) return;
    cleanupRequested.current = true;
  };

  useEffect(() => {
    if (cleanupRequested.current && !isCleaningUp.current) {
      isCleaningUp.current = true;
      cleanupRequested.current = false;

      try {
        if (state.dataChannel) {
          state.dataChannel.close();
        }
        if (state.peerConnection) {
          state.peerConnection.close();
        }

        dispatch({ type: "RESET" });
      } finally {
        isCleaningUp.current = false;
      }
    }
  }, [state.dataChannel, state.peerConnection]);

  const value = {
    ...state,
    initializePeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setDataChannel,
    cleanup,
  };

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
};
