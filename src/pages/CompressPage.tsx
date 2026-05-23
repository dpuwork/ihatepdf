import { useState } from "react";
import FeatureHeader from "../components/FeatureHeader";
import FileDropzone from "../components/FileDropzone";
import ProgressIndicator from "../components/ProgressIndicator";
import {
  type CompressionResult,
  compressPDF,
  downloadBlob,
  formatBytes,
  getCompressionPercent,
  type CompressionLevel,
} from "../lib/pdf-utils";

const COMPRESSION_LEVELS = [
  {
    id: "print" as const,
    label: "High Quality (300 DPI, Print-Ready)",
    description:
      "Ideal for preserving print quality while compressing. Perfect for scanned documents or image-heavy A4 PDFs.",
  },
  {
    id: "recommended" as const,
    label: "Balanced Quality (150 DPI)",
    description: "Standard web-ready quality with high compression. Recommended for sharing.",
  },
  {
    id: "extreme" as const,
    label: "Extreme Compression (72 DPI)",
    description:
      "Maximum size reduction, lowest resolution. Ideal when document size must be as small as possible.",
  },
  {
    id: "lossless" as const,
    label: "Lossless Optimization (Original DPI)",
    description:
      "Deduplicates objects and optimizes metadata. 100% original pixel quality is completely preserved.",
  },
];

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("recommended");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("Compressing your PDF...");
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressStatus("Compressing your PDF...");
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProgressStatus("Starting compression...");
    setResult(null);

    try {
      const compressionResult = await compressPDF(file, {
        level: compressionLevel,
        onProgress: (nextProgress, status) => {
          setProgress(nextProgress);
          if (status) setProgressStatus(status);
        },
      });

      setResult(compressionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compress PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.fileName);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressStatus("Compressing your PDF...");
  };

  const handleTryAgain = () => {
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressStatus("Compressing your PDF...");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 font-mono text-ink">
      {/* Header */}
      <FeatureHeader
        title={"Compress PDF"}
        descripiton={
          "Reduce your PDF file size while maintaining original vector and image layouts."
        }
      />

      <div className="space-y-8">
        {!result && (
          <FileDropzone
            onFileSelect={handleFileSelect}
            label="Drop your PDF here to compress"
            selectedFile={file}
          />
        )}

        {file && !result && !isProcessing && (
          <div className="bg-surface-soft border border-hairline rounded-sm p-6 space-y-6">
            <div className="p-6 bg-canvas border border-hairline rounded-sm">
              <p className="font-bold text-ink mb-1">[FILE] {file.name}</p>
              <p className="text-mute text-xs uppercase">{formatBytes(file.size)}</p>
            </div>

            {/* Compression Level Selector */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-xs text-ink">
                {"[>] Select Compression Level:"}
              </p>
              <div className="grid gap-3">
                {COMPRESSION_LEVELS.map((lvl) => {
                  const isSelected = compressionLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCompressionLevel(lvl.id)}
                      className={`text-left p-4 rounded-sm border transition-all ${
                        isSelected
                          ? "border-ink bg-canvas border-2"
                          : "border-hairline bg-surface-soft hover:bg-canvas"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-sm text-ink select-none mt-0.5">
                          {isSelected ? "[✓]" : "[ ]"}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-ink uppercase">
                            {lvl.label} {lvl.id === "recommended" ? "(Default)" : ""}
                          </p>
                          <p className="text-xs text-body mt-1 leading-relaxed">
                            {lvl.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs border border-hairline-strong rounded-sm bg-canvas text-ink hover:bg-surface-soft transition-colors"
              >
                [-] Cancel
              </button>
              <button
                onClick={handleCompress}
                className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs text-on-primary bg-primary border border-primary rounded-sm hover:bg-ink-deep transition-colors"
              >
                [+] Compress PDF
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-surface-soft border border-hairline rounded-sm p-8">
            <ProgressIndicator progress={progress} status={progressStatus} />
          </div>
        )}

        {error && (
          <div className="p-6 bg-surface-soft border border-danger rounded-sm">
            <div className="font-bold text-danger text-base uppercase mb-2">[-] Error</div>
            <p className="text-sm text-body mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-danger text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-danger-hover transition-colors"
            >
              [Try Again]
            </button>
          </div>
        )}

        {result && (
          <div className="bg-surface-soft border border-hairline rounded-sm p-8">
            <h3 className="font-bold text-xl mb-6 text-center uppercase tracking-wide">
              Compression Complete!
            </h3>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-canvas rounded-sm p-6 text-center border border-hairline">
                <div className="text-mute text-xs uppercase mb-2">Original Size</div>
                <div className="text-xl font-bold text-ink">{formatBytes(result.originalSize)}</div>
              </div>

              <div className="bg-canvas rounded-sm p-6 text-center border border-ink">
                <div className="text-mute text-xs uppercase mb-2">Compressed Size</div>
                <div className="text-xl font-bold text-success">
                  {formatBytes(result.compressedSize)}
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              {result.compressedSize < result.originalSize ? (
                <div className="inline-block bg-canvas border border-success/50 text-success px-6 py-3 rounded-sm font-bold text-base uppercase tracking-wider">
                  [V] {getCompressionPercent(result.originalSize, result.compressedSize)}% smaller
                </div>
              ) : (
                <div className="inline-block bg-canvas border border-warning/50 text-warning px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-wider">
                  [!] Already well-optimized
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-ink-deep transition-colors"
              >
                [+] Download Compressed PDF
              </button>

              <button
                onClick={handleTryAgain}
                className="py-3 px-6 border border-ink text-ink bg-canvas font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-surface-soft transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={handleReset}
                className="py-3 px-6 border border-ink text-ink bg-canvas font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-surface-soft transition-colors"
              >
                New File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
