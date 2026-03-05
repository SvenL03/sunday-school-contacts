"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { parseExcelFile } from "@/lib/parse-excel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setError("Please upload an Excel file (.xlsx or .xls).");
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const result = await parseExcelFile(file);
        localStorage.setItem("ss_parse_result", JSON.stringify(result));
        router.push("/preview");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process the file."
        );
        setLoading(false);
      }
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Hero section */}
      <div className="text-center max-w-lg">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">
          Welcome, Teacher!
        </h2>
        <p className="text-blue-600 text-base">
          Upload your class roster spreadsheet and we will create a contacts
          file you can import straight into your iPhone.
        </p>
      </div>

      {/* Upload card */}
      <Card className="w-full max-w-lg shadow-md border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-lg">
            Step 1 — Upload your spreadsheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={[
              "relative flex flex-col items-center justify-center gap-4",
              "border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer",
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400",
            ].join(" ")}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={onInputChange}
            />

            <div className="text-5xl select-none">
              {loading ? "⏳" : isDragging ? "📂" : "📊"}
            </div>

            {loading ? (
              <p className="text-blue-700 font-medium">Processing file…</p>
            ) : (
              <>
                <p className="text-blue-700 font-medium text-center">
                  Drag &amp; drop your Excel file here
                </p>
                <p className="text-blue-400 text-sm">or click to browse</p>
                <p className="text-blue-300 text-xs mt-1">
                  Supports .xlsx and .xls files
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => document.getElementById("file-input")?.click()}
            disabled={loading}
          >
            {loading ? "Processing…" : "Browse for file"}
          </Button>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="w-full max-w-lg border-blue-100 bg-white/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-700 text-base">
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">1.</span>
              Upload your Excel roster (any column layout is fine)
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">2.</span>
              We detect the Name &amp; Email columns automatically
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">3.</span>
              Download a{" "}
              <code className="bg-blue-50 px-1 rounded">.vcf</code> contacts
              file and open it on your iPhone
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
