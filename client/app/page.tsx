"use client";
import { InfoPannel } from "@/components/info-pannel";
import { FileUpload } from "@/components/ui/file-upload";
import { useInfoStore } from "@/lib/stores/info-store-provider";
import { JoinSessionForm } from "@/components/join-session-form";

export default function Home() {
  const { clientType } = useInfoStore((state) => state);

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">P2P File Transfer</h1>
        </div>

        {clientType === "receiver"
          ? (
            <div className="w-full">
              <JoinSessionForm />
            </div>
          )
          : (
            <div className="w-full">
              <FileUpload />
            </div>
          )}

        <InfoPannel />
      </div>
    </div>
  );
}
