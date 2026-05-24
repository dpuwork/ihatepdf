import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useMemo, useState } from "react";
import FeatureHeader from "../components/FeatureHeader";
import FileDropzone from "../components/FileDropzone";
import ProgressIndicator from "../components/ProgressIndicator";
import {
  downloadAsZip,
  downloadBlob,
  extractPages,
  formatBytes,
  getPdfPageCount,
  parsePageRange,
  type SplitPage as SplitPageType,
  type SplitResult,
  splitPdfAllPages,
  splitPdfByRange,
  validatePageRange,
} from "../lib/pdf-split";

type SplitMode = "all" | "selected";

GlobalWorkerOptions.workerSrc = pdfWorker;

function formatPageRanges(pageNumbers: number[]): string {
  if (pageNumbers.length === 0) return "";

  const ranges: string[] = [];
  let start = pageNumbers[0];
  let end = pageNumbers[0];

  for (let i = 1; i < pageNumbers.length; i += 1) {
    if (pageNumbers[i] === end + 1) {
      end = pageNumbers[i];
      continue;
    }

    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    start = pageNumbers[i];
    end = pageNumbers[i];
  }

  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(",");
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>("selected");
  const [mergeSelectedPages, setMergeSelectedPages] = useState(true);
  const [rangeInput, setRangeInput] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPageCount, setIsLoadingPageCount] = useState(false);
  const [thumbnailByPage, setThumbnailByPage] = useState<Record<number, string>>({});
  const [thumbnailErrorPages, setThumbnailErrorPages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!file) return;

    setIsLoadingPageCount(true);
    getPdfPageCount(file)
      .then((count) => {
        setPageCount(count);
        setRangeInput(`1-${count}`);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to read PDF");
      })
      .finally(() => {
        setIsLoadingPageCount(false);
      });
  }, [file]);

  useEffect(() => {
    if (!pageCount || splitMode === "all") {
      setRangeError(null);
      return;
    }

    if (!rangeInput.trim()) {
      setRangeError("No pages specified");
      return;
    }

    const validation = validatePageRange(rangeInput, pageCount);
    setRangeError(validation.isValid ? null : validation.error || "Invalid range");
  }, [rangeInput, pageCount, splitMode]);

  const selectedPages = useMemo(() => {
    if (!pageCount) return [];
    if (splitMode === "all") {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    if (!rangeInput.trim()) return [];
    const validation = validatePageRange(rangeInput, pageCount);
    if (!validation.isValid) return [];

    try {
      return parsePageRange(rangeInput, pageCount);
    } catch {
      return [];
    }
  }, [rangeInput, pageCount, splitMode]);

  const selectedSet = useMemo(() => new Set(selectedPages), [selectedPages]);

  const previewPages = useMemo(() => {
    if (!pageCount) return [];
    const maxPreview = Math.min(pageCount, 12);
    return Array.from({ length: maxPreview }, (_, index) => index + 1);
  }, [pageCount]);

  useEffect(() => {
    if (!file || previewPages.length === 0) {
      setThumbnailByPage({});
      setThumbnailErrorPages(new Set());
      return;
    }

    let isCancelled = false;
    const renderThumbnails = async () => {
      try {
        const fileBytes = new Uint8Array(await file.arrayBuffer());
        const loadingTask = getDocument({ data: fileBytes });
        const pdfDocument = await loadingTask.promise;

        for (const pageNumber of previewPages) {
          if (isCancelled) {
            break;
          }

          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const targetHeight = 112;
          const scale = targetHeight / baseViewport.height;
          const viewport = page.getViewport({ scale });
          const dpr = window.devicePixelRatio || 1;

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(viewport.width * dpr));
          canvas.height = Math.max(1, Math.floor(viewport.height * dpr));

          const context = canvas.getContext("2d");
          if (!context) {
            if (!isCancelled) {
              setThumbnailErrorPages((previous) => {
                const next = new Set(previous);
                next.add(pageNumber);
                return next;
              });
            }
            continue;
          }

          context.setTransform(dpr, 0, 0, dpr, 0, 0);

          await page.render({
            canvas,
            canvasContext: context,
            viewport,
          }).promise;

          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          if (!isCancelled) {
            setThumbnailByPage((previous) => ({
              ...previous,
              [pageNumber]: dataUrl,
            }));
            setThumbnailErrorPages((previous) => {
              if (!previous.has(pageNumber)) {
                return previous;
              }
              const next = new Set(previous);
              next.delete(pageNumber);
              return next;
            });
          }
        }
      } catch {
        if (!isCancelled) {
          setThumbnailErrorPages(new Set(previewPages));
        }
      }
    };

    setThumbnailByPage({});
    setThumbnailErrorPages(new Set());
    void renderThumbnails();

    return () => {
      isCancelled = true;
    };
  }, [file, previewPages]);

  const outputCount = splitMode === "all" ? (pageCount ?? 0) : selectedPages.length;

  const canSplit = Boolean(
    file &&
      pageCount &&
      !isLoadingPageCount &&
      (splitMode === "all" || (!rangeError && selectedPages.length > 0)),
  );

  const infoText =
    splitMode === "selected"
      ? mergeSelectedPages
        ? "Selected pages will be merged into one PDF file."
        : `Selected pages will be converted into separate PDF files. ${outputCount} PDF ${outputCount === 1 ? "file" : "files"} will be created.`
      : `All pages will be converted into separate PDF files. ${outputCount} PDF ${outputCount === 1 ? "file" : "files"} will be created.`;

  const panelRangeValue = splitMode === "all" && pageCount ? `1-${pageCount}` : rangeInput;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setProgress(0);
    setPageCount(null);
    setThumbnailByPage({});
    setThumbnailErrorPages(new Set());
    setRangeInput("");
    setRangeError(null);
    setSplitMode("selected");
    setMergeSelectedPages(true);
  };

  const handleSplit = async () => {
    if (!file || !pageCount) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setResult(null);

    try {
      let splitResult: SplitResult;

      if (splitMode === "all") {
        splitResult = await splitPdfAllPages(file, setProgress);
      } else {
        const pageNumbers = parsePageRange(rangeInput, pageCount);

        if (mergeSelectedPages) {
          splitResult = await splitPdfByRange(file, formatPageRanges(pageNumbers));
        } else {
          const baseName = file.name.replace(/\.pdf$/i, "");
          const splitPages: SplitPageType[] = [];

          for (let i = 0; i < pageNumbers.length; i += 1) {
            const pageNumber = pageNumbers[i];
            const blob = await extractPages(file, [pageNumber]);

            splitPages.push({
              pageNumbers: [pageNumber],
              blob,
              fileName: `${baseName}_page_${pageNumber}.pdf`,
            });

            setProgress(Math.round(((i + 1) / pageNumbers.length) * 100));
          }

          splitResult = {
            pages: splitPages,
            totalPages: pageCount,
            originalName: file.name,
          };
        }
      }

      setResult(splitResult);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (page: SplitPageType) => {
    downloadBlob(page.blob, page.fileName);
  };

  const handleDownloadAll = async () => {
    if (!result) return;
    const baseName = file?.name.replace(/\.pdf$/i, "") || "split";
    await downloadAsZip(result.pages, `${baseName}_split.zip`);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setPageCount(null);
    setThumbnailByPage({});
    setThumbnailErrorPages(new Set());
    setRangeInput("");
    setRangeError(null);
    setSplitMode("selected");
    setMergeSelectedPages(true);
  };

  const handleTryAgain = () => {
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handlePageToggle = (pageNumber: number) => {
    if (splitMode !== "selected") return;

    const pageSet = new Set(selectedPages);
    if (pageSet.has(pageNumber)) {
      pageSet.delete(pageNumber);
    } else {
      pageSet.add(pageNumber);
    }

    const updated = Array.from(pageSet).sort((a, b) => a - b);
    setRangeInput(formatPageRanges(updated));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 font-mono text-ink">
      {/* Header */}
      <FeatureHeader title={"Split PDF"} descripiton={"Extract specific pages or split every page into separate PDF files."} />

      <div className="space-y-8">
        {!file && !result && (
          <FileDropzone
            onFileSelect={handleFileSelect}
            label="Drop your PDF here to split"
            selectedFile={file}
          />
        )}

        {file && !result && !isProcessing && (
          <div className="overflow-hidden rounded-sm border border-hairline bg-surface-soft">
            {isLoadingPageCount || !pageCount ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="flex items-center gap-3 text-mute font-mono">
                  <svg className="h-5 w-5 animate-spin text-ink" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                    />
                  </svg>
                  <span className="font-bold uppercase tracking-wider text-sm">Loading PDF pages...</span>
                </div>
              </div>
            ) : (
              <div className="grid xl:grid-cols-[1fr_430px]">
                <div className="border-b border-hairline p-6 xl:border-b-0 xl:border-r xl:p-8">
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    <span className="rounded-sm bg-canvas border border-hairline px-3 py-1 text-xs font-mono font-bold text-ink">
                      {file.name}
                    </span>
                    <span className="rounded-sm bg-canvas border border-hairline px-3 py-1 text-xs font-mono font-bold text-ink">
                      {pageCount} {pageCount === 1 ? "page" : "pages"}
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="ml-auto rounded-sm border border-ink bg-canvas px-3 py-1.5 text-xs font-mono font-bold text-ink hover:bg-surface-soft transition-colors"
                    >
                      Change file
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {previewPages.map((pageNumber) => {
                      const isSelected = selectedSet.has(pageNumber);
                      const thumbnail = thumbnailByPage[pageNumber];
                      const hasThumbnailError = thumbnailErrorPages.has(pageNumber);

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => handlePageToggle(pageNumber)}
                          className={`relative rounded-sm border p-3 text-left transition ${
                            splitMode === "selected" ? "cursor-pointer hover:border-ink" : "cursor-default"
                          } ${
                            isSelected
                              ? "border-success bg-canvas text-success"
                              : "border-hairline bg-canvas text-ink"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-sm border border-success bg-canvas text-success text-[10px] font-mono font-bold select-none">
                              [✓]
                            </span>
                          )}

                          <div className="mb-3 h-28 overflow-hidden rounded-sm border border-hairline bg-canvas">
                            <div className="h-full w-full bg-surface-soft">
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt={`Preview of page ${pageNumber}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : hasThumbnailError ? (
                                <div className="flex h-full items-center justify-center text-xs font-mono font-bold text-mute uppercase">
                                  Preview unavailable
                                </div>
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs font-mono font-bold text-mute uppercase">
                                  Rendering...
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-center text-sm font-mono font-bold text-ink">
                            {pageNumber}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {pageCount > previewPages.length && (
                    <p className="mt-4 text-xs font-mono font-bold text-mute uppercase tracking-wider">
                      Showing first {previewPages.length} pages in preview.
                    </p>
                  )}
                </div>

                <aside className="bg-canvas border-t xl:border-t-0 xl:border-l border-hairline">
                  <div className="space-y-6 px-7 py-8">
                    <div>
                      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Extract mode:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSplitMode("all")}
                          className={`rounded-sm border px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                            splitMode === "all"
                              ? "border-ink bg-primary text-on-primary"
                              : "border-hairline bg-canvas text-mute hover:text-ink hover:border-ink"
                          }`}
                        >
                          Extract all pages
                        </button>
                        <button
                          type="button"
                          onClick={() => setSplitMode("selected")}
                          className={`rounded-sm border px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                            splitMode === "selected"
                              ? "border-ink bg-primary text-on-primary"
                              : "border-hairline bg-canvas text-mute hover:text-ink hover:border-ink"
                          }`}
                        >
                          Select pages
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-ink">
                        Pages to extract:
                      </label>
                      <input
                        type="text"
                        value={panelRangeValue}
                        onChange={(event) => setRangeInput(event.target.value)}
                        disabled={splitMode === "all"}
                        placeholder="1-2,4-6"
                        className={`w-full rounded-sm border px-4 py-3 font-mono text-lg font-bold outline-none transition sm:text-xl ${
                          rangeError && splitMode === "selected"
                            ? "border-danger text-danger focus:border-danger bg-canvas"
                            : "border-ink text-ink focus:border-ink bg-canvas"
                        } ${splitMode === "all" ? "cursor-not-allowed bg-surface-soft text-mute border-hairline" : ""}`}
                      />
                      {rangeError && splitMode === "selected" && (
                        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-danger">{rangeError}</p>
                      )}
                    </div>

                    <label
                      className={`flex items-center gap-3 text-xs font-mono uppercase tracking-wider text-ink cursor-pointer ${
                        splitMode !== "selected" ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={mergeSelectedPages}
                        onChange={(event) => setMergeSelectedPages(event.target.checked)}
                        disabled={splitMode !== "selected"}
                        className="h-5 w-5 rounded-sm border border-hairline accent-primary bg-canvas"
                      />
                      <span>Merge extracted pages</span>
                    </label>

                    <div className="rounded-sm border border-accent/20 bg-accent/5 px-4 py-4 text-xs font-mono text-ink leading-relaxed">
                      {infoText}
                    </div>

                    <button
                      type="button"
                      onClick={handleSplit}
                      disabled={!canSplit}
                      className={`w-full py-4 px-6 font-bold text-base uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 ${
                        canSplit
                          ? "bg-primary text-on-primary hover:bg-ink-deep"
                          : "bg-surface-card text-ash cursor-not-allowed border border-hairline"
                      }`}
                    >
                      <span>[+] Split PDF</span>
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="rounded-2xl bg-gray-50 p-8">
            <ProgressIndicator
              progress={progress}
              status={splitMode === "all" ? "Splitting pages..." : "Extracting pages..."}
            />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
            <div className="mb-2 text-lg font-black text-red-700">Error</div>
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleReset}
              className="mt-4 rounded-lg bg-red-600 px-6 py-2 font-bold text-white hover:bg-red-700"
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
            <h3 className="font-bold text-2xl uppercase tracking-wider text-ink">Split Complete</h3>

            <div className="text-center">
              <div className="inline-block bg-canvas border border-success/50 text-success px-6 py-3 rounded-sm font-bold text-base uppercase tracking-wider">
                [✓] Created {result.pages.length} {result.pages.length === 1 ? "file" : "files"} from {result.totalPages} pages
              </div>
            </div>

            {result.pages.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="w-full py-3 px-6 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-ink-deep transition-colors flex items-center justify-center gap-2"
              >
                [+] Download All as ZIP
              </button>
            )}

            <div className="max-h-80 space-y-3 overflow-y-auto">
              {result.pages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-sm border border-hairline bg-canvas p-4 transition-colors hover:border-ink"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-surface-soft font-mono font-bold text-ink border border-hairline">
                      {page.pageNumbers.length === 1
                        ? page.pageNumbers[0]
                        : `${page.pageNumbers[0]}-${page.pageNumbers[page.pageNumbers.length - 1]}`}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-ink">{page.fileName}</div>
                      <div className="text-xs text-mute uppercase">{formatBytes(page.blob.size)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(page)}
                    className="py-1 px-3 border border-ink text-ink bg-canvas font-mono font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-surface-soft transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleTryAgain}
                className="flex-1 py-3 px-6 border border-ink text-ink bg-canvas font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-surface-soft transition-colors"
              >
                Try Split Again
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-6 border border-ink text-ink bg-canvas font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-surface-soft transition-colors"
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
