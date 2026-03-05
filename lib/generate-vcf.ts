import type { Contact } from "./parse-excel";

export function generateVcf(contacts: Contact[]): string {
  return contacts
    .map((c) => {
      const firstName = c.firstName.replace(/\n/g, " ").trim();
      const lastName = c.lastName.replace(/\n/g, " ").trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const email = c.email.trim();
      const phone = c.phone.trim();

      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName};${firstName};;;`,
        `FN:${fullName}`,
      ];
      if (email) lines.push(`EMAIL:${email}`);
      if (phone) lines.push(`TEL:${phone}`);
      lines.push("END:VCARD");

      return lines.join("\n");
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
