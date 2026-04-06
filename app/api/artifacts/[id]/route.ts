import { NextResponse } from "next/server";
import { getArtifactById } from "@/lib/store/memory";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const artifact = getArtifactById(id);

  if (!artifact) {
    return NextResponse.json({ error: "Artifact not found." }, { status: 404 });
  }

  return NextResponse.json(artifact);
}

