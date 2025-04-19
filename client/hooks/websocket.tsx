"use client";

import { consumeMessage } from "@/lib/message-handler";
import { useInfoStore } from "@/lib/stores/info-store-provider";
import { Message } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useWebRTC } from "./webrtc";

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const { setSessionId } = useInfoStore((state) => state);
  const { clientType, sessionId } = useInfoStore((state) => state);
  const { handleOffer, handleAnswer, handleIceCandidate } = useWebRTC();

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080/ws");

    ws.current.onopen = () => {
      setConnected(true);
      if (clientType === "sender" && !sessionId) {
        sendMessage({ type: "CREATE_SESSION" });
      }
    };

    ws.current.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
      const msg = JSON.parse(event.data) as Message;
      const { sessionId, sdp, candidate } = consumeMessage(msg);

      if (sessionId) {
        setSessionId(sessionId);
      }

      // Handle WebRTC signaling messages
      switch (msg.type) {
        case "OFFER":
          if (sdp) handleOffer(sdp);
          break;
        case "ANSWER":
          if (sdp) handleAnswer(sdp);
          break;
        case "ICE_CANDIDATE":
          if (candidate) handleIceCandidate(candidate);
          break;
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [
    setSessionId,
    clientType,
    sessionId,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  ]);

  const sendMessage = (msg: Message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageJson = JSON.stringify(msg);
      ws.current.send(messageJson);
    } else {
      console.log("WebSocket is not open. Unable to send message.");
    }
  };

  return { isConnected, messages, sendMessage };
};
