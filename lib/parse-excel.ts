import * as XLSX from "xlsx";

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ParseResult {
  contacts: Contact[];
  headers: string[];
  rows: Record<string, string>[];
  detectedFirstNameCol: string | null;
  detectedLastNameCol: string | null;
  detectedEmailCol: string | null;
  detectedPhoneCol: string | null;
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

        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(
          worksheet,
          { defval: "" }
        );

        if (rows.length === 0) {
          throw new Error("The spreadsheet appears to be empty.");
        }

        const headers = Object.keys(rows[0]);

        const detectedFirstNameCol =
          headers.find((h) => /first\s*name/i.test(h)) ??
          headers.find((h) => /^first$/i.test(h)) ??
          null;

        const detectedLastNameCol =
          headers.find((h) => /last\s*name/i.test(h)) ??
          headers.find((h) => /^last$/i.test(h)) ??
          null;

        const detectedEmailCol =
          headers.find((h) => h.toLowerCase().includes("email")) ?? null;

        const detectedPhoneCol =
          headers.find((h) => /phone|mobile|cell|tel/i.test(h)) ?? null;

        let contacts: Contact[] = [];
        if (detectedFirstNameCol && detectedLastNameCol && detectedEmailCol) {
          contacts = buildContacts(rows, detectedFirstNameCol, detectedLastNameCol, detectedEmailCol, detectedPhoneCol ?? "");
        }

        resolve({
          contacts,
          headers,
          rows,
          detectedFirstNameCol,
          detectedLastNameCol,
          detectedEmailCol,
          detectedPhoneCol,
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
  firstNameCol: string,
  lastNameCol: string,
  emailCol: string,
  phoneCol: string
): Contact[] {
  return rows.map((row) => ({
    firstName: String(row[firstNameCol] ?? "").trim(),
    lastName: String(row[lastNameCol] ?? "").trim(),
    email: String(row[emailCol] ?? "").trim(),
    phone: phoneCol ? String(row[phoneCol] ?? "").trim() : "",
  }));
}
