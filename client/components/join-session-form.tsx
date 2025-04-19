"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createMessage } from "@/lib/message-handler";
import { useWebSocket } from "@/hooks/websocket";

export const JoinSessionForm = () => {
  const [sessionId, setSessionId] = useState<string>("");
  const { sendMessage } = useWebSocket();

  const handleJoinSession = () => {
    if (sessionId.trim()) {
      sendMessage(createMessage("JOIN_SESSION", sessionId));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSessionId(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <label htmlFor="sessionId" className="text-sm font-medium">Session ID</label>
        <div className="flex gap-2">
          <Input
            id="sessionId"
            placeholder="Enter session ID"
            value={sessionId}
            onChange={handleChange}
            className="flex-1"
          />
          <Button 
            variant="default" 
            onClick={handleJoinSession}
            className="min-w-[100px]"
          >
            Join Session
          </Button>
        </div>
      </div>
    </div>
  );
};
