import { type DragEvent, useState } from "react";
import FeatureHeader from "../components/FeatureHeader";
import MultiFileDropzone from "../components/MultiFileDropzone";
import ProgressIndicator from "../components/ProgressIndicator";
import { downloadBlob, formatBytes, mergePdfs } from "../lib/pdf-merge";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFilesSelect = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
    setResult(null);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
    setResult(null);
  };

  const reorderFiles = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setFiles((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }

      const newFiles = [...prev];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      return newFiles;
    });
    setResult(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || dragOverIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, dropIndex: number) => {
    event.preventDefault();
    if (draggedIndex === null) return;
    reorderFiles(draggedIndex, dropIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setResult(null);

    try {
      const mergedBlob = await mergePdfs(files, setProgress);
      setResult({
        blob: mergedBlob,
        size: mergedBlob.size,
      });
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDFs");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadBlob(result.blob, "merged.pdf");
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 font-mono text-ink">
      {/* Header */}
      <FeatureHeader title={"Merge PDFs"} descripiton={"Combine multiple PDF files into one."} />

      <div className="space-y-8">
        {/* File Upload Area */}
        {!result && !isProcessing && (
          <MultiFileDropzone onFilesSelect={handleFilesSelect} label="Drop PDFs to merge" />
        )}

        {/* File List */}
        {files.length > 0 && !result && !isProcessing && (
          <div className="bg-surface-soft border border-hairline rounded-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base uppercase tracking-wider text-ink">
                Files to Merge ({files.length})
              </h3>
              <button
                onClick={handleReset}
                className="text-xs font-bold uppercase text-danger hover:underline font-mono"
              >
                [-] Clear All
              </button>
            </div>
            <p className="mb-3 text-xs font-mono uppercase text-mute">
              [!] Drag and drop files to reorder.
            </p>
            <div className="space-y-2 max-h-125 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDrop={(event) => handleDrop(event, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-3 bg-canvas p-3 rounded-sm border
                    transition-colors cursor-grab active:cursor-grabbing
                    ${draggedIndex === index ? "opacity-60" : "opacity-100"}
                    ${dragOverIndex === index && draggedIndex !== index ? "border-ink bg-surface-soft" : "border-hairline"}
                  `}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-surface-card rounded-sm text-xs font-bold text-mute font-mono">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{file.name}</div>
                    <div className="text-xs text-mute">{formatBytes(file.size)}</div>
                  </div>
                  <div className="flex bg-surface-card rounded-sm p-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-canvas rounded-sm disabled:opacity-30 transition-colors font-mono"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === files.length - 1}
                      className="p-1 hover:bg-canvas rounded-sm disabled:opacity-30 transition-colors font-mono"
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-mute hover:text-danger hover:bg-surface-soft rounded-sm transition-colors font-mono"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Merge Button */}
            <button
              onClick={handleMerge}
              disabled={files.length < 2}
              className={`
                w-full mt-6 py-3 px-6 font-bold uppercase tracking-wider text-sm rounded-sm
                transition-colors
                ${
                  files.length >= 2
                    ? "bg-primary text-on-primary hover:bg-ink-deep"
                    : "bg-surface-card text-ash cursor-not-allowed"
                }
              `}
            >
              {files.length < 2 ? "[!] Select at least 2 files" : "[+] Merge PDFs"}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-surface-soft border border-hairline rounded-sm p-8">
            <ProgressIndicator progress={progress} status="Merging PDFs..." />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-surface-soft border border-hairline rounded-sm p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold select-none">[✓]</span>
            </div>
            <h3 className="font-bold text-2xl uppercase tracking-wider text-ink">
              Merge Complete!
            </h3>
            <p className="text-sm text-body">
              Your merged PDF is ready ({formatBytes(result.size)})
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-ink-deep transition-colors flex items-center justify-center gap-2"
              >
                [+] Download Merged PDF
              </button>
              <button
                onClick={handleReset}
                className="py-3 px-6 border border-ink text-ink bg-canvas font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-surface-soft transition-colors"
              >
                Try Another
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-6 bg-surface-soft border border-danger rounded-sm">
            <div className="font-bold text-danger text-base uppercase mb-2">[-] Error</div>
            <p className="text-sm text-body mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2 bg-danger text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-danger-hover transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
