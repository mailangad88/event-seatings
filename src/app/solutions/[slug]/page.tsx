import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyerPageView } from "@/components/buyer/BuyerPageView";
import { buyerPagesOf, getBuyerPage } from "@/data/buyer-pages";

export const dynamicParams = false;
export const generateStaticParams = () => buyerPagesOf("solutions").map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getBuyerPage("solutions", (await params).slug);
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/solutions/${page.slug}` } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = getBuyerPage("solutions", (await params).slug);
  if (!page) notFound();
  return <BuyerPageView page={page} />;
}
