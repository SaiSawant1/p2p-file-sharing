import { InfoPannel } from "@/components/info-pannel";
import { TestComponent } from "@/components/test-component";
import { FileUpload } from "@/components/ui/file-upload";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <FileUpload />
      <InfoPannel />
      <TestComponent />
    </div>
  );
}
