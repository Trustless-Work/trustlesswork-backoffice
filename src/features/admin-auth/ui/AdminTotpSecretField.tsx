"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type AdminTotpSecretFieldProps = {
  secret: string;
};

const COPIED_FEEDBACK_MS = 2000;

/**
 * Manual-entry fallback for operators who cannot scan the QR code.
 *
 * Read-only and never logged: this value is the TOTP secret.
 */
export const AdminTotpSecretField = ({ secret }: AdminTotpSecretFieldProps) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      return;
    }

    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }, [secret]);

  return (
    <InputGroup>
      <InputGroupInput
        value={secret}
        readOnly
        spellCheck={false}
        aria-label="Two-factor setup key"
        className="font-mono text-xs"
        onFocus={(event) => event.currentTarget.select()}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          aria-label={copied ? "Setup key copied" : "Copy setup key"}
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};
