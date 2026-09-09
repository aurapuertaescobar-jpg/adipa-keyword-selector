import { NextRequest, NextResponse } from "next/server";
import { getKeywords, createKeyword } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const keywords = await getKeywords();
    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      { error: "Failed to fetch keywords" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body;

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: "keywords array is required" },
        { status: 400 }
      );
    }

    const created = await Promise.all(
      keywords.map((name: string) => createKeyword(name.trim()))
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating keywords:", error);
    return NextResponse.json(
      { error: "Failed to create keywords" },
      { status: 500 }
    );
  }
}
