"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

type AnalyticsSearchInputProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export const AnalyticsSearchInput = ({
  value,
  placeholder,
  onChange,
}: AnalyticsSearchInputProps) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      onChange(draft.trim());
    }, 300);

    return () => window.clearTimeout(handle);
  }, [draft, onChange]);

  return (
    <div className="relative">
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        className="h-8 pl-8 text-sm"
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    </div>
  );
};
