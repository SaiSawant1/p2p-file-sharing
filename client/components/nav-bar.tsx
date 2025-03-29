import { ModeToggle } from "./ui/mode-toggle";

export const NavBar = () => {
  return (
    <div className="flex w-full border-1 rounded-b-2xl border-slate-50 p-3">
      <ModeToggle />
    </div>
  );
};
