"use client";

import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "./websocket";
import { useInfoStore } from "@/lib/stores/info-store-provider";
import { createMessage } from "@/lib/message-handler";

export const useWebRTC = () => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const { sendMessage } = useWebSocket();
  const { clientType, sessionId } = useInfoStore((state) => state);
  const [isConnected, setIsConnected] = useState(false);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  useEffect(() => {
    // Initialize peer connection with STUN servers
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    // Handle ICE candidate events
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage(createMessage(
          "ICE_CANDIDATE",
          sessionId,
          JSON.stringify(peerConnection.current?.localDescription),
          JSON.stringify(event.candidate),
        ));
      }
    };

    // Handle connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      if (peerConnection.current?.connectionState === "connected") {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };

    // Set up data channel for sender
    if (clientType === "sender" && peerConnection.current) {
      const channel = peerConnection.current.createDataChannel("fileTransfer");
      setDataChannel(channel);

      channel.onopen = () => {
        console.log("Data channel opened");
      };

      channel.onclose = () => {
        console.log("Data channel closed");
      };
    }

    // Set up data channel for receiver
    if (clientType === "receiver" && peerConnection.current) {
      peerConnection.current.ondatachannel = (event) => {
        const channel = event.channel;
        setDataChannel(channel);

        channel.onopen = () => {
          console.log("Data channel opened");
        };

        channel.onclose = () => {
          console.log("Data channel closed");
        };
      };
    }

    return () => {
      peerConnection.current?.close();
    };
  }, [clientType, sessionId, sendMessage]);

  // Create and send offer (for sender)
  const createOffer = async () => {
    if (!peerConnection.current) return;

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      sendMessage(createMessage(
        "OFFER",
        sessionId,
        JSON.stringify(offer),
      ));
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  // Handle received offer and create answer (for receiver)
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.setRemoteDescription(offer);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      sendMessage(createMessage(
        "ANSWER",
        sessionId,
        JSON.stringify(answer),
      ));
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  // Handle received answer (for sender)
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.setRemoteDescription(answer);
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  // Handle received ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.addIceCandidate(candidate);
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  return {
    isConnected,
    dataChannel,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  };
};
