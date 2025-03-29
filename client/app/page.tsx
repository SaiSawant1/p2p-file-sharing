import { ChatComponent } from "@/components/chat-component";
import { FileUpload } from "@/components/ui/file-upload";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <FileUpload />
      <ChatComponent />
    </div>
  );
}
