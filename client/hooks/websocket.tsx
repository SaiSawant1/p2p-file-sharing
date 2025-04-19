"use client";

import { consumeMessage, createMessage } from "@/lib/message-handler";
import { useInfoStore } from "@/lib/stores/info-store-provider";
import { useWebRTC } from "@/lib/contexts/webrtc-context";
import { Message } from "@/types";
import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const { setSessionId, clientType, sessionId } = useInfoStore((state) => state);
  const webRTC = useWebRTC();

  const sendMessage = useCallback((msg: Message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageJson = JSON.stringify(msg);
      ws.current.send(messageJson);
    } else {
      console.log("WebSocket is not open. Unable to send message.");
    }
  }, []);

  useEffect(() => {
    if (!webRTC.isInitialized) {
      webRTC.initializePeerConnection();
    }

    // Initialize WebSocket
    ws.current = new WebSocket("ws://localhost:8080/ws");

    ws.current.onopen = () => {
      setConnected(true);
      if (clientType === "sender" && !sessionId) {
        sendMessage({ type: "CREATE_SESSION" });
      }
    };

    // Set up data channel for sender
    if (clientType === "sender" && webRTC.peerConnection) {
      const channel = webRTC.peerConnection.createDataChannel("fileTransfer");
      webRTC.setDataChannel(channel);

      channel.onopen = () => console.log("Data channel opened");
      channel.onclose = () => console.log("Data channel closed");
    }

    // Set up data channel for receiver
    if (clientType === "receiver" && webRTC.peerConnection) {
      webRTC.peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        webRTC.setDataChannel(channel);

        channel.onopen = () => console.log("Data channel opened");
        channel.onclose = () => console.log("Data channel closed");
      };
    }

    // Handle ICE candidates
    if (webRTC.peerConnection) {
      webRTC.peerConnection.onicecandidate = (event) => {
        if (event.candidate && ws.current) {
          sendMessage(createMessage(
            "ICE_CANDIDATE",
            sessionId,
            JSON.stringify(webRTC.peerConnection?.localDescription),
            JSON.stringify(event.candidate),
          ));
        }
      };
    }

    const handleMessage = async (event: MessageEvent) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
      const msg = JSON.parse(event.data) as Message;
      const { sessionId: receivedSessionId, sdp, candidate } = consumeMessage(msg);

      if (receivedSessionId) {
        setSessionId(receivedSessionId);
      }

      // Handle WebRTC signaling messages
      switch (msg.type) {
        case "OFFER":
          if (sdp) {
            const answer = await webRTC.handleOffer(sdp);
            if (answer) {
              sendMessage(createMessage(
                "ANSWER",
                sessionId,
                JSON.stringify(answer),
              ));
            }
          }
          break;
        case "ANSWER":
          if (sdp) await webRTC.handleAnswer(sdp);
          break;
        case "ICE_CANDIDATE":
          if (candidate) await webRTC.handleIceCandidate(candidate);
          break;
      }
    };

    ws.current.onmessage = handleMessage;

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      webRTC.cleanup();
    };
  }, [webRTC, clientType, sessionId, setSessionId, sendMessage]);

  return { isConnected, messages, sendMessage };
};
