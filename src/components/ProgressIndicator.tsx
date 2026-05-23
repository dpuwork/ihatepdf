interface ProgressIndicatorProps {
  progress: number; // 0-100
  status?: string;
  showPercentage?: boolean;
}

export default function ProgressIndicator({
  progress,
  status = "Processing...",
  showPercentage = true,
}: ProgressIndicatorProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Create ASCII progress bar
  const totalWidth = 24; // Compact text bar
  const filledCount = Math.round((clampedProgress / 100) * totalWidth);
  const emptyCount = totalWidth - filledCount;
  const barText = `[${"█".repeat(filledCount)}${"░".repeat(emptyCount)}]`;

  return (
    <div className="w-full text-left font-mono text-ink">
      {/* Header with status and percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
        <span className="font-bold text-base uppercase tracking-wider">{status}</span>
        {showPercentage && (
          <span className="font-bold text-base tabular-nums">{Math.round(clampedProgress)}%</span>
        )}
      </div>

      {/* ASCII Progress Bar */}
      <div className="text-xl md:text-2xl font-bold tracking-tight select-none overflow-hidden text-ellipsis whitespace-nowrap mb-2 text-ink">
        {barText}
      </div>

      {/* Completion indicator */}
      {progress >= 100 && (
        <div className="flex items-center gap-2 mt-2 text-success font-bold text-sm">
          <span>[+] Done successfully.</span>
        </div>
      )}
    </div>
  );
}
