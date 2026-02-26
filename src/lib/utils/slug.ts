export function generateSlug(brand: string, model: string, reference?: string, id?: string): string {
  const parts = [brand, model];
  if (reference) parts.push(reference);
  if (id) parts.push(id.slice(-6));

  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
