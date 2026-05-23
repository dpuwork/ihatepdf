import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

interface MultiFileDropzoneProps {
  onFilesSelect: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export default function MultiFileDropzone({
  onFilesSelect,
  accept = ".pdf",
  maxSizeMB = 100,
  label = "Drop your PDFs here",
}: MultiFileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFiles = (fileList: FileList | File[]) => {
    setError(null);
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      // Check file type if accept is PDF
      if (accept === ".pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        errors.push(`${file.name}: Not a PDF`);
        return;
      }

      // Check file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        errors.push(`${file.name}: Exceeds ${maxSizeMB}MB limit`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors[0]); // Just show first error for now
    }

    if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    }
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

    if (e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
    }
    // Reset input value to allow selecting same files again
    if (inputRef.current) {
      inputRef.current.value = "";
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
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        {/* ASCII Icon Replacement */}
        <div className="mx-auto mb-4 text-xl font-bold text-ink">
          {isDragging ? "[DROP]" : "[ + ]"}
        </div>

        {/* Text */}
        <h3 className="text-base font-bold mb-2 text-ink">{`[ ${label.toUpperCase()} ]`}</h3>
        <p className="text-xs text-mute uppercase">
          Click to select or drop multiple files manually
        </p>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-surface-dark/5 flex items-center justify-center rounded-sm">
            <span className="text-sm font-bold uppercase tracking-wider text-ink">
              [!] Drop files here
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
