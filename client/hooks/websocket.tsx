"use client";

import { consumeMessage, createMessage } from "@/lib/message-handler";
import { useInfoStore } from "@/lib/stores/info-store-provider";
import { useWebRTC } from "@/lib/contexts/webrtc-context";
import { Message } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const previousClientType = useRef<string | null>(null);

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

  const setupPingInterval = useCallback(() => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }
    
    pingInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ 
          type: "PING",
          sessionId: sessionId 
        }));
      }
    }, 30000);
  }, [sessionId]);

  // Handle client type changes
  useEffect(() => {
    if (previousClientType.current !== clientType) {
      console.log("Client type changed from", previousClientType.current, "to", clientType);
      previousClientType.current = clientType;
      
      // Clean up existing connection
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      
      // Reset state
      setConnected(false);
      setSessionId(""); // Use empty string instead of null
      webRTC.cleanup();
    }
  }, [clientType, setSessionId, webRTC]);

  useEffect(() => {
    if (!webRTC.isInitialized) {
      webRTC.initializePeerConnection();
    }

    // Initialize WebSocket
    ws.current = new WebSocket("ws://localhost:8080/ws");

    ws.current.onopen = () => {
      console.log("WebSocket connected as", clientType);
      setConnected(true);
      setupPingInterval();
      if (clientType === "sender" && !sessionId) {
        console.log("Creating new session as sender");
        sendMessage({ type: "CREATE_SESSION" });
      }
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Set up ping/pong handlers
    ws.current.onping = () => {
      console.log("Received ping from server");
    };

    ws.current.onpong = () => {
      console.log("Received pong from server");
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

    // Add these to the WebRTC setup
    if (webRTC.peerConnection) {
        webRTC.peerConnection.onconnectionstatechange = () => {
            console.log("WebRTC connection state:", webRTC.peerConnection?.connectionState);
        };

        webRTC.peerConnection.onsignalingstatechange = () => {
            console.log("WebRTC signaling state:", webRTC.peerConnection?.signalingState);
        };

        webRTC.peerConnection.oniceconnectionstatechange = () => {
            console.log("WebRTC ICE connection state:", webRTC.peerConnection?.iceConnectionState);
        };
    }

    // Update the message handler to be more verbose
    const handleMessage = async (event: MessageEvent) => {
        console.log("Received message:", event.data);
        const msg = JSON.parse(event.data) as Message;
        const { sessionId: receivedSessionId, sdp, candidate } = consumeMessage(msg);

        if (receivedSessionId) {
            setSessionId(receivedSessionId);
        }

        switch (msg.type) {
            case "SESSION_CREATED":
                console.log("Session created:", receivedSessionId);
                break;
            case "PEER_CONNECTED":
                console.log("Peer connected, creating offer...");
                if (clientType === "sender") {
                    const offer = await webRTC.createOffer();
                    if (offer) {
                        console.log("Sending offer:", offer);
                        sendMessage(createMessage(
                            "OFFER",
                            sessionId,
                            JSON.stringify(offer),
                        ));
                    } else {
                        console.error("Failed to create offer");
                    }
                }
                break;
            case "OFFER":
                console.log("Received offer:", sdp);
                if (sdp) {
                    const answer = await webRTC.handleOffer(sdp);
                    if (answer) {
                        console.log("Sending answer:", answer);
                        sendMessage(createMessage(
                            "ANSWER",
                            sessionId,
                            JSON.stringify(answer),
                        ));
                    } else {
                        console.error("Failed to create answer");
                    }
                }
                break;
            case "ANSWER":
                console.log("Received answer:", sdp);
                if (sdp) {
                    try {
                        await webRTC.handleAnswer(sdp);
                        console.log("Answer handled successfully");
                    } catch (error) {
                        console.error("Failed to handle answer:", error);
                    }
                }
                break;
            case "ICE_CANDIDATE":
                console.log("Received ICE candidate:", candidate);
                if (candidate) {
                    try {
                        await webRTC.handleIceCandidate(candidate);
                        console.log("ICE candidate handled successfully");
                    } catch (error) {
                        console.error("Failed to handle ICE candidate:", error);
                    }
                }
                break;
            case "ERROR":
                console.error("Error from server:", msg);
                break;
        }
    };

    ws.current.onmessage = handleMessage;

    return () => {
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
        pingInterval.current = null;
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      webRTC.cleanup();
    };
  }, [webRTC, clientType, sessionId, setSessionId, sendMessage, setupPingInterval]);

  return { isConnected, messages, sendMessage };
};
