"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildContacts, type Contact, type ParseResult } from "@/lib/parse-excel";
import { downloadVcf } from "@/lib/generate-vcf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PreviewPage() {
  const router = useRouter();

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [nameCol, setNameCol] = useState<string>("");
  const [emailCol, setEmailCol] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [needsManualSelect, setNeedsManualSelect] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [emailList, setEmailList] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ss_parse_result");
      if (!raw) {
        router.push("/");
        return;
      }
      const result: ParseResult = JSON.parse(raw);
      setParseResult(result);

      const nc = result.detectedNameCol ?? result.headers[0] ?? "";
      const ec = result.detectedEmailCol ?? result.headers[1] ?? "";
      setNameCol(nc);
      setEmailCol(ec);

      if (!result.detectedNameCol || !result.detectedEmailCol) {
        setNeedsManualSelect(true);
      }

      const built = buildContacts(result.rows, nc, ec);
      setContacts(built);
      setEmailList(built.map((c) => c.email).filter(Boolean).join(", "));
    } catch {
      router.push("/");
    }
  }, [router]);

  const applyColumnSelection = useCallback(() => {
    if (!parseResult) return;
    const built = buildContacts(parseResult.rows, nameCol, emailCol);
    setContacts(built);
    setEmailList(built.map((c) => c.email).filter(Boolean).join(", "));
    setNeedsManualSelect(false);
  }, [parseResult, nameCol, emailCol]);

  const handleDownloadVcf = () => {
    downloadVcf(contacts, "sunday-school-contacts.vcf");
  };

  const handleCopyEmails = async () => {
    try {
      await navigator.clipboard.writeText(emailList);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      // fallback: select the textarea
      const ta = document.getElementById("email-textarea") as HTMLTextAreaElement | null;
      ta?.select();
    }
  };

  if (!parseResult) {
    return (
      <div className="flex items-center justify-center py-20 text-blue-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back link */}
      <div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-500 hover:text-blue-700 underline underline-offset-2"
        >
          ← Upload a different file
        </button>
      </div>

      {/* Column picker (shown when auto-detect fails) */}
      {needsManualSelect && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 text-base">
              Could not auto-detect columns — please select them
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-amber-700">
                Name column
              </label>
              <select
                value={nameCol}
                onChange={(e) => setNameCol(e.target.value)}
                className="border border-amber-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {parseResult.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-amber-700">
                Email column
              </label>
              <select
                value={emailCol}
                onChange={(e) => setEmailCol(e.target.value)}
                className="border border-amber-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {parseResult.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={applyColumnSelection}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Apply
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} found
          </h2>
          <p className="text-blue-500 text-sm mt-0.5">
            Name column:{" "}
            <span className="font-semibold text-blue-700">{nameCol}</span> •
            Email column:{" "}
            <span className="font-semibold text-blue-700">{emailCol}</span>
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleDownloadVcf}
            disabled={contacts.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Download Contacts (.vcf)
          </Button>
          <Button
            onClick={handleCopyEmails}
            disabled={contacts.length === 0}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {copySuccess ? "Copied!" : "Copy All Emails"}
          </Button>
        </div>
      </div>

      {/* Copy success toast */}
      {copySuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
          All email addresses copied to clipboard!
        </div>
      )}

      {/* Email list textarea */}
      {emailList && (
        <Card className="border-blue-100">
          <CardHeader className="pb-1">
            <CardTitle className="text-blue-700 text-sm font-semibold">
              Email addresses (read-only — copy from here or use the button above)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="email-textarea"
              readOnly
              value={emailList}
              rows={4}
              className="w-full rounded-md border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-900 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </CardContent>
        </Card>
      )}

      {/* Contacts table */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-base">
            Contact Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-700 font-semibold w-8">
                    #
                  </TableHead>
                  <TableHead className="text-blue-700 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="text-blue-700 font-semibold">
                    Email
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-blue-300 text-xs">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium text-blue-900">
                      {contact.name || (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-blue-700">
                      {contact.email || (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
