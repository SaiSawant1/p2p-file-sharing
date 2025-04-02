"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createMessage } from "@/lib/message-handler";
import { useWebSocket } from "@/hooks/websocket";

export const JoinSessionForm = () => {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const { sendMessage } = useWebSocket();
  const handleJoinSession = () => {
    sendMessage(createMessage("JOIN_SESSION", sessionId));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const session = e.target.value as string;
    setSessionId(session);
  };
  return (
    <div className="flex gap-3">
      <Input
        placeholder="sessionId"
        onChange={(e) => handleChange(e)}
      />
      <Button variant={"outline"} onClick={handleJoinSession}>join</Button>
    </div>
  );
};
