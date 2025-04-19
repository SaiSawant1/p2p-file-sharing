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
import { useWebRTC } from "@/lib/contexts/webrtc-context";

export const InfoPannel = () => {
  const { clientType, sessionId } = useInfoStore((state) => state);
  const { isConnected } = useWebSocket();
  const { isConnected: isWebRTCConnected } = useWebRTC();

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Connection Status</CardTitle>
            <Badge variant={isConnected ? "default" : "destructive"} className="text-sm">
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Real-time connection and session information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Client Type</p>
                <p className="text-lg font-semibold">{clientType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Session ID</p>
                <p className="text-lg font-semibold">{sessionId || "Not connected"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Connection Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">WebRTC Status</p>
                  <Badge variant={isWebRTCConnected ? "default" : "destructive"} className="text-sm">
                    {isWebRTCConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Signaling Status</p>
                  <Badge variant={isConnected ? "default" : "destructive"} className="text-sm">
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
