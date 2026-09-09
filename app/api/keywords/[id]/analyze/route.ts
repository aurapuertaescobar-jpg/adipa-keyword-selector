import { NextRequest, NextResponse } from "next/server";
import { getKeyword, getVersions, createVersion } from "@/lib/db";
import { fetchSerpResults, fetchUrlContent, type PageMetadata } from "@/lib/semrush";
import { classifyUrl } from "@/lib/claude";

const COUNTRIES = ["Chile", "México", "Colombia", "Argentina"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const keyword = await getKeyword(id);
    const versions = await getVersions(id);

    const nextVersionNumber = (versions[0]?.version_number || 0) + 1;

    const urlsToAnalyze: any[] = [];
    let commercialCount = 0;

    for (const country of COUNTRIES) {
      const serpResults = await fetchSerpResults(keyword.name, country);

      for (const result of serpResults) {
        let pageMetadata: PageMetadata | null = null;
        try {
          pageMetadata = await fetchUrlContent(result.url);
        } catch (error) {
          console.error(`Error fetching content from ${result.url}:`, error);
        }

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

    const version = await createVersion(
      id,
      nextVersionNumber,
      commercialCount >= 6 ? "NO_FUNCIONA" : "FUNCIONA",
      commercialCount,
      urlsToAnalyze
    );

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error("Error analyzing keyword:", error);
    return NextResponse.json(
      { error: "Failed to analyze keyword" },
      { status: 500 }
    );
  }
}
