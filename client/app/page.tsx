import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <FileUpload />
      <Button>Send</Button>
    </div>
  );
}
