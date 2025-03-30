import { ClientTypeSelector } from "./client-type-selector";
import { ModeToggle } from "./ui/mode-toggle";

export const NavBar = () => {
  return (
    <div className="flex gap-3 w-full border-1 rounded-b-2xl border-slate-50 p-3">
      <ModeToggle />
      <ClientTypeSelector />
    </div>
  );
};
