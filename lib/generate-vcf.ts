import type { Contact } from "./parse-excel";

export function generateVcf(contacts: Contact[]): string {
  return contacts
    .map((c) => {
      const name = c.name.replace(/\n/g, " ").trim();
      const email = c.email.trim();
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nEMAIL:${email}\nEND:VCARD`;
    })
    .join("\n");
}

export function downloadVcf(contacts: Contact[], filename = "contacts.vcf") {
  const content = generateVcf(contacts);
  const blob = new Blob([content], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
