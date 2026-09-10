import { NextRequest, NextResponse } from "next/server";
import { getKeyword, getVersions, getAnalyzedUrls, deleteKeyword } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const kw = await getKeyword(id);
    const versionList = await getVersions(id);
    const final: any[] = [];
    
    for (const v of versionList || []) {
      const urls = await getAnalyzedUrls(v.id);
      final.push({ ...v, urls });
    }

    return NextResponse.json({ ...kw, versions: final, latestVerdict: final[0]?.verdict || "PENDIENTE" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteKeyword(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
