"use client";

import { useEffect, useRef, useState } from "react";

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null); // Use useRef to persist WebSocket instance

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080/ws");

    ws.current.onopen = () => {
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]); // Use functional update to avoid stale state
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.current?.close(); // Cleanup on unmount
    };
  }, []); // Only run once when component mounts

  const sendMessage = (msg: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(msg);
    } else {
      console.log("WebSocket is not open. Unable to send message.");
    }
  };

  return { isConnected, messages, sendMessage };
};
