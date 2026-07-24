import clsx from "clsx";

export function ProgressBar({
  value,
  label,
  sublabel,
  tone = "brand",
  size = "md",
}: {
  value: number; // 0-100
  label?: string;
  sublabel?: string;
  tone?: "brand" | "warning" | "success" | "danger";
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClass = {
    brand: "bg-brand",
    warning: "bg-warning",
    success: "bg-success",
    danger: "bg-danger",
  }[tone];

  return (
    <div>
      {(label || sublabel) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {sublabel && <span className="text-foreground-muted">{sublabel}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={clsx(
          "w-full overflow-hidden rounded-full bg-surface-muted",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className={clsx("h-full rounded-full transition-[width] duration-500 ease-out", toneClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
