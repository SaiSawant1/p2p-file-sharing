import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const ClientTypeSelector = () => {
  return (
    <div>
      <Select>
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
