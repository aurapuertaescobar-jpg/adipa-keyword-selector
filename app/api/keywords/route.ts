import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const keywords = await prisma.keyword.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            urls: true,
          },
        },
      },
    });

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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Keyword name is required" },
        { status: 400 }
      );
    }

    const existingKeyword = await prisma.keyword.findUnique({
      where: { name: name.trim() },
    });

    if (existingKeyword) {
      return NextResponse.json(
        { error: "Keyword already exists" },
        { status: 400 }
      );
    }

    const keyword = await prisma.keyword.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(keyword, { status: 201 });
  } catch (error) {
    console.error("Error creating keyword:", error);
    return NextResponse.json(
      { error: "Failed to create keyword" },
      { status: 500 }
    );
  }
}
