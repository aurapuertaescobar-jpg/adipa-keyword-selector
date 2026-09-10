import { NextRequest, NextResponse } from "next/server";
import { getKeyword, getVersions, getAnalyzedUrls, deleteKeyword } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const keyword = await getKeyword(id);
    const versions = await getVersions(id);

    const versionsWithUrls = await Promise.all(
      versions.map(async (version: any) => ({
        ...version,
        urls: await getAnalyzedUrls(version.id),
      }))
    );

    let verdict = "PENDIENTE";
    if (versionsWithUrls[0]) {
      verdict = versionsWithUrls[0].verdict || "PENDIENTE";
    }

    return NextResponse.json({
      ...keyword,
      versions: versionsWithUrls,
      latestVerdict: verdict,
    });
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
    const { id } = await params;
    await deleteKeyword(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return NextResponse.json(
      { error: "Failed to delete keyword" },
      { status: 500 }
    );
  }
}
