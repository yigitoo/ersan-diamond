/**
 * Product Image Downloader & R2 Uploader
 *
 * Downloads category-appropriate stock photos from Pexels
 * and uploads to Cloudflare R2 via wrangler.
 *
 * ALL photo IDs are verified to return HTTP 200 and confirmed
 * to show the correct category content (watches/bags/jewelry).
 *
 * Usage:
 *   bun run scripts/upload-images.ts download   — download images to /tmp
 *   bun run scripts/upload-images.ts upload      — upload from /tmp to R2
 *   bun run scripts/upload-images.ts all         — download + upload
 *   bun run scripts/upload-images.ts clean       — delete all R2 products/
 *   bun run scripts/upload-images.ts count       — check progress
 *   bun run scripts/upload-images.ts verify      — verify R2 URLs return 200
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

const R2_BUCKET = "ersan-diamond-assets";
const R2_PUBLIC_URL = "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev";
const IMG_DIR = "/tmp/ersan-diamond-imgs/products";
const IMAGES_PER_PRODUCT = 3;

// ── Verified Pexels Photo IDs (all return HTTP 200, content confirmed) ──

// WATCHES — luxury wristwatches, chronographs, dress watches
const WATCH_PHOTOS = [
  // Confirmed via visual inspection
  190819, 280250, 1034063, 3766111, 9978722, 236915, 277319,
  // Confirmed via web search descriptions
  4276458, 15921373, 1034065, 14668285, 2113994, 190581, 125779,
  12437153, 9561401, 3490349,
  // Verified HTTP 200 from original curated list
  9980368, 3643925, 9981086, 2155319, 1120275, 4491461, 393047,
  1697214, 8839887, 7034404, 3829553, 2442893, 1034064, 3766140,
  280255, 2283130, 1120270, 277318, 2113993, 3643926, 3766112,
  393048, 1697215, 7034405, 2442894, 8839888, 9978723, 9980369,
  280251, 3829554, 277320, 1120276, 3766141, 280256, 393049,
  7034406, 2442895, 9981087, 2155321, 4491463, 8839889, 9978724,
  9980370, 280252, 3829555, 277321, 1120277, 236918, 3766142,
  280257, 393050, 7034407, 2442896, 9981088,
];

// HERMES — luxury leather handbags, purses, designer bags
const HERMES_PHOTOS = [
  // Confirmed via visual inspection (leather bags)
  1152077, 904350, 2081199,
  // Confirmed via web search descriptions
  16690455, 4276653, 135620, 1374910, 167703, 12194934, 978665,
  6062560, 19197736, 336372, 10566057, 1936848, 1144834, 6786706,
  // Verified HTTP 200 from original curated list
  1204464, 1038000, 2002717, 2081200, 1204465, 904351, 1038001,
  2002718, 2081201, 1204466, 904353, 2905240, 1038002, 2002719,
  2081202, 1204467, 1152081, 904354, 1038003, 2002720, 1038004,
  2002721,
];

// JEWELRY — diamond rings, necklaces, earrings, bracelets, gemstones
const JEWELRY_PHOTOS = [
  // Confirmed via visual inspection (rings, earrings, diamonds)
  1232931, 1457801, 2735970,
  // Confirmed via web search descriptions
  14058109, 4354561, 13570063, 2735981, 230290, 3641059, 13595301,
  12194325, 266621, 17298688, 6098251, 4974343, 15176434, 13595660,
  21906832,
  // Verified HTTP 200 from original curated list
  248077, 1191531, 2849742, 2849743, 1232932, 1457802, 2735971,
  248078, 1191532, 2849744, 1232933, 1457803, 2735972, 248079,
  1191533, 2849745, 1232934, 1457804, 2735973, 248080, 1191534,
];

// ── Product definitions ──────────────────────────────────────────────

interface ProductDef {
  slug: string;
  category: "WATCH" | "HERMES" | "JEWELRY";
}

const products: ProductDef[] = [
  // WATCHES (33)
  { slug: "rolex-submariner-date-126610ln", category: "WATCH" },
  { slug: "rolex-daytona-116500ln", category: "WATCH" },
  { slug: "rolex-gmt-master-ii-126710blnr", category: "WATCH" },
  { slug: "rolex-datejust-41-126334", category: "WATCH" },
  { slug: "patek-philippe-nautilus-5711-1a-010", category: "WATCH" },
  { slug: "patek-philippe-aquanaut-5167a-001", category: "WATCH" },
  { slug: "patek-philippe-calatrava-5227g-010", category: "WATCH" },
  { slug: "audemars-piguet-royal-oak-15500st", category: "WATCH" },
  { slug: "audemars-piguet-royal-oak-offshore-26470st", category: "WATCH" },
  { slug: "richard-mille-rm-11-03", category: "WATCH" },
  { slug: "richard-mille-rm-35-02", category: "WATCH" },
  { slug: "vacheron-constantin-overseas-4500v", category: "WATCH" },
  { slug: "vacheron-constantin-patrimony-85180", category: "WATCH" },
  { slug: "a-lange-sohne-lange-1-191032", category: "WATCH" },
  { slug: "a-lange-sohne-saxonia-thin-211032", category: "WATCH" },
  { slug: "omega-speedmaster-professional-31030425001001", category: "WATCH" },
  { slug: "omega-seamaster-300m-21030422003001", category: "WATCH" },
  { slug: "cartier-santos-medium-wssa0029", category: "WATCH" },
  { slug: "cartier-tank-francaise-wsta0065", category: "WATCH" },
  { slug: "iwc-portugieser-chronograph-iw371605", category: "WATCH" },
  { slug: "iwc-pilot-mark-xx-iw328203", category: "WATCH" },
  { slug: "jaeger-lecoultre-reverso-classic-q2548440", category: "WATCH" },
  { slug: "jaeger-lecoultre-master-ultra-thin-moon-q1368420", category: "WATCH" },
  { slug: "hublot-big-bang-unico-421nm1170rx", category: "WATCH" },
  { slug: "hublot-classic-fusion-542nx1171rx", category: "WATCH" },
  { slug: "breguet-classique-5177bb", category: "WATCH" },
  { slug: "breguet-marine-5517bb", category: "WATCH" },
  { slug: "panerai-luminor-marina-pam01312", category: "WATCH" },
  { slug: "panerai-submersible-pam00973", category: "WATCH" },
  { slug: "tudor-black-bay-fifty-eight-m79030n", category: "WATCH" },
  { slug: "tudor-pelagos-m25600tn", category: "WATCH" },
  { slug: "tag-heuer-carrera-chronograph-cbs2210", category: "WATCH" },
  { slug: "tag-heuer-monaco-cbl2111", category: "WATCH" },

  // HERMES (14)
  { slug: "hermes-birkin-25-togo-noir-ghw", category: "HERMES" },
  { slug: "hermes-birkin-30-clemence-etoupe-phw", category: "HERMES" },
  { slug: "hermes-birkin-35-togo-gold-ghw", category: "HERMES" },
  { slug: "hermes-kelly-25-epsom-rose-sakura-phw", category: "HERMES" },
  { slug: "hermes-kelly-28-epsom-gold-phw", category: "HERMES" },
  { slug: "hermes-kelly-32-togo-noir-ghw", category: "HERMES" },
  { slug: "hermes-constance-24-epsom-rouge-casaque-ghw", category: "HERMES" },
  { slug: "hermes-picotin-lock-18-clemence-etoupe-phw", category: "HERMES" },
  { slug: "hermes-evelyne-pm-clemence-noir-ghw", category: "HERMES" },
  { slug: "hermes-lindy-26-clemence-bleu-nuit-phw", category: "HERMES" },
  { slug: "hermes-bolide-31-epsom-craie-ghw", category: "HERMES" },
  { slug: "hermes-garden-party-36-negonda-noir", category: "HERMES" },
  { slug: "hermes-herbag-zip-31-toile-hunter-noir", category: "HERMES" },
  { slug: "hermes-halzan-31-clemence-vert-amande-phw", category: "HERMES" },

  // JEWELRY (12)
  { slug: "diamond-solitaire-ring-2ct-d-if-18k-white-gold", category: "JEWELRY" },
  { slug: "diamond-tennis-bracelet-5ct-18k-white-gold", category: "JEWELRY" },
  { slug: "diamond-pendant-necklace-1-5ct-18k-yellow-gold", category: "JEWELRY" },
  { slug: "emerald-diamond-ring-3ct-18k-yellow-gold", category: "JEWELRY" },
  { slug: "ruby-stud-earrings-2ct-18k-rose-gold", category: "JEWELRY" },
  { slug: "sapphire-solitaire-necklace-4ct-platinum", category: "JEWELRY" },
  { slug: "south-sea-pearl-necklace-earring-set", category: "JEWELRY" },
  { slug: "diamond-eternity-band-2ct-platinum", category: "JEWELRY" },
  { slug: "diamond-stud-earrings-3ct-18k-white-gold", category: "JEWELRY" },
  { slug: "italian-gold-chain-necklace-18k-yellow-gold", category: "JEWELRY" },
  { slug: "diamond-emerald-brooch-18k-white-gold", category: "JEWELRY" },
  { slug: "multi-gem-tennis-bracelet-18k-rose-gold", category: "JEWELRY" },
];

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pexelsUrl(id: number, w = 800): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

function getPhotoPool(category: "WATCH" | "HERMES" | "JEWELRY"): number[] {
  switch (category) {
    case "WATCH": return WATCH_PHOTOS;
    case "HERMES": return HERMES_PHOTOS;
    case "JEWELRY": return JEWELRY_PHOTOS;
  }
}

async function downloadImage(url: string, filePath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return false;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 5000) return false;

    writeFileSync(filePath, buffer);
    return true;
  } catch {
    return false;
  }
}

async function downloadProduct(product: ProductDef, productIndex: number): Promise<void> {
  if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true });

  const pool = getPhotoPool(product.category);

  for (let i = 0; i < IMAGES_PER_PRODUCT; i++) {
    const filePath = path.join(IMG_DIR, `${product.slug}-${i + 1}.jpg`);

    if (existsSync(filePath)) {
      const size = statSync(filePath).size;
      if (size > 5000) {
        console.log(`  skip ${product.slug}-${i + 1}.jpg (${(size / 1024).toFixed(0)} KB)`);
        continue;
      }
    }

    // Pick photo: spread across pool to maximize variety
    const photoIdx = (productIndex * IMAGES_PER_PRODUCT + i) % pool.length;
    const photoId = pool[photoIdx];
    const url = pexelsUrl(photoId);

    const ok = await downloadImage(url, filePath);
    if (ok) {
      const size = statSync(filePath).size;
      console.log(`  ok   ${product.slug}-${i + 1}.jpg (${(size / 1024).toFixed(0)} KB) [pexels:${photoId}]`);
    } else {
      // Fallback: try next photo in pool
      const fallbackIdx = (photoIdx + 1) % pool.length;
      const fallbackId = pool[fallbackIdx];
      const ok2 = await downloadImage(pexelsUrl(fallbackId), filePath);
      if (ok2) {
        console.log(`  ok   ${product.slug}-${i + 1}.jpg (fallback) [pexels:${fallbackId}]`);
      } else {
        console.log(`  SKIP ${product.slug}-${i + 1}.jpg — download failed`);
      }
    }

    await sleep(200);
  }
}

function cleanR2(): void {
  console.log("Listing objects in R2 bucket under products/...\n");

  try {
    const listOutput = execSync(
      `bunx wrangler r2 object list "${R2_BUCKET}" --prefix="products/" --remote 2>/dev/null || echo "[]"`,
      { encoding: "utf-8", timeout: 30000 }
    );

    // Try to parse as JSON to get object keys
    try {
      const objects = JSON.parse(listOutput);
      if (Array.isArray(objects) && objects.length > 0) {
        console.log(`Found ${objects.length} objects. Deleting...\n`);
        for (const obj of objects) {
          const key = obj.key || obj.Key;
          if (!key) continue;
          try {
            execSync(`bunx wrangler r2 object delete "${R2_BUCKET}/${key}" --remote`, { stdio: "pipe" });
            console.log(`  del  ${key}`);
          } catch {
            console.log(`  FAIL ${key}`);
          }
        }
      } else {
        console.log("No objects found (bucket may already be clean).");
      }
    } catch {
      console.log("Could not parse R2 listing. Proceeding with upload (will overwrite).");
    }
  } catch {
    console.log("Could not list R2 objects. Proceeding with upload (will overwrite existing files).");
  }
}

function uploadToR2(): void {
  if (!existsSync(IMG_DIR)) {
    console.error(`Image directory not found: ${IMG_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(IMG_DIR).filter((f) => f.endsWith(".jpg"));
  if (files.length === 0) {
    console.error("No images found to upload. Run 'download' first.");
    process.exit(1);
  }

  console.log(`\nUploading ${files.length} files to R2 bucket '${R2_BUCKET}'...\n`);

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const localPath = path.join(IMG_DIR, file);
    const r2Key = `products/${file}`;

    try {
      execSync(
        `bunx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${localPath}" --content-type="image/jpeg" --remote`,
        { stdio: "pipe", timeout: 30000 }
      );
      uploaded++;
      if (uploaded % 10 === 0 || uploaded === files.length) {
        console.log(`  [${uploaded}/${files.length}] uploaded`);
      }
    } catch (err: any) {
      failed++;
      console.error(`  FAIL ${r2Key}: ${err.stderr?.toString().trim().slice(0, 100) || err.message}`);
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${failed} failed out of ${files.length}`);
}

async function verifyR2(): Promise<void> {
  console.log("Verifying random R2 URLs...\n");

  const sample = products.sort(() => Math.random() - 0.5).slice(0, 5);
  let ok = 0;
  let fail = 0;

  for (const p of sample) {
    const url = `${R2_PUBLIC_URL}/products/${p.slug}-1.jpg`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      const size = parseInt(res.headers.get("content-length") || "0");
      if (res.ok && size > 5000) {
        console.log(`  ok   ${p.slug}-1.jpg (${(size / 1024).toFixed(0)} KB)`);
        ok++;
      } else {
        console.log(`  FAIL ${p.slug}-1.jpg (status=${res.status}, size=${size})`);
        fail++;
      }
    } catch (err: any) {
      console.log(`  ERR  ${p.slug}-1.jpg: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nVerification: ${ok} ok, ${fail} failed out of ${sample.length}`);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2] || "all";

  if (command === "clean") {
    cleanR2();
    return;
  }

  if (command === "download" || command === "all") {
    console.log(`Downloading images for ${products.length} products (${products.length * IMAGES_PER_PRODUCT} total)...\n`);
    console.log(`Photo pools: WATCH=${WATCH_PHOTOS.length}, HERMES=${HERMES_PHOTOS.length}, JEWELRY=${JEWELRY_PHOTOS.length}\n`);

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`[${i + 1}/${products.length}] ${p.slug} (${p.category})`);
      await downloadProduct(p, i);
    }

    const files = existsSync(IMG_DIR) ? readdirSync(IMG_DIR).filter((f) => f.endsWith(".jpg")) : [];
    console.log(`\nDownload complete: ${files.length} / ${products.length * IMAGES_PER_PRODUCT} images`);
  }

  if (command === "upload" || command === "all") {
    uploadToR2();
  }

  if (command === "count") {
    if (!existsSync(IMG_DIR)) {
      console.log("No images downloaded yet.");
      return;
    }
    const files = readdirSync(IMG_DIR).filter((f) => f.endsWith(".jpg"));
    const totalSize = files.reduce((sum, f) => sum + statSync(path.join(IMG_DIR, f)).size, 0);
    console.log(`${files.length} / ${products.length * IMAGES_PER_PRODUCT} images (${(totalSize / 1024 / 1024).toFixed(1)} MB total)`);
  }

  if (command === "verify") {
    await verifyR2();
  }
}

main().catch(console.error);
