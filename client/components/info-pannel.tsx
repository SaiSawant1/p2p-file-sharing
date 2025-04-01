"use client";

import { useInfoStore } from "@/lib/stores/info-store-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const InfoPannel = () => {
  const { clientType } = useInfoStore((state) => state);
  return (
    <div className="w-full px-96 mx-60">
      <Card>
        <CardHeader>
          <CardTitle>Info Panel</CardTitle>
          <CardDescription>Complete details about Client.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              Client Type: <p>{clientType}</p>
            </div>
            <div className="flex gap-2">
              SessionId: <p>1</p>
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
