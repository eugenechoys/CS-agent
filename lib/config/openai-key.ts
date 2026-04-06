import fs from "node:fs";

function parseEnvLine(raw: string) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) {
    return undefined;
  }

  const separator = line.indexOf("=");
  if (separator === -1) {
    return undefined;
  }

  const key = line.slice(0, separator).trim();
  const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
  return { key, value };
}

function readEnvFile(filePath: string) {

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const entries = contents
    .split(/\r?\n/)
    .map(parseEnvLine)
    .filter((entry): entry is { key: string; value: string } => Boolean(entry));

  const match = entries.find((entry) => entry.key === "OPENAI_API_KEY");
  return match?.value;
}

export function getOpenAiApiKey() {
  return (
    process.env.OPENAI_API_KEY ||
    readEnvFile(`${process.cwd()}/.env.local`) ||
    readEnvFile(`${process.cwd()}/.env.example`)
  );
}

export function ensureOpenAiApiKeyLoaded() {
  const apiKey = getOpenAiApiKey();

  if (apiKey && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = apiKey;
  }

  return apiKey;
}
