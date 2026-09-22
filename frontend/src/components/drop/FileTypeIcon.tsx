import { createElement } from "react";
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { extensionOf } from "../../lib/config";

const BY_EXTENSION: Record<string, LucideIcon> = {
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  gif: ImageIcon,
  webp: ImageIcon,
  svg: ImageIcon,
  pdf: FileText,
  txt: FileText,
  docx: FileText,
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
  zip: FileArchive,
  json: FileCode,
  md: FileCode,
  mp4: FileVideo,
  mov: FileVideo,
  mp3: FileAudio,
  wav: FileAudio,
};

function iconFor(fileName: string, contentType: string): LucideIcon {
  const byExt = BY_EXTENSION[extensionOf(fileName)];
  if (byExt) return byExt;
  if (contentType.startsWith("image/")) return ImageIcon;
  if (contentType.startsWith("video/")) return FileVideo;
  if (contentType.startsWith("audio/")) return FileAudio;
  if (contentType.startsWith("text/")) return FileText;
  return File;
}

const BOX = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-lg",
  lg: "h-14 w-14 rounded-xl",
} as const;

const GLYPH_SIZE = { sm: 15, md: 18, lg: 26 } as const;

export function FileTypeIcon({
  fileName,
  contentType,
  size = "md",
  className,
}: {
  fileName: string;
  contentType: string;
  size?: keyof typeof BOX;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-accent-soft text-accent",
        BOX[size],
        className
      )}
      aria-hidden
    >
      {createElement(iconFor(fileName, contentType), { size: GLYPH_SIZE[size] })}
    </span>
  );
}
