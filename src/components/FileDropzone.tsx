import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { formatBytes } from "../lib/shared";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  selectedFile?: File | null;
}

export default function FileDropzone({
  onFileSelect,
  accept = ".pdf",
  maxSizeMB = 100,
  label = "Drop your PDF here",
  selectedFile,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize fileName from selectedFile if provided
  if (selectedFile && !fileName) {
    setFileName(`${selectedFile.name} (${formatBytes(selectedFile.size)})`);
  }

  const validateAndProcessFile = (file: File) => {
    setError(null);

    // Check file type if accept is PDF
    if (accept === ".pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file");
      return;
    }

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setFileName(`${file.name} (${formatBytes(file.size)})`);
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full font-mono">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border border-dashed p-12 text-center cursor-pointer transition-colors rounded-sm
          ${
            isDragging
              ? "border-ink bg-surface-card"
              : "border-hairline-strong bg-surface-soft hover:bg-surface-card"
          }
          ${fileName ? "bg-surface-soft" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        {/* ASCII Icon Replacement */}
        <div className="mx-auto mb-4 text-xl font-bold text-ink">
          {isDragging ? "[DROP]" : "[ + ]"}
        </div>

        {/* Text */}
        <h3 className="text-base font-bold mb-2 text-ink">
          {fileName ? `[SELECTED] ${fileName}` : `[ ${label.toUpperCase()} ]`}
        </h3>
        <p className="text-xs text-mute uppercase">
          {fileName ? "Click or drop to replace file" : "or click to select file manually"}
        </p>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-surface-dark/5 flex items-center justify-center rounded-sm">
            <span className="text-sm font-bold uppercase tracking-wider text-ink">
              [!] Drop file here
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-surface-soft border border-danger text-danger text-sm font-bold rounded-sm uppercase tracking-wide">
          [-] Error: {error}
        </div>
      )}
    </div>
  );
}
