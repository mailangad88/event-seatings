import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { notFound } from "next/navigation";
import { BuyerPageView } from "@/components/buyer/BuyerPageView";
import { buyerPagesOf, getBuyerPage } from "@/data/buyer-pages";

export const dynamicParams = false;
export const generateStaticParams = () => buyerPagesOf("compare").map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getBuyerPage("compare", (await params).slug);
  if (!page) return {};
  return seo({ title: page.title, description: page.description, alternates: { canonical: `/compare/${page.slug}` } });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = getBuyerPage("compare", (await params).slug);
  if (!page) notFound();
  return <BuyerPageView page={page} />;
}
