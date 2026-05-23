import type { WasmModule as GhostscriptModule } from "@jspawn/ghostscript-wasm";

let ghostscriptModulePromise: Promise<GhostscriptModule> | null = null;

function createRunId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeUnlink(module: { FS: { unlink: (path: string) => void } }, path: string): void {
  try {
    module.FS.unlink(path);
  } catch {
    // Ignore cleanup failures.
  }
}

async function loadGhostscriptModule(): Promise<GhostscriptModule> {
  if (!ghostscriptModulePromise) {
    ghostscriptModulePromise = import("@jspawn/ghostscript-wasm").then(
      ({ default: createGhostscriptModule }) =>
        createGhostscriptModule({
          locateFile: (path, prefix) =>
            path.endsWith(".wasm") ? "/ghostscript-wasm.wasm" : `${prefix || ""}${path}`,
          print: () => undefined,
          printErr: () => undefined,
        }),
    );
  }

  return ghostscriptModulePromise;
}

export async function compressGhostscript(
  file: File,
  level: "extreme" | "recommended" | "print" | "lossless",
): Promise<Blob> {
  const ghostscript = await loadGhostscriptModule();
  const inputBytes = new Uint8Array(await file.arrayBuffer());
  const runId = createRunId("ghostscript");
  const inputPath = `/${runId}-input.pdf`;
  const outputPath = `/${runId}-output.pdf`;

  ghostscript.FS.writeFile(inputPath, inputBytes);

  const args = [
    "-sDEVICE=pdfwrite",
    "-dNOPAUSE",
    "-dBATCH",
    "-dQUIET",
    "-dDetectDuplicateImages=true",
    "-dCompressFonts=true",
    "-dSubsetFonts=true",
  ];

  if (level === "extreme") {
    args.push(
      "-dPDFSETTINGS=/screen",
      "-dDownsampleColorImages=true",
      "-dColorImageResolution=72",
      "-dColorImageDownsampleType=/Bicubic",
      "-dColorImageFilter=/DCTEncode",
      "-dDownsampleGrayImages=true",
      "-dGrayImageResolution=72",
      "-dGrayImageDownsampleType=/Bicubic",
      "-dGrayImageFilter=/DCTEncode",
      "-dDownsampleMonoImages=true",
      "-dMonoImageResolution=150",
      "-dMonoImageDownsampleType=/Bicubic",
      "-dMonoImageFilter=/CCITTFaxEncode",
    );
  } else if (level === "recommended") {
    args.push(
      "-dPDFSETTINGS=/ebook",
      "-dDownsampleColorImages=true",
      "-dColorImageResolution=150",
      "-dColorImageDownsampleType=/Bicubic",
      "-dColorImageFilter=/DCTEncode",
      "-dDownsampleGrayImages=true",
      "-dGrayImageResolution=150",
      "-dGrayImageDownsampleType=/Bicubic",
      "-dGrayImageFilter=/DCTEncode",
      "-dDownsampleMonoImages=true",
      "-dMonoImageResolution=300",
      "-dMonoImageDownsampleType=/Bicubic",
      "-dMonoImageFilter=/CCITTFaxEncode",
    );
  } else if (level === "print") {
    args.push(
      "-dPDFSETTINGS=/printer",
      "-dDownsampleColorImages=true",
      "-dColorImageResolution=300",
      "-dColorImageDownsampleType=/Bicubic",
      "-dColorImageFilter=/DCTEncode",
      "-dDownsampleGrayImages=true",
      "-dGrayImageResolution=300",
      "-dGrayImageDownsampleType=/Bicubic",
      "-dGrayImageFilter=/DCTEncode",
      "-dDownsampleMonoImages=true",
      "-dMonoImageResolution=300",
      "-dMonoImageDownsampleType=/Bicubic",
      "-dMonoImageFilter=/CCITTFaxEncode",
    );
  } else {
    // lossless
    args.push(
      "-dPDFSETTINGS=/prepress",
      "-dDownsampleColorImages=false",
      "-dDownsampleGrayImages=false",
      "-dDownsampleMonoImages=false",
      "-dAutoFilterColorImages=false",
      "-dAutoFilterGrayImages=false",
      "-dColorImageFilter=/FlateEncode",
      "-dGrayImageFilter=/FlateEncode",
      "-dMonoImageFilter=/CCITTFaxEncode",
    );
  }

  args.push(`-sOutputFile=${outputPath}`, inputPath);

  try {
    const exitCode = ghostscript.callMain(args);

    if (exitCode !== 0) {
      throw new Error(`Ghostscript exited with code ${exitCode}`);
    }

    const outputBytes = ghostscript.FS.readFile(outputPath);
    return new Blob([new Uint8Array(outputBytes)], { type: "application/pdf" });
  } finally {
    safeUnlink(ghostscript, inputPath);
    safeUnlink(ghostscript, outputPath);
  }
}
