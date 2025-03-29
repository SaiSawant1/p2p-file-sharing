"use client";
import { useWebSocket } from "@/hooks/websocket";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const ChatComponent = () => {
  const { isConnected, sendMessage, messages } = useWebSocket();
  return (
    <>
      <div className="flex gap-4">
        <Input placeholder="text to send to server..." />
        <Button onClick={() => sendMessage("test")}>send</Button>
        <div>
          {isConnected && <p>Connected</p>}
        </div>
      </div>
      <div>
        {messages && (
          <div>
            {messages.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}
      </div>
    </>
  );
};
