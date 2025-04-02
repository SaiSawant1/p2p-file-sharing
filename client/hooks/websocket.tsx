"use client";

import { consumeMessage } from "@/lib/message-handler";
import { useInfoStore } from "@/lib/stores/info-store-provider";
import { Message } from "@/types";
import { useEffect, useRef, useState } from "react";

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null); // Use useRef to persist WebSocket instance
  const { setSessionId } = useInfoStore((state) => state);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080/ws");

    ws.current.onopen = () => {
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]); // Use functional update to avoid stale state
      const msg = JSON.parse(event.data) as Message;
      const { sessionId } = consumeMessage(msg);
      if (sessionId) {
        setSessionId(sessionId);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [setSessionId]); // Only run once when component mounts

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
