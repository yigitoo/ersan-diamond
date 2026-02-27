const turkishCharMap: Record<string, string> = {
  "ç": "c",
  "ğ": "g",
  "ı": "i",
  "ö": "o",
  "ş": "s",
  "ü": "u",
  "İ": "i",
};

function replaceTurkishChars(str: string): string {
  return str.replace(/[çğıöşüİ]/g, (ch) => turkishCharMap[ch] || ch);
}

export function generateSlug(brand: string, model: string, reference?: string, id?: string): string {
  const parts = [brand, model];
  if (reference) parts.push(reference);
  if (id) parts.push(id.slice(-6));

  return replaceTurkishChars(
    parts
      .join("-")
      .toLocaleLowerCase("tr")
  )
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugify(text: string): string {
  return replaceTurkishChars(text.toLocaleLowerCase("tr"))
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
