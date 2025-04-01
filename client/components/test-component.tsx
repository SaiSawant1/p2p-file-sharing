"use client";
import { useWebSocket } from "@/hooks/websocket";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createMessage } from "@/lib/message-creator";

export const TestComponent = () => {
  const { isConnected, sendMessage } = useWebSocket();
  return (
    <>
      <div className="flex gap-4">
        <Input placeholder="text to send to server..." />
        <Button onClick={() => sendMessage(createMessage("JOIN_SESSION"))}>
          send
        </Button>
        <div>
          {isConnected && <p>Connected</p>}
        </div>
      </div>
    </>
  );
};
