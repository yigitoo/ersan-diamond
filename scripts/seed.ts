import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ersan-diamond";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const db = mongoose.connection.db!;

  // Clear existing data
  const collections = ["users", "products", "leads", "appointments", "sales", "emailthreads", "emails", "calendarevents", "auditlogs"];
  for (const col of collections) {
    try {
      await db.collection(col).drop();
    } catch {
      // Collection may not exist
    }
  }
  console.log("Cleared existing data.");

  // Create OWNER user
  const ownerHash = await bcrypt.hash("ErsanDiamond2024!", 12);
  const owner = await db.collection("users").insertOne({
    name: "Ersan Bey",
    email: "ersan@ersandiamond.com",
    passwordHash: ownerHash,
    role: "OWNER",
    active: true,
    signatureName: "Ersan",
    signatureTitle: "Founder & CEO",
    phoneInternal: "+90 532 000 0000",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Created OWNER:", owner.insertedId);

  // Create ADMIN user
  const adminHash = await bcrypt.hash("Admin2024!", 12);
  const admin = await db.collection("users").insertOne({
    name: "Ayşe Hanım",
    email: "ayse@ersandiamond.com",
    passwordHash: adminHash,
    role: "ADMIN",
    active: true,
    signatureName: "Ayşe",
    signatureTitle: "Concierge Manager",
    phoneInternal: "+90 533 000 0000",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Created ADMIN:", admin.insertedId);

  // Create SALES user
  const salesHash = await bcrypt.hash("Sales2024!", 12);
  const sales = await db.collection("users").insertOne({
    name: "Yuşa Bey",
    email: "yusa@ersandiamond.com",
    passwordHash: salesHash,
    role: "SALES",
    active: true,
    signatureName: "Yuşa",
    signatureTitle: "Senior Sales Consultant",
    phoneInternal: "+90 534 000 0000",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Created SALES:", sales.insertedId);

  // Sample products - Watches
  const watches = [
    {
      category: "WATCH",
      brand: "Rolex",
      model: "Submariner Date",
      reference: "126610LN",
      year: 2023,
      condition: "UNWORN",
      price: 18500,
      currency: "EUR",
      priceOnRequest: false,
      availability: "AVAILABLE",
      title: "Rolex Submariner Date 126610LN",
      description: "The Oyster Perpetual Submariner Date in Oystersteel. Unworn condition with full set.",
      specs: { caseSize: "41mm", caseMaterial: "Oystersteel", dialColor: "Black", bracelet: "Oyster", movement: "Calibre 3235", waterResistance: "300m", boxPapers: "FULL_SET" },
      images: [
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/rolex-submariner-1.jpg", alt: "Rolex Submariner Date 126610LN - Front" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/rolex-submariner-2.jpg", alt: "Rolex Submariner Date 126610LN - Side" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/rolex-submariner-3.jpg", alt: "Rolex Submariner Date 126610LN - Back" },
      ],
      slug: "rolex-submariner-date-126610ln",
      featured: true,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "WATCH",
      brand: "Patek Philippe",
      model: "Nautilus",
      reference: "5711/1A-010",
      year: 2021,
      condition: "EXCELLENT",
      price: null,
      currency: "EUR",
      priceOnRequest: true,
      availability: "AVAILABLE",
      title: "Patek Philippe Nautilus 5711/1A-010",
      description: "The iconic Nautilus with blue dial. Discontinued reference, excellent condition.",
      specs: { caseSize: "40mm", caseMaterial: "Stainless Steel", dialColor: "Blue", bracelet: "Integrated steel", movement: "Calibre 26-330 S C", waterResistance: "120m", boxPapers: "FULL_SET" },
      images: [
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/patek-nautilus-1.jpg", alt: "Patek Philippe Nautilus 5711/1A-010 - Front" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/patek-nautilus-2.jpg", alt: "Patek Philippe Nautilus 5711/1A-010 - Side" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/patek-nautilus-3.jpg", alt: "Patek Philippe Nautilus 5711/1A-010 - Back" },
      ],
      slug: "patek-philippe-nautilus-5711-1a-010",
      featured: true,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "WATCH",
      brand: "Audemars Piguet",
      model: "Royal Oak",
      reference: "15500ST.OO.1220ST.01",
      year: 2022,
      condition: "VERY_GOOD",
      price: 42000,
      currency: "EUR",
      priceOnRequest: false,
      availability: "AVAILABLE",
      title: "Audemars Piguet Royal Oak 15500ST",
      description: "Royal Oak Selfwinding 41mm in stainless steel with blue dial.",
      specs: { caseSize: "41mm", caseMaterial: "Stainless Steel", dialColor: "Blue", bracelet: "Integrated steel", movement: "Calibre 4302", waterResistance: "50m", boxPapers: "FULL_SET" },
      images: [
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/ap-royal-oak-1.jpg", alt: "Audemars Piguet Royal Oak 15500ST - Front" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/ap-royal-oak-2.jpg", alt: "Audemars Piguet Royal Oak 15500ST - Side" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/ap-royal-oak-3.jpg", alt: "Audemars Piguet Royal Oak 15500ST - Back" },
      ],
      slug: "audemars-piguet-royal-oak-15500st",
      featured: true,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "WATCH",
      brand: "Rolex",
      model: "Daytona",
      reference: "116500LN",
      year: 2022,
      condition: "EXCELLENT",
      price: 32000,
      currency: "EUR",
      priceOnRequest: false,
      availability: "AVAILABLE",
      title: "Rolex Cosmograph Daytona 116500LN",
      description: "White dial Daytona with ceramic bezel. Full set, excellent condition.",
      specs: { caseSize: "40mm", caseMaterial: "Oystersteel", dialColor: "White", bracelet: "Oyster", movement: "Calibre 4130", waterResistance: "100m", boxPapers: "FULL_SET" },
      images: [
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/rolex-daytona-1.jpg", alt: "Rolex Cosmograph Daytona 116500LN - Front" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/rolex-daytona-2.jpg", alt: "Rolex Cosmograph Daytona 116500LN - Side" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/rolex-daytona-3.jpg", alt: "Rolex Cosmograph Daytona 116500LN - Back" },
      ],
      slug: "rolex-daytona-116500ln",
      featured: false,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Sample products - Hermes
  const hermes = [
    {
      category: "HERMES",
      brand: "Hermès",
      model: "Birkin 25",
      reference: "",
      year: 2023,
      condition: "UNWORN",
      price: 28000,
      currency: "EUR",
      priceOnRequest: false,
      availability: "AVAILABLE",
      title: "Hermès Birkin 25 Togo Noir GHW",
      description: "Brand new Birkin 25 in Togo leather, Noir colorway with Gold Hardware.",
      specs: { size: "25cm", material: "Togo Leather", color: "Noir", hardware: "Gold", stamp: "Z", dustbag: true, box: true, accessories: "Lock, Keys, Clochette, Raincoat" },
      images: [
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/hermes-birkin-1.jpg", alt: "Hermès Birkin 25 Togo Noir GHW - Front" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/hermes-birkin-2.jpg", alt: "Hermès Birkin 25 Togo Noir GHW - Side" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/hermes-birkin-3.jpg", alt: "Hermès Birkin 25 Togo Noir GHW - Detail" },
      ],
      slug: "hermes-birkin-25-togo-noir-ghw",
      featured: true,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "HERMES",
      brand: "Hermès",
      model: "Kelly 28",
      reference: "",
      year: 2022,
      condition: "EXCELLENT",
      price: 22000,
      currency: "EUR",
      priceOnRequest: false,
      availability: "AVAILABLE",
      title: "Hermès Kelly 28 Epsom Gold PHW",
      description: "Kelly 28 Sellier in Epsom leather, Gold colorway with Palladium Hardware.",
      specs: { size: "28cm", material: "Epsom Leather", color: "Gold", hardware: "Palladium", stamp: "Y", dustbag: true, box: true, accessories: "Shoulder strap, Lock, Keys, Clochette" },
      images: [
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/hermes-kelly-1.jpg", alt: "Hermès Kelly 28 Epsom Gold PHW - Front" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/hermes-kelly-2.jpg", alt: "Hermès Kelly 28 Epsom Gold PHW - Side" },
        { url: "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/products/hermes-kelly-3.jpg", alt: "Hermès Kelly 28 Epsom Gold PHW - Detail" },
      ],
      slug: "hermes-kelly-28-epsom-gold-phw",
      featured: true,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("products").insertMany([...watches, ...hermes]);
  console.log(`Created ${watches.length + hermes.length} products.`);

  // Create indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ role: 1 });
  await db.collection("products").createIndex({ slug: 1 }, { unique: true });
  await db.collection("products").createIndex({ category: 1, availability: 1 });
  await db.collection("products").createIndex({ brand: 1, model: 1 });
  await db.collection("products").createIndex({ featured: 1, createdAt: -1 });
  await db.collection("leads").createIndex({ status: 1, assignedUserId: 1 });
  await db.collection("leads").createIndex({ email: 1 });
  await db.collection("leads").createIndex({ createdAt: -1 });
  await db.collection("appointments").createIndex({ datetimeStart: 1, status: 1 });
  await db.collection("appointments").createIndex({ assignedUserId: 1, datetimeStart: 1 });
  await db.collection("appointments").createIndex({ customerEmail: 1 });
  await db.collection("sales").createIndex({ createdAt: -1 });
  await db.collection("sales").createIndex({ productId: 1 });
  await db.collection("sales").createIndex({ salesRepId: 1 });
  await db.collection("emailthreads").createIndex({ customerEmail: 1 });
  await db.collection("emailthreads").createIndex({ lastMessageAt: -1 });
  await db.collection("emails").createIndex({ threadId: 1, sentAt: 1 });
  await db.collection("calendarevents").createIndex({ ownerUserId: 1, start: 1 });
  await db.collection("auditlogs").createIndex({ createdAt: -1 });
  await db.collection("auditlogs").createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
  console.log("Created indexes.");

  // Sample leads
  await db.collection("leads").insertMany([
    {
      type: "INQUIRY",
      name: "Mehmet Yılmaz",
      phone: "+90 532 111 2233",
      email: "mehmet@example.com",
      source: "WEBSITE",
      notes: "Interested in Rolex Submariner",
      status: "NEW",
      assignedUserId: sales.insertedId,
      tags: ["watch", "rolex"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "SELL_TO_US",
      name: "Fatma Demir",
      phone: "+90 533 444 5566",
      email: "fatma@example.com",
      source: "WEBSITE",
      notes: "Wants to sell Birkin 30",
      status: "NEW",
      productBrand: "Hermès",
      productModel: "Birkin 30",
      productCondition: "EXCELLENT",
      tags: ["hermes", "sell"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Created sample leads.");

  console.log("\n✅ Seed completed successfully!");
  console.log("\nLogin credentials:");
  console.log("  OWNER: ersan@ersandiamond.com / ErsanDiamond2024!");
  console.log("  ADMIN: ayse@ersandiamond.com / Admin2024!");
  console.log("  SALES: yusa@ersandiamond.com / Sales2024!");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
