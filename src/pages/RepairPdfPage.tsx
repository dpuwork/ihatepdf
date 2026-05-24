import { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import ProgressIndicator from "../components/ProgressIndicator";
import FeatureHeader from "../components/FeatureHeader";
import { downloadBlob, formatBytes } from "../lib/shared";

// Dynamic mupdf loader
let mupdfModule: any = null;
async function getMupdf() {
  if (mupdfModule) return mupdfModule;
  (window as any)["$libmupdf_wasm_Module"] = {
    locateFile: (path: string, prefix: string) => {
      if (path.endsWith(".wasm")) return "/mupdf-wasm.wasm";
      return prefix + path;
    },
  };
  mupdfModule = await import("mupdf");
  return mupdfModule;
}

async function repairPdf(file: File): Promise<Blob> {
  const m = await getMupdf();
  const buffer = await file.arrayBuffer();

  // MuPDF will attempt to repair the PDF on load
  const doc = m.Document.openDocument(new Uint8Array(buffer), "application/pdf");
  const pdfDoc = doc.asPDF();
  if (!pdfDoc) throw new Error("Could not open document as PDF");

  // Save with maximum cleanup
  const repairedBuffer = pdfDoc.saveToBuffer("garbage=4,compress=yes,clean=yes");
  const data = new Uint8Array(repairedBuffer.asUint8Array());
  repairedBuffer.destroy();
  return new Blob([data], { type: "application/pdf" });
}

export default function RepairPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRepair = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(10);
    setError(null);
    try {
      setProgress(40);
      const blob = await repairPdf(file);
      setProgress(100);
      setResult({ blob, originalSize: file.size });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to repair PDF. The file may be too corrupted to recover.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadBlob(result.blob, `${baseName}_repaired.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 font-mono text-ink">
      {/* Header */}
      <FeatureHeader title={"Repair PDF"} descripiton={"Recover data from a corrupted PDF file."} />

      <div className="space-y-8">
      {!file && <FileDropzone onFileSelect={setFile} label="Drop your corrupted PDF here" />}

      {file && !result && !isProcessing && (
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 border-4 border-gray-200 rounded-lg">
            <p className="font-bold text-gray-600">{file.name}</p>
            <p className="text-gray-500 text-sm">{formatBytes(file.size)}</p>
          </div>
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>How it works:</strong> This tool uses MuPDF's repair engine to attempt
              recovery of corrupted PDFs. It rebuilds the cross-reference table, removes unused
              objects, and re-compresses streams. Results depend on the severity of corruption.
            </p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="px-6 py-3 font-bold uppercase tracking-wide border-4 border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleRepair}
              className="px-6 py-3 font-bold uppercase tracking-wide text-white bg-black border-4 border-black rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-[0_4px_0_#000] active:translate-y-0 active:shadow-none transition-all"
            >
              Repair PDF
            </button>
          </div>
        </div>
      )}

      {isProcessing && <ProgressIndicator progress={progress} status="Repairing PDF..." />}

      {error && (
        <div className="p-4 bg-red-50 border-4 border-red-500 rounded-lg">
          <p className="font-bold text-red-600">{error}</p>
          <button
            onClick={handleReset}
            className="mt-2 text-sm font-bold uppercase tracking-wide text-red-600 hover:underline"
          >
            Try Another File
          </button>
        </div>
      )}

      {result && (
        <div className="bg-surface-soft border border-hairline rounded-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold select-none">[✓]</span>
          </div>
          <h3 className="font-bold text-2xl uppercase tracking-wider text-ink">
            PDF Repaired!
          </h3>
          <p className="text-sm text-body">
            {formatBytes(result.originalSize)} → {formatBytes(result.blob.size)}
          </p>
          <p className="text-xs text-mute uppercase tracking-wide">
            Cleaned, rebuilt, and compressed.
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
              Repair Another
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
