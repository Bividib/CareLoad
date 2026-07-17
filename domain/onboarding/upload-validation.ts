const allowedExtensions = new Set(["pdf", "txt", "md"]);
const allowedMimes = new Set(["application/pdf", "text/plain", "text/markdown", "application/octet-stream"]);
export const maximumDocumentBytes = 5 * 1024 * 1024;

export function sanitiseFilename(name: string) {
  const basename = name.replaceAll("\\", "/").split("/").pop() ?? "document";
  return basename.normalize("NFKD").replace(/[^\w.\- ]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 100).toLowerCase() || "document";
}

export function validateUpload(file: { name: string; type: string; size: number }) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions.has(extension) || !allowedMimes.has(file.type || "application/octet-stream")) return { ok: false as const, error: "Use a PDF, TXT, or Markdown file." };
  if (file.size > maximumDocumentBytes) return { ok: false as const, error: "Each document must be 5 MB or smaller." };
  return { ok: true as const, safeName: sanitiseFilename(file.name) };
}
