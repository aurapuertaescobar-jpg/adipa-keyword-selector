import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const keywordId = resolvedParams.id;

    console.log("Fetching keyword:", keywordId);

    const keyword = await prisma.keyword.findUnique({
      where: { id: keywordId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          include: {
            urls: true,
          },
        },
      },
    });

    if (!keyword) {
      console.log("Keyword not found:", keywordId);
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    console.log("Found keyword with", keyword.versions.length, "versions");

    // Calculate verdict for the latest version
    const latestVersion = keyword.versions[0];
    let verdict = "PENDIENTE";
    if (latestVersion) {
      verdict =
        latestVersion.commercialCount >= 6 ? "NO_FUNCIONA" : "FUNCIONA";
    }

    return NextResponse.json({ ...keyword, latestVerdict: verdict });
  } catch (error) {
    console.error("Error fetching keyword:", error);
    return NextResponse.json(
      { error: "Failed to fetch keyword", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await prisma.keyword.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return NextResponse.json(
      { error: "Failed to delete keyword" },
      { status: 500 }
    );
  }
}
