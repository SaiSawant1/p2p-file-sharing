"use client";

import { useInfoStore } from "@/lib/stores/info-store-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { useWebSocket } from "@/hooks/websocket";
import { JoinSessionForm } from "./join-session-form";

export const InfoPannel = () => {
  const { clientType, sessionId } = useInfoStore((state) => state);
  const { isConnected } = useWebSocket();
  return (
    <div className="w-full px-96 mx-60">
      <Card>
        <CardHeader>
          <CardTitle>
            Info Panel{" "}
            <Badge>{isConnected ? <p>live</p> : <p>disconnected</p>}</Badge>
          </CardTitle>
          <CardDescription>Complete details about Client.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              Client Type: <p>{clientType}</p>
            </div>
            <div className="flex gap-2 items-center">
              SessionId:{" "}
              {clientType === "sender"
                ? <p>{sessionId}</p>
                : <JoinSessionForm />}
            </div>
            <div className="flex gap-2">
              SDP: <p>info</p>
            </div>
            <div className="flex gap-2">
              ICE: <p>info</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
