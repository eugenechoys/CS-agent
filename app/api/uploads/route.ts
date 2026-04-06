import { NextResponse } from "next/server";
import { saveDataset } from "@/lib/store/memory";

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV upload requires a header row and at least one data row.");
  }

  const columns = lines[0].split(",").map((cell) => cell.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((cell) => cell.trim());
    return columns.reduce<Record<string, string>>((accumulator, column, index) => {
      accumulator[column] = values[index] ?? "";
      return accumulator;
    }, {});
  });

  return { columns, rows };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        throw new Error("Expected a CSV file under the `file` field.");
      }

      const text = await file.text();
      const parsed = parseCsv(text);
      const dataset = saveDataset({
        name: file.name,
        source: "upload",
        columns: parsed.columns,
        rows: parsed.rows,
      });

      return NextResponse.json(dataset);
    }

    const body = await request.json();
    const dataset = saveDataset({
      name: body.name ?? "Manual dataset",
      source: "manual",
      columns: body.columns ?? [],
      rows: body.rows ?? [],
    });

    return NextResponse.json(dataset);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

