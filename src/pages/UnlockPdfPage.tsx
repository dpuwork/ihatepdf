import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import ProgressIndicator from "../components/ProgressIndicator";
import FeatureHeader from "../components/FeatureHeader";
import { downloadBlob, formatBytes, unlockPdf } from "../lib/pdf-security";

export default function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(20);
    setError(null);
    try {
      setProgress(50);
      const blob = await unlockPdf(file, password);
      setProgress(100);
      setResult({ blob, originalSize: file.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadBlob(result.blob, `${baseName}_unlocked.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPassword("");
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 font-mono text-ink">
      {/* Header */}
      <FeatureHeader title={"Unlock PDF"} descripiton={"Remove password protection from your PDF."} />

      <div className="space-y-8">
      {!file && <FileDropzone onFileSelect={setFile} label="Drop your protected PDF here" />}

      {file && !result && !isProcessing && (
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 border-4 border-gray-200 rounded-lg space-y-4">
            <p className="font-bold text-gray-600">
              {file.name} — {formatBytes(file.size)}
            </p>

            <div>
              <label className="block font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 font-bold border-4 border-black rounded-lg pr-12"
                  placeholder="Enter PDF password"
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Leave blank if the PDF only has restrictions (no open password).
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="px-6 py-3 font-bold uppercase tracking-wide border-4 border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUnlock}
              className="px-6 py-3 font-bold uppercase tracking-wide text-white bg-black border-4 border-black rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-[0_4px_0_#000] active:translate-y-0 active:shadow-none transition-all"
            >
              Unlock PDF
            </button>
          </div>
        </div>
      )}

      {isProcessing && <ProgressIndicator progress={progress} status="Unlocking PDF..." />}

      {error && (
        <div className="p-4 bg-red-50 border-4 border-red-500 rounded-lg">
          <p className="font-bold text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm font-bold uppercase tracking-wide text-red-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {result && (
        <div className="bg-surface-soft border border-hairline rounded-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold select-none">[✓]</span>
          </div>
          <h3 className="font-bold text-2xl uppercase tracking-wider text-ink">
            PDF Unlocked!
          </h3>
          <p className="text-sm text-body">
            {formatBytes(result.originalSize)} → {formatBytes(result.blob.size)}
          </p>
          <p className="text-xs text-mute uppercase tracking-wide">
            Password protection removed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-6 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-ink-deep transition-colors flex items-center justify-center gap-2"
            >
              [+] Download PDF
            </button>
            <button
              onClick={handleReset}
              className="py-3 px-6 border border-ink text-ink bg-canvas font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-surface-soft transition-colors"
            >
              Process Another
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
