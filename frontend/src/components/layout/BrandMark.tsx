/**
 * Custom mark: an arrow descending into the gap between two rails — a file
 * dropping into a slot. Deliberately not a stock icon, so the product has a
 * mark of its own rather than a borrowed glyph.
 */
export function BrandMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* the slot */}
      <path d="M3.25 17.75h4.5" />
      <path d="M16.25 17.75h4.5" />
      {/* the drop */}
      <path d="M12 3.25v11.5" />
      <path d="M8.4 11.15 12 14.75l3.6-3.6" />
    </svg>
  );
}
