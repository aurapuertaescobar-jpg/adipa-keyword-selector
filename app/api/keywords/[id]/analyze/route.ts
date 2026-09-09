import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchSerpResults, fetchUrlContent, type PageMetadata } from "@/lib/semrush";
import { classifyUrl } from "@/lib/claude";

const COUNTRIES = ["Chile", "México", "Colombia", "Argentina"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const keyword = await prisma.keyword.findUnique({
      where: { id: resolvedParams.id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!keyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    // Calculate next version number
    const nextVersionNumber =
      (keyword.versions[0]?.versionNumber || 0) + 1;

    const urlsToAnalyze: Array<{
      country: string;
      position: number;
      url: string;
      keywords: string;
      classification: string;
      observation: string;
      alert: boolean;
    }> = [];

    let commercialCount = 0;

    // Fetch SERP and classify for each country
    for (const country of COUNTRIES) {
      const serpResults = await fetchSerpResults(keyword.name, country);

      for (const result of serpResults) {
        // Fetch detailed metadata from URL
        let pageMetadata: PageMetadata | null = null;
        try {
          pageMetadata = await fetchUrlContent(result.url);
        } catch (error) {
          console.error(`Error fetching content from ${result.url}:`, error);
        }

        // Classify using Ollama with metadata
        const classificationResult = await classifyUrl(result.url, pageMetadata);

        const isCommercial = classificationResult.classification === "Comercial";
        if (isCommercial) commercialCount++;

        urlsToAnalyze.push({
          country,
          position: result.position,
          url: result.url,
          keywords: result.title || result.description || keyword.name,
          classification: classificationResult.classification,
          observation: classificationResult.observation,
          alert: isCommercial,
        });
      }
    }

    // Create version with analyzed URLs
    const version = await prisma.version.create({
      data: {
        keywordId: keyword.id,
        versionNumber: nextVersionNumber,
        verdict:
          commercialCount >= 6 ? "NO_FUNCIONA" : "FUNCIONA",
        commercialCount,
        urls: {
          createMany: {
            data: urlsToAnalyze,
          },
        },
      },
      include: {
        urls: true,
      },
    });

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error("Error analyzing keyword:", error);
    return NextResponse.json(
      { error: "Failed to analyze keyword" },
      { status: 500 }
    );
  }
}
