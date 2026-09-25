"use client";

import { Loader2, Share2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildPayrollShareCaption,
  buildPayrollShareImage,
  type PayrollShareImageInput,
} from "@/features/payroll/utils/payroll-share-image.helper";

type PayrollShareActionProps = {
  shareInput: PayrollShareImageInput;
  className?: string;
};

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function shareImageFile(
  file: File,
  caption: string,
): Promise<"shared" | "fallback"> {
  const payload = { files: [file], title: "Payroll paid", text: caption };

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare(payload) &&
    typeof navigator.share === "function"
  ) {
    await navigator.share(payload);
    return "shared";
  }

  return "fallback";
}

export const PayrollShareAction = ({
  shareInput,
  className,
}: PayrollShareActionProps) => {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);

    try {
      const blob = await buildPayrollShareImage(shareInput);
      const filename = `payroll-${shareInput.kind}-${shareInput.engagementId || "run"}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      const caption = buildPayrollShareCaption(shareInput);
      const result = await shareImageFile(file, caption);

      if (result === "fallback") {
        downloadBlob(blob, filename);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        toast.success("Image ready", {
          description: "Attach the downloaded image in WhatsApp.",
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error(
        error instanceof Error ? error.message : "Could not share payroll.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={() => void handleShare()}
      className={cn(
        "border-2 border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10 hover:text-foreground",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Share2Icon />
      )}
      Share
    </Button>
  );
};
