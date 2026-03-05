import * as XLSX from "xlsx";

export interface Contact {
  name: string;
  email: string;
}

export interface ParseResult {
  contacts: Contact[];
  headers: string[];
  rows: Record<string, string>[];
  detectedNameCol: string | null;
  detectedEmailCol: string | null;
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Could not read file");

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to array of objects
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(
          worksheet,
          { defval: "" }
        );

        if (rows.length === 0) {
          throw new Error("The spreadsheet appears to be empty.");
        }

        // Get headers
        const headers = Object.keys(rows[0]);

        // Auto-detect name and email columns
        const detectedNameCol =
          headers.find((h) => h.toLowerCase().includes("name")) ?? null;
        const detectedEmailCol =
          headers.find((h) => h.toLowerCase().includes("email")) ?? null;

        // Build contacts if both columns detected
        let contacts: Contact[] = [];
        if (detectedNameCol && detectedEmailCol) {
          contacts = rows.map((row) => ({
            name: String(row[detectedNameCol] ?? "").trim(),
            email: String(row[detectedEmailCol] ?? "").trim(),
          }));
        }

        resolve({
          contacts,
          headers,
          rows,
          detectedNameCol,
          detectedEmailCol,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function buildContacts(
  rows: Record<string, string>[],
  nameCol: string,
  emailCol: string
): Contact[] {
  return rows.map((row) => ({
    name: String(row[nameCol] ?? "").trim(),
    email: String(row[emailCol] ?? "").trim(),
  }));
}
