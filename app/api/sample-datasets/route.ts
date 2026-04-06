import { NextResponse } from "next/server";
import { listSampleDatasets, loadSampleDataset } from "@/lib/store/memory";

export async function GET() {
  return NextResponse.json({
    datasets: listSampleDatasets(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = String(body.key ?? "");

    if (!key) {
      throw new Error("Sample dataset key is required.");
    }

    return NextResponse.json(loadSampleDataset(key));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load sample dataset.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

