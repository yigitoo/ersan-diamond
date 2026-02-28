import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";
import { JewelryDetailClient } from "./client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, published: true }).lean();
  if (!product) return {};
  return {
    title: `${product.brand} ${product.model}`,
    description: product.description || `${product.brand} ${product.model}`,
  };
}

export default async function JewelryDetailPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, category: "JEWELRY", published: true }).lean();
  if (!product) notFound();
  const serialized = JSON.parse(JSON.stringify(product));
  return <JewelryDetailClient product={serialized} />;
}
