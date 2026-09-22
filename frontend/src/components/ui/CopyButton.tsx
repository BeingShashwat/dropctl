import { useEffect, useRef, useState } from "react";
import { Check, Copy, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "./Button";
import { IconButton } from "./IconButton";
import { copyText, cn } from "../../lib/utils";

function useCopyState() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copy };
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "secondary",
  size = "md",
  icon: Icon = Copy,
  className,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  icon?: LucideIcon;
  className?: string;
}) {
  const { copied, copy } = useCopyState();

  return (
    <Button
      variant={variant}
      size={size}
      icon={copied ? Check : Icon}
      onClick={() => copy(value)}
      className={cn(copied && "text-success", className)}
      aria-live="polite"
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

export function CopyIconButton({
  value,
  label = "Copy to clipboard",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const { copied, copy } = useCopyState();

  return (
    <IconButton
      icon={copied ? Check : Copy}
      label={copied ? "Copied" : label}
      onClick={() => copy(value)}
      className={cn(copied && "text-success", className)}
    />
  );
}
