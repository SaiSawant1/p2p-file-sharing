"use client";
import { useInfoStore } from "@/lib/stores/info-store-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ClientType } from "@/lib/stores/infoStore";

export const ClientTypeSelector = () => {
  const { setClientType } = useInfoStore((state) => state);
  const onClientSelect = (value: ClientType) => {
    setClientType(value);
  };
  return (
    <div>
      <Select
        defaultValue="sender"
        onValueChange={(value: ClientType) => onClientSelect(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Client Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sender">Sender</SelectItem>
          <SelectItem value="receiver">Receiver</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
